"""
Packet Simulation Engine for NetPath AI.
Coordinates Packet validation, OSI Layer transitions, Topology trajectory,
Packet Drop/Loss Simulation, and Retransmission cycles.
"""

import re
import uuid
from typing import Dict, Any, List, Optional
from .topology import NetworkTopology
from .encapsulation import EncapsulationEngine
from .metrics import NetworkMetricsEngine

IP_REGEX = r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
MAC_REGEX = r"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"

class PacketEngine:
    def __init__(self, topology: Optional[NetworkTopology] = None):
        self.topology = topology or NetworkTopology()

    @staticmethod
    def validate_packet_input(data: Dict[str, Any]) -> Tuple_Result:
        """Validates all input packet fields, returns (is_valid, errors_dict)."""
        errors = {}
        src_ip = data.get("source_ip", "")
        dst_ip = data.get("destination_ip", "")
        src_port = data.get("source_port", 5000)
        dst_port = data.get("destination_port", 80)
        packet_size = data.get("packet_size", 1024)
        ttl = data.get("ttl", 64)

        if not src_ip or not re.match(IP_REGEX, str(src_ip).strip()):
            errors["source_ip"] = "Invalid Source IPv4 Address format (e.g. 192.168.1.10)."
        if not dst_ip or not re.match(IP_REGEX, str(dst_ip).strip()):
            errors["destination_ip"] = "Invalid Destination IPv4 Address format (e.g. 192.168.2.20)."
        
        try:
            p_src = int(src_port)
            if not (1 <= p_src <= 65535):
                errors["source_port"] = "Source Port must be between 1 and 65535."
        except (ValueError, TypeError):
            errors["source_port"] = "Source Port must be an integer."

        try:
            p_dst = int(dst_port)
            if not (1 <= p_dst <= 65535):
                errors["destination_port"] = "Destination Port must be between 1 and 65535."
        except (ValueError, TypeError):
            errors["destination_port"] = "Destination Port must be an integer."

        try:
            psize = int(packet_size)
            if not (64 <= psize <= 9000):
                errors["packet_size"] = "Packet size must be between 64 bytes and 9000 bytes (Jumbo frame limit)."
        except (ValueError, TypeError):
            errors["packet_size"] = "Packet size must be an integer."

        try:
            pttl = int(ttl)
            if not (1 <= pttl <= 255):
                errors["ttl"] = "TTL must be between 1 and 255."
        except (ValueError, TypeError):
            errors["ttl"] = "TTL must be an integer."

        if not data.get("payload", "").strip():
            errors["payload"] = "Payload / message cannot be empty."

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
        flags = scenario_flags or {}
        packet_id = packet_data.get("packet_id") or f"PKT-{uuid.uuid4().hex[:6].upper()}"
        
        src_node = packet_data.get("source_node", "PC1")
        dst_node = packet_data.get("destination_node", "Server1")

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
            base_link_latency=routing_result["latency"]
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
        simulate_drop = flags.get("simulate_drop", False) or (metrics["packet_loss"] >= 20.0 and random_boolean(0.85))
        drop_hop_index = len(path_nodes) // 2 if len(path_nodes) > 2 else 1

        for i in range(len(path_nodes) - 1):
            curr_n = path_nodes[i]
            next_n = path_nodes[i+1]
            curr_info = self.topology.nodes.get(curr_n, {})
            next_info = self.topology.nodes.get(next_n, {})

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
                if protocol == "TCP":
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

        # Phase C: Destination Host Decapsulation (Physical -> Application)
        for dec_step in encapsulation_data["decapsulation_steps"]:
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
            "encapsulation": encapsulation_data,
            "metrics": metrics,
            "trajectory": trajectory,
            "total_steps": len(trajectory)
        }

def random_boolean(prob: float = 0.5) -> bool:
    import random
    return random.random() < prob
