"""
REST API Endpoints for NetPath AI.
Exposes routes for packet simulation, routing, AI inference, topology manipulation, and history.
"""

from flask import Blueprint, request, jsonify
import traceback

from simulation.topology import NetworkTopology
from simulation.encapsulation import EncapsulationEngine
from simulation.packet_engine import PacketEngine
from simulation.scenarios import SCENARIOS
from ai.analyzer import NetworkAIAnalyzer
from database.db import (
    save_simulation_record,
    get_simulation_history,
    get_simulation_by_id,
    delete_simulation_record,
    clear_all_history,
    get_dashboard_summary
)

api_bp = Blueprint("api", __name__, url_prefix="/api")

# Shared singletons
global_topology = NetworkTopology()
global_engine = PacketEngine(global_topology)
global_ai = NetworkAIAnalyzer()

@api_bp.route("/health", methods=["GET"])
def health_check():
    """System health check and module status."""
    return jsonify({
        "status": "healthy",
        "service": "NetPath AI Backend",
        "version": "1.0.0",
        "ml_model_active": global_ai.is_ml_active,
        "database": "SQLite (operational)",
        "topology_nodes_count": len(global_topology.nodes)
    }), 200

@api_bp.route("/topology", methods=["GET"])
def get_topology():
    """Returns the current network topology graph."""
    return jsonify({
        "success": True,
        "topology": global_topology.to_dict()
    }), 200

@api_bp.route("/topology/failure", methods=["POST"])
def toggle_topology_failure():
    """Toggles active/disabled state of a node (e.g. Router 2)."""
    data = request.get_json() or {}
    node_id = data.get("node_id")
    is_active = bool(data.get("is_active", True))

    if not node_id or node_id not in global_topology.nodes:
        return jsonify({"success": False, "error": f"Node ID '{node_id}' not found."}), 400

    global_topology.set_node_status(node_id, is_active)

    # Recalculate default path PC1 -> Server1 for instant feedback
    path_result = global_topology.find_shortest_path("PC1", "Server1")

    return jsonify({
        "success": True,
        "node_id": node_id,
        "new_status": "online" if is_active else "offline",
        "topology": global_topology.to_dict(),
        "recalculated_path": path_result
    }), 200

@api_bp.route("/packet/create", methods=["POST"])
def create_packet():
    """Validates parameters and builds structured packet encapsulation data."""
    data = request.get_json() or {}
    is_valid, errors = PacketEngine.validate_packet_input(data)

    if not is_valid:
        return jsonify({
            "success": False,
            "errors": errors,
            "message": "Validation failed on packet fields."
        }), 422

    encapsulation_data = EncapsulationEngine.generate_layers(data)
    return jsonify({
        "success": True,
        "packet_data": data,
        "encapsulation": encapsulation_data
    }), 200

@api_bp.route("/packet/simulate", methods=["POST"])
@api_bp.route("/packet/journey", methods=["POST"])
def simulate_packet_journey():
    """
    Full packet journey execution.
    Computes route -> generates trajectory -> calculates metrics -> runs AI analysis -> persists to DB.
    """
    try:
        data = request.get_json() or {}
        scenario_flags = data.get("scenario_flags", {})

        is_valid, errors = PacketEngine.validate_packet_input(data)
        if not is_valid:
            return jsonify({
                "success": False,
                "errors": errors,
                "message": "Packet validation error."
            }), 422

        # Check if router should be disabled by scenario
        if scenario_flags.get("disable_router"):
            dis_node = scenario_flags["disable_router"]
            global_topology.set_node_status(dis_node, False)
        elif "disable_router" in scenario_flags and scenario_flags["disable_router"] is None:
            # Re-enable all nodes if not specified
            for n in list(global_topology.disabled_nodes):
                global_topology.set_node_status(n, True)

        # Run journey simulation
        sim_result = global_engine.simulate_journey(data, scenario_flags)
        if not sim_result["success"]:
            return jsonify({
                "success": False,
                "error": sim_result["error"],
                "message": "Routing failed or destination unreachable."
            }), 400

        # AI Analysis on resulting metrics
        metrics = sim_result["metrics"]
        ai_result = global_ai.analyze_metrics(metrics)

        # Persist run to SQLite history
        db_record = {
            "packet_id": sim_result["packet_id"],
            "source_ip": data.get("source_ip"),
            "destination_ip": data.get("destination_ip"),
            "protocol": data.get("protocol", "TCP"),
            "app_protocol": data.get("app_protocol", "HTTP"),
            "payload": data.get("payload", ""),
            "packet_size": metrics["packet_size"],
            "latency": metrics["latency"],
            "packet_loss": metrics["packet_loss"],
            "throughput": metrics["throughput"],
            "retransmissions": metrics["retransmissions"],
            "hops": metrics["hops"],
            "ttl": metrics["ttl"],
            "jitter": metrics["jitter"],
            "status": metrics["status"],
            "ai_status": ai_result["status"],
            "ai_health": ai_result["health_status"],
            "ai_risk": ai_result["risk_level"],
            "ai_confidence": ai_result["confidence"],
            "ai_reason": ai_result["reason"],
            "ai_recommendation": ai_result["recommendation"],
            "path_taken": sim_result["routing"]["path"]
        }
        record_id = save_simulation_record(db_record)

        return jsonify({
            "success": True,
            "record_id": record_id,
            "simulation": sim_result,
            "ai_analysis": ai_result
        }), 200

    except Exception as e:
        print("Simulation error:", traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Internal simulation error."
        }), 500

