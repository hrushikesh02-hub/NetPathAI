"""
Realistic Network Metrics and Telemetry Engine for NetPath AI.
Calculates propagation, transmission, queueing delay, jitter, loss %, throughput, and retransmissions.
"""

import random
from typing import Dict, Any, List

class NetworkMetricsEngine:
    @staticmethod
    def calculate_telemetry(
        hops: int,
        packet_size: int,
        protocol: str = "TCP",
        congestion_factor: float = 0.0,
        loss_override: float = None,
        weak_link: bool = False,
        base_link_latency: float = 10.0
    ) -> Dict[str, Any]:
        """
        Computes realistic, physically grounded network parameters.
        - hops: integer count of routing/switching hops
        - packet_size: size in bytes (e.g. 64 to 1500)
        - protocol: 'TCP' or 'UDP'
        - congestion_factor: 0.0 (idle) to 1.0 (severe congestion)
        - loss_override: optional forced loss % (e.g. 20.0)
        - weak_link: simulates physical degradation / RF interference
        """
        hops = max(1, hops)
        packet_size = max(64, min(9000, packet_size))
        
        # 1. Propagation Delay (per hop ~ 2 - 8 ms)
        prop_delay = hops * (base_link_latency / 2.0)
        
        # 2. Transmission Delay (Size in bits / Bandwidth)
        # Assuming nominal 100-1000 Mbps core links
        effective_bandwidth_mbps = max(5.0, 500.0 * (1.0 - 0.8 * congestion_factor))
        if weak_link:
            effective_bandwidth_mbps = min(effective_bandwidth_mbps, 15.0)
            
        trans_delay = (packet_size * 8) / (effective_bandwidth_mbps * 1000.0) # in ms
        
        # 3. Queueing & Processing Delay (explodes as congestion_factor approaches 1.0)
        queue_delay = hops * (1.5 + (congestion_factor ** 2.2) * 180.0)
        if weak_link:
            queue_delay += random.uniform(25.0, 60.0)
            
        # Processing Delay (routing lookups per router)
        proc_delay = hops * 0.8
        
        # Total Latency
        raw_latency = prop_delay + trans_delay + queue_delay + proc_delay
        # Add slight natural jitter
        jitter = round(max(0.5, (raw_latency * 0.12) + (congestion_factor * 45.0) + (15.0 if weak_link else 0.0)), 2)
        total_latency = round(raw_latency + random.uniform(-jitter * 0.2, jitter * 0.3), 2)
        total_latency = max(5.0, total_latency)

        # 4. Packet Loss Percentage
        if loss_override is not None:
            packet_loss = float(loss_override)
        else:
            base_loss = 0.0
            if weak_link:
                base_loss += random.uniform(8.0, 22.0)
            if congestion_factor > 0.3:
                base_loss += (congestion_factor - 0.3) * 35.0
            packet_loss = round(min(100.0, max(0.0, base_loss)), 2)

        # 5. Throughput (Mbps)
        # Mathis equation approximation: Throughput <= (MSS / RTT) * (C / sqrt(Loss))
        if packet_loss >= 100.0:
            throughput = 0.0
        else:
            loss_ratio = max(0.001, packet_loss / 100.0)
            ideal_tp = effective_bandwidth_mbps
            degraded_tp = ideal_tp * max(0.05, 1.0 - (loss_ratio * 2.5)) * max(0.1, 100.0 / (total_latency + 10.0))
            throughput = round(max(0.2, min(ideal_tp, degraded_tp)), 2)

        # 6. Retransmissions (for TCP)
        retransmissions = 0
        if protocol.upper() == "TCP":
            if packet_loss > 0.0:
                # Expected retransmission attempts for dropped segment
                retransmissions = int((packet_loss / 5.0) + (congestion_factor * 6))
                if packet_loss >= 15.0 and retransmissions < 1:
                    retransmissions = 1
                if packet_loss >= 50.0:
                    retransmissions = random.randint(3, 8)
        else:
            retransmissions = 0 # UDP does not retransmit

        # 7. TTL decrement
        initial_ttl = 64
        final_ttl = max(0, initial_ttl - hops)

        # 8. Delivery Status
        if packet_loss >= 95.0 or (protocol.upper() == "UDP" and packet_loss > 0 and random.random() < (packet_loss / 100.0)):
            delivery_status = "DROPPED"
        elif retransmissions > 0 and protocol.upper() == "TCP":
            delivery_status = "DELIVERED_WITH_RETRANSMISSION"
        else:
            delivery_status = "DELIVERED"

        return {
            "packet_size": packet_size,
            "latency": total_latency,
            "packet_loss": packet_loss,
            "throughput": throughput,
            "retransmissions": retransmissions,
            "hops": hops,
            "ttl": final_ttl,
            "jitter": jitter,
            "status": delivery_status,
            "effective_bandwidth_mbps": round(effective_bandwidth_mbps, 2)
        }
