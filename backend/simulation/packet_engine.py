"""
Packet Simulation Engine for NetPath AI.
Coordinates Packet validation, OSI Layer transitions, Topology trajectory,
Packet Drop/Loss Simulation, and Retransmission cycles.
"""

import uuid
from ipaddress import IPv4Address
from validation import number, scenario_flags as validate_flags
from typing import Dict, Any, List, Optional, Tuple
from .topology import NetworkTopology
from .encapsulation import EncapsulationEngine
from .metrics import NetworkMetricsEngine

class PacketEngine:
    def __init__(self, topology: Optional[NetworkTopology] = None):
        self.topology = topology or NetworkTopology()

    @staticmethod
    def validate_packet_input(data: Dict[str, Any]) -> Tuple[bool, Dict[str, str]]:
        """Validates all input packet fields, returns (is_valid, errors_dict)."""
        errors = {}
        if not isinstance(data, dict):
            return False, {"body": "Expected a JSON object."}
        for key in ("source_ip", "destination_ip"):
            try:
                if not isinstance(data.get(key), str):
                    raise ValueError()
                IPv4Address(data[key])
            except (ValueError, TypeError):
                errors[key] = "A valid IPv4 address is required."
        for key, default, low, high in (("source_port", 5000, 1, 65535), ("destination_port", 80, 1, 65535),
                                       ("packet_size", 1024, 64, 9000), ("ttl", 64, 1, 255)):
            try:
                data[key] = number(data.get(key, default), key, low, high, integer=True)
            except ValueError as exc:
                errors[key] = str(exc)
        if not isinstance(data.get("payload"), str) or not data["payload"].strip():
            errors["payload"] = "Payload / message cannot be empty."
        protocol = data.get("protocol", "TCP")
        if not isinstance(protocol, str) or protocol.upper() not in ("TCP", "UDP", "ICMP"):
            errors["protocol"] = "Protocol must be TCP, UDP or ICMP."
        else:
            data["protocol"] = protocol.upper()
        if not isinstance(data.get("app_protocol", "HTTP"), str):
            errors["app_protocol"] = "Application protocol must be a string."
        for key in ("source_node", "destination_node"):
            if key in data and not isinstance(data[key], str):
                errors[key] = "Node ID must be a string."
        try:
            validate_flags(data.get("scenario_flags", {}))
        except ValueError as exc:
            errors["scenario_flags"] = str(exc)
        return len(errors) == 0, errors

    def simulate_journey(
        self,
        packet_data: Dict[str, Any],
        scenario_flags: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes a complete journey simulation.
        Produces full trajectory steps for animation:
        1. Encapsulation descending L7 -> L1
        2. Topology transmission along nodes (PC -> SW -> R1 -> R2 -> SW2 -> Server)
        3. Potential Packet Drop / Retransmission events
        4. Decapsulation ascending L1 -> L7 at Destination
        """
        flags = validate_flags(scenario_flags or {})
        packet_data = dict(packet_data)
        packet_id = f"PKT-{uuid.uuid4().hex.upper()}"
        
        by_ip = {node["ip"]: key for key, node in self.topology.nodes.items()}
        src_node = packet_data.get("source_node", by_ip.get(packet_data.get("source_ip")))
        dst_node = packet_data.get("destination_node", by_ip.get(packet_data.get("destination_ip")))
        for key, node in (("source", src_node), ("destination", dst_node)):
            if node not in self.topology.nodes or self.topology.nodes[node]["ip"] != packet_data.get(f"{key}_ip"):
                return {"success": False, "error": f"{key} IP and node must identify the same topology device."}
            packet_data[f"{key}_node"] = node
        packet_data["source_mac"] = self.topology.nodes[src_node]["mac"]

        # 1. Routing via Dijkstra
        routing_result = self.topology.find_shortest_path(src_node, dst_node)
        if not routing_result["success"]:
            return {
                "packet_id": packet_id,
                "success": False,
                "error": routing_result["message"],
                "trajectory": [],
                "metrics": None
            }

        path_nodes = routing_result["path"]
        hops = len(path_nodes) - 1
        packet_data["destination_mac"] = self.topology.nodes[path_nodes[min(1, hops)]]["mac"]

        # 2. Encapsulation & Decapsulation data
        encapsulation_data = EncapsulationEngine.generate_layers(packet_data)

        # 3. Telemetry & Metrics Calculation
        loss_override = flags.get("loss_override")
        congestion_factor = flags.get("congestion_factor", 0.0)
        weak_link = flags.get("weak_link", False)
        protocol = packet_data.get("protocol", "TCP").upper()
        
        metrics = NetworkMetricsEngine.calculate_telemetry(
            hops=hops,
            packet_size=int(packet_data.get("packet_size", 1024)),
            protocol=protocol,
            congestion_factor=congestion_factor,
            loss_override=loss_override,
            weak_link=weak_link,
            base_link_latency=routing_result["latency"] + flags.get("propagation_delay_ms", 0),
            bandwidth_mbps=routing_result["bandwidth_mbps"],
            path_loss=routing_result["packet_loss"],
            initial_ttl=int(packet_data.get("ttl", 64)),
            router_hops=sum(self.topology.nodes[n]["type"] == "router" for n in path_nodes[1:-1]),
            force_drop=flags.get("simulate_drop", False)
        )

        # 4. Trajectory Step Generation for UI Animation
        trajectory: List[Dict[str, Any]] = []
        step_idx = 1

        # Phase A: Source Host Encapsulation (Application -> Physical)
        for enc_step in encapsulation_data["encapsulation_steps"]:
            trajectory.append({
                "step_index": step_idx,
                "phase": "ENCAPSULATION",
                "current_node": src_node,
                "layer": enc_step["layer"],
                "action": enc_step["action"],
                "visual": enc_step["visual"],
                "status": "in_progress",
                "description": f"Source Host ({src_node}) processing {enc_step['layer']} encapsulation."
            })
            step_idx += 1

        # Phase B: Physical Network Node Hops
        simulate_drop = metrics["status"] == "DROPPED" or metrics["retransmissions"] > 0
        drop_hop_index = min(len(path_nodes) // 2, max(0, hops - 1))
        remaining_ttl = int(packet_data.get("ttl", 64))
        traversed_path = [src_node]

        for i in range(len(path_nodes) - 1):
            curr_n = path_nodes[i]
            next_n = path_nodes[i+1]
            curr_info = self.topology.nodes.get(curr_n, {})
            next_info = self.topology.nodes.get(next_n, {})

            if i > 0 and curr_info.get("type") == "router":
                remaining_ttl -= 1
                if remaining_ttl == 0:
                    metrics.update(status="DROPPED_TTL_EXPIRED", ttl=0, throughput=0.0, retransmissions=0)
                    trajectory.append({"step_index": step_idx, "phase": "TTL_EXPIRED", "current_node": curr_n,
                                       "layer": "Network (L3)", "action": "TTL expired; packet discarded",
                                       "visual": "TTL = 0", "status": "dropped", "description": "Router cannot forward a packet with TTL 0."})
                    break

            # Check if drop occurs at this middle link
            if simulate_drop and i == drop_hop_index:
                trajectory.append({
                    "step_index": step_idx,
                    "phase": "PACKET_LOSS",
                    "current_node": curr_n,
                    "target_node": next_n,
                    "layer": "Physical Link / Queue",
                    "action": f"\u274c PACKET DROPPED between {curr_n} and {next_n} (Buffer overflow / CRC Error)",
                    "visual": f"[X] DROP on Link ({curr_n} \u2192 {next_n})",
                    "status": "dropped",
                    "description": f"Network buffer overflow on link {curr_n} -> {next_n}. Packet discarded!"
                })
                step_idx += 1

                # If TCP, initiate Retransmission
                if protocol == "TCP" and metrics["status"] != "DROPPED":
                    trajectory.append({
                        "step_index": step_idx,
                        "phase": "RETRANSMISSION",
                        "current_node": src_node,
                        "target_node": next_n,
                        "layer": "Transport (TCP)",
                        "action": f"\u23f1\ufe0f TCP Retransmission Timeout (RTO) expired. Resending Segment from {src_node}...",
                        "visual": f"[TCP RETRANSMIT #1] Resending {packet_data.get('payload', 'DATA')}",
                        "status": "retransmitting",
                        "description": f"TCP Fast Retransmit / RTO triggered. Retransmission count incremented to {metrics['retransmissions'] or 1}."
                    })
                    step_idx += 1
                    # Resend successfully on retry
                    simulate_drop = False # delivered on 2nd attempt
                else:
                    break

            trajectory.append({
                "step_index": step_idx,
                "phase": "TOPOLOGY_HOP",
                "current_node": curr_n,
                "target_node": next_n,
                "layer": "Data Link & Physical Hop",
                "action": f"Transmitting frame from {curr_info.get('label', curr_n)} \u2192 {next_info.get('label', next_n)}",
                "visual": f"({curr_n}) =====[ PACKET ]=====\u27a1 ({next_n})",
                "status": "active",
                "description": f"Layer 2 frame traversing link. Next-hop MAC updated. Hop Latency: ~{metrics['latency'] / hops:.1f}ms."
            })
            step_idx += 1
            traversed_path.append(next_n)

        metrics["ttl"] = remaining_ttl
        metrics["hops"] = len(traversed_path) - 1

        # Phase C: Destination Host Decapsulation (Physical -> Application)
        for dec_step in encapsulation_data["decapsulation_steps"] if metrics["status"].startswith("DELIVERED") else []:
            trajectory.append({
                "step_index": step_idx,
                "phase": "DECAPSULATION",
                "current_node": dst_node,
                "layer": dec_step["layer"],
                "action": dec_step["action"],
                "visual": dec_step["visual"],
                "status": "delivered",
                "description": f"Destination Host ({dst_node}) processing {dec_step['layer']} decapsulation."
            })
            step_idx += 1

        return {
            "packet_id": packet_id,
            "success": True,
            "packet_data": packet_data,
            "routing": routing_result,
            "traversed_path": traversed_path,
            "encapsulation": encapsulation_data,
            "metrics": metrics,
            "trajectory": trajectory,
            "total_steps": len(trajectory)
        }
