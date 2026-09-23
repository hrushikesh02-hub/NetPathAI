"""
Preset Network Scenarios for NetPath AI.
Configures targeted fault injection, delay profiles, and topology mutations.
"""

from typing import Dict, Any

SCENARIOS: Dict[str, Dict[str, Any]] = {
    "NORMAL": {
        "id": "NORMAL",
        "title": "Normal Baseline Network",
        "description": "Standard optimal network operation with minimal latency, 0% packet loss, high bandwidth, and zero retransmissions.",
        "badge": "Healthy",
        "badge_color": "emerald",
        "params": {
            "source_ip": "192.168.1.10",
            "destination_ip": "192.168.2.20",
            "source_port": 5000,
            "destination_port": 80,
            "protocol": "TCP",
            "app_protocol": "HTTP",
            "payload": "GET /api/v1/status HTTP/1.1",
            "packet_size": 1024,
            "ttl": 64
        },
        "flags": {
            "congestion_factor": 0.0,
            "loss_override": 0.0,
            "weak_link": False,
            "simulate_drop": False,
            "disable_router": None
        }
    },
    "HIGH_LATENCY": {
        "id": "HIGH_LATENCY",
        "title": "High Latency (Satellite / Long-Haul WAN)",
        "description": "Simulates trans-continental or satellite link degradation with increased propagation delay (250-450ms) and high jitter.",
        "badge": "Latency Spike",
        "badge_color": "amber",
        "params": {
            "source_ip": "192.168.1.10",
            "destination_ip": "192.168.2.20",
            "source_port": 5000,
            "destination_port": 443,
            "protocol": "TCP",
            "app_protocol": "HTTPS",
            "payload": "SYN_REQUEST_WAN_TELEMETRY",
            "packet_size": 1420,
            "ttl": 58
        },
        "flags": {
            "congestion_factor": 0.4,
            "loss_override": 1.5,
            "weak_link": False,
            "simulate_drop": False,
            "disable_router": None
        }
    },
    "PACKET_LOSS": {
        "id": "PACKET_LOSS",
        "title": "Packet Loss & TCP Retransmission",
        "description": "Simulates intermediate queue drop / CRC frame corruption with subsequent TCP Fast Retransmit recovery.",
        "badge": "Loss & Recovery",
        "badge_color": "rose",
        "params": {
            "source_ip": "192.168.1.10",
            "destination_ip": "192.168.2.20",
            "source_port": 5000,
            "destination_port": 80,
            "protocol": "TCP",
            "app_protocol": "HTTP",
            "payload": "DATABASE_BACKUP_CHUNK_04",
            "packet_size": 1400,
            "ttl": 64
        },
        "flags": {
            "congestion_factor": 0.5,
            "loss_override": 25.0,
            "weak_link": False,
            "simulate_drop": True,
            "disable_router": None
        }
    },
    "CONGESTION": {
        "id": "CONGESTION",
        "title": "Severe Network Congestion",
        "description": "High traffic volume saturation causing router queue overflow, reduced throughput (30-40 Mbps), 15%+ loss, and elevated jitter.",
        "badge": "Critical Congestion",
        "badge_color": "red",
        "params": {
            "source_ip": "192.168.1.10",
            "destination_ip": "192.168.2.20",
            "source_port": 5120,
            "destination_port": 8080,
            "protocol": "TCP",
            "app_protocol": "HTTP",
            "payload": "4K_VIDEO_STREAM_FRAME_883",
            "packet_size": 1500,
            "ttl": 55
        },
        "flags": {
            "congestion_factor": 0.85,
            "loss_override": 18.0,
            "weak_link": False,
            "simulate_drop": True,
            "disable_router": None
        }
    },
    "ROUTER_FAILURE": {
        "id": "ROUTER_FAILURE",
        "title": "Core Router Failure & Failover Route",
        "description": "Primary Core Router R2 goes offline. Routing engine detects topology fault and automatically re-routes traffic via Core Router R3 using Dijkstra.",
        "badge": "Topology Failover",
        "badge_color": "purple",
        "params": {
            "source_ip": "192.168.1.10",
            "destination_ip": "192.168.2.20",
            "source_port": 5000,
            "destination_port": 80,
            "protocol": "TCP",
            "app_protocol": "HTTP",
            "payload": "MISSION_CRITICAL_PAYLOAD",
            "packet_size": 1024,
            "ttl": 64
        },
        "flags": {
            "congestion_factor": 0.2,
            "loss_override": 2.0,
            "weak_link": False,
            "simulate_drop": False,
            "disable_router": "R2"
        }
    },
    "HIGH_RETRANSMISSION": {
        "id": "HIGH_RETRANSMISSION",
        "title": "Excessive TCP Retransmission",
        "description": "Asymmetric duplex mismatch or noisy wireless physical link causing frequent ACK timeouts and multiple segment retransmissions.",
        "badge": "TCP Degradation",
        "badge_color": "orange",
        "params": {
            "source_ip": "192.168.1.15",
            "destination_ip": "192.168.2.20",
            "source_port": 5500,
            "destination_port": 21,
            "protocol": "TCP",
            "app_protocol": "FTP",
            "payload": "FTP_DATA_PORT_PASV_BIN_SYNC",
            "packet_size": 1024,
            "ttl": 60
        },
        "flags": {
            "congestion_factor": 0.6,
            "loss_override": 22.0,
            "weak_link": True,
            "simulate_drop": True,
            "disable_router": None
        }
    },
    "WEAK_LINK": {
        "id": "WEAK_LINK",
        "title": "Weak Wireless / Physical Link Degradation",
        "description": "Simulates low SNR, radio frequency interference, or damaged ethernet cabling with oscillating latency and intermittent packet drops.",
        "badge": "Link Flapping",
        "badge_color": "yellow",
        "params": {
            "source_ip": "192.168.1.15",
            "destination_ip": "192.168.2.20",
            "source_port": 5053,
            "destination_port": 53,
            "protocol": "UDP",
            "app_protocol": "DNS",
            "payload": "DNS_QUERY: api.enterprise-cloud.internal (Type A)",
            "packet_size": 512,
            "ttl": 62
        },
        "flags": {
            "congestion_factor": 0.3,
            "loss_override": 14.0,
            "weak_link": True,
            "simulate_drop": False,
            "disable_router": None
        }
    }
}