@api_bp.route("/ai/analyze", methods=["POST"])
@api_bp.route("/ai/classify", methods=["POST"])
def ai_analyze():
    """Manual or external AI telemetry analyzer endpoint."""
    try:
        data = request.get_json() or {}
        analysis = global_ai.analyze_metrics(data)
        return jsonify({
            "success": True,
            "analysis": analysis
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@api_bp.route("/metrics", methods=["GET"])
def get_metrics_summary():
    """Fetches dashboard summary stats and latest telemetry averages."""
    try:
        summary = get_dashboard_summary()
        return jsonify({
            "success": True,
            "summary": summary
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@api_bp.route("/scenarios", methods=["GET"])
def get_scenarios():
    """Lists all available preset simulation scenarios."""
    return jsonify({
        "success": True,
        "scenarios": list(SCENARIOS.values())
    }), 200

@api_bp.route("/scenario/run", methods=["POST"])
def run_scenario():
    """Executes a preset scenario by ID."""
    data = request.get_json() or {}
    scenario_id = data.get("scenario_id", "NORMAL")

    if scenario_id not in SCENARIOS:
        return jsonify({"success": False, "error": f"Scenario '{scenario_id}' not found."}), 404

    scenario = SCENARIOS[scenario_id]
    packet_params = scenario["params"]
    scenario_flags = scenario["flags"]

    # If router failure scenario, disable R2
    if scenario_flags.get("disable_router"):
        global_topology.set_node_status(scenario_flags["disable_router"], False)
    else:
        # Re-enable all
        for n in list(global_topology.disabled_nodes):
            global_topology.set_node_status(n, True)

    sim_result = global_engine.simulate_journey(packet_params, scenario_flags)
    if not sim_result["success"]:
        return jsonify({
            "success": False,
            "error": sim_result["error"],
            "scenario": scenario
        }), 400

    ai_result = global_ai.analyze_metrics(sim_result["metrics"])

    # Save to history
    metrics = sim_result["metrics"]
    db_record = {
        "packet_id": sim_result["packet_id"],
        "source_ip": packet_params["source_ip"],
        "destination_ip": packet_params["destination_ip"],
        "protocol": packet_params["protocol"],
        "app_protocol": packet_params["app_protocol"],
        "payload": packet_params["payload"],
        "packet_size": metrics["packet_size"],
        "latency": metrics["latency"],
        "packet_loss": metrics["packet_loss"],
        "throughput": metrics["throughput"],
        "retransmissions": metrics["retransmissions"],
        "hops": metrics["hops"],
        "ttl": metrics["ttl"],
        "jitter": metrics["jitter"],
        "status": metrics["status"],
        "ai_status": ai_result["status"],
        "ai_health": ai_result["health_status"],
        "ai_risk": ai_result["risk_level"],
        "ai_confidence": ai_result["confidence"],
        "ai_reason": ai_result["reason"],
        "ai_recommendation": ai_result["recommendation"],
        "path_taken": sim_result["routing"]["path"]
    }
    record_id = save_simulation_record(db_record)

    return jsonify({
        "success": True,
        "scenario": scenario,
        "record_id": record_id,
        "simulation": sim_result,
        "ai_analysis": ai_result
    }), 200

@api_bp.route("/history", methods=["GET"])
def get_history():
    """Fetches simulation history logs."""
    limit = int(request.args.get("limit", 50))
    offset = int(request.args.get("offset", 0))
    history = get_simulation_history(limit, offset)
    return jsonify({
        "success": True,
        "count": len(history),
        "history": history
    }), 200

@api_bp.route("/history/<int:record_id>", methods=["GET", "DELETE"])
def handle_single_history(record_id):
    """Retrieves or deletes a single history entry."""
    if request.method == "GET":
        record = get_simulation_by_id(record_id)
        if not record:
            return jsonify({"success": False, "error": "Record not found"}), 404
        return jsonify({"success": True, "record": record}), 200
    else:
        success = delete_simulation_record(record_id)
        return jsonify({"success": success}), 200

@api_bp.route("/history/clear", methods=["POST"])
def clear_history():
    """Clears all history entries."""
    clear_all_history()
    return jsonify({"success": True, "message": "History cleared."}), 200
