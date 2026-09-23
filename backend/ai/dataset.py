"""
Synthetic Realistic Network Telemetry Dataset Generator for NetPath AI.
Generates comprehensive distributions of normal and anomalous network parameters.
"""

import numpy as np
import pandas as pd
from typing import Tuple

def generate_network_dataset(num_samples: int = 3000, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic multi-class network telemetry dataset.
    Features:
      - packet_size (bytes: 64 - 1500)
      - latency (ms: 5 - 800)
      - packet_loss (%: 0.0 - 100.0)
      - throughput (Mbps: 0.1 - 1000.0)
      - retransmissions (count: 0 - 25)
      - hops (count: 1 - 15)
      - ttl (count: 1 - 64)
      - jitter (ms: 0.5 - 200.0)
    Target Labels:
      - anomaly: 0 (Normal), 1 (Anomaly)
      - health_class: 0 (HEALTHY), 1 (WARNING), 2 (CRITICAL)
      - condition: 'NORMAL', 'HIGH_LATENCY', 'PACKET_LOSS', 'CONGESTION', 'HIGH_RETRANSMISSION', 'WEAK_LINK'
    """
    np.random.seed(random_state)
    records = []

    # Distribution split:
    # ~55% Normal, ~15% High Latency, ~10% Packet Loss, ~10% Congestion, ~5% High Retransmissions, ~5% Weak Link
    counts = {
        "NORMAL": int(num_samples * 0.55),
        "HIGH_LATENCY": int(num_samples * 0.15),
        "PACKET_LOSS": int(num_samples * 0.10),
        "CONGESTION": int(num_samples * 0.10),
        "HIGH_RETRANSMISSION": int(num_samples * 0.05),
        "WEAK_LINK": int(num_samples * 0.05)
    }

    # 1. NORMAL SAMPLES (HEALTHY)
    for _ in range(counts["NORMAL"]):
        pkt_size = int(np.random.choice([64, 128, 512, 1024, 1420, 1500]))
        hops = int(np.random.randint(2, 6))
        latency = float(np.random.uniform(8.0, 45.0) + hops * 2.5)
        loss = float(np.random.uniform(0.0, 0.5))
        throughput = float(np.random.uniform(250.0, 950.0))
        retransmissions = 0 if np.random.random() > 0.05 else 1
        ttl = int(64 - hops)
        jitter = float(np.random.uniform(0.5, 4.0))

        records.append({
            "packet_size": pkt_size,
            "latency": round(latency, 2),
            "packet_loss": round(loss, 2),
            "throughput": round(throughput, 2),
            "retransmissions": retransmissions,
            "hops": hops,
            "ttl": ttl,
            "jitter": round(jitter, 2),
            "anomaly": 0,
            "health_class": "HEALTHY",
            "condition": "NORMAL"
        })

    # 2. HIGH LATENCY SAMPLES (WARNING)
    for _ in range(counts["HIGH_LATENCY"]):
        pkt_size = int(np.random.choice([256, 512, 1024, 1420]))
        hops = int(np.random.randint(4, 9))
        latency = float(np.random.uniform(180.0, 420.0))
        loss = float(np.random.uniform(0.5, 3.5))
        throughput = float(np.random.uniform(80.0, 220.0))
        retransmissions = int(np.random.choice([0, 1, 2]))
        ttl = int(64 - hops)
        jitter = float(np.random.uniform(20.0, 65.0))

        records.append({
            "packet_size": pkt_size,
            "latency": round(latency, 2),
            "packet_loss": round(loss, 2),
            "throughput": round(throughput, 2),
            "retransmissions": retransmissions,
            "hops": hops,
            "ttl": ttl,
            "jitter": round(jitter, 2),
            "anomaly": 1,
            "health_class": "WARNING",
            "condition": "HIGH_LATENCY"
        })

    # 3. PACKET LOSS SAMPLES (CRITICAL)
    for _ in range(counts["PACKET_LOSS"]):
        pkt_size = int(np.random.choice([512, 1024, 1400, 1500]))
        hops = int(np.random.randint(3, 7))
        latency = float(np.random.uniform(60.0, 180.0))
        loss = float(np.random.uniform(12.0, 40.0))
        throughput = float(np.random.uniform(10.0, 70.0))
        retransmissions = int(np.random.randint(3, 10))
        ttl = int(64 - hops)
        jitter = float(np.random.uniform(15.0, 50.0))

        records.append({
            "packet_size": pkt_size,
            "latency": round(latency, 2),
            "packet_loss": round(loss, 2),
            "throughput": round(throughput, 2),
            "retransmissions": retransmissions,
            "hops": hops,
            "ttl": ttl,
            "jitter": round(jitter, 2),
            "anomaly": 1,
            "health_class": "CRITICAL",
            "condition": "PACKET_LOSS"
        })

    # 4. CONGESTION SAMPLES (CRITICAL)
    for _ in range(counts["CONGESTION"]):
        pkt_size = int(np.random.choice([1024, 1400, 1500]))
        hops = int(np.random.randint(3, 8))
        latency = float(np.random.uniform(280.0, 650.0))
        loss = float(np.random.uniform(15.0, 35.0))
        throughput = float(np.random.uniform(5.0, 45.0))
        retransmissions = int(np.random.randint(6, 18))
        ttl = int(64 - hops)
        jitter = float(np.random.uniform(45.0, 120.0))

        records.append({
            "packet_size": pkt_size,
            "latency": round(latency, 2),
            "packet_loss": round(loss, 2),
            "throughput": round(throughput, 2),
            "retransmissions": retransmissions,
            "hops": hops,
            "ttl": ttl,
            "jitter": round(jitter, 2),
            "anomaly": 1,
            "health_class": "CRITICAL",
            "condition": "CONGESTION"
        })

    # 5. HIGH RETRANSMISSION SAMPLES (WARNING / CRITICAL)
    for _ in range(counts["HIGH_RETRANSMISSION"]):
        pkt_size = int(np.random.choice([512, 1024, 1420]))
        hops = int(np.random.randint(2, 6))
        latency = float(np.random.uniform(90.0, 240.0))
        loss = float(np.random.uniform(8.0, 25.0))
        throughput = float(np.random.uniform(20.0, 80.0))
        retransmissions = int(np.random.randint(8, 22))
        ttl = int(64 - hops)
        jitter = float(np.random.uniform(10.0, 40.0))

        records.append({
            "packet_size": pkt_size,
            "latency": round(latency, 2),
            "packet_loss": round(loss, 2),
            "throughput": round(throughput, 2),
            "retransmissions": retransmissions,
            "hops": hops,
            "ttl": ttl,
            "jitter": round(jitter, 2),
            "anomaly": 1,
            "health_class": "CRITICAL",
            "condition": "HIGH_RETRANSMISSION"
        })

    # 6. WEAK LINK SAMPLES (WARNING)
    for _ in range(counts["WEAK_LINK"]):
        pkt_size = int(np.random.choice([128, 512, 1024]))
        hops = int(np.random.randint(2, 5))
        latency = float(np.random.uniform(70.0, 190.0))
        loss = float(np.random.uniform(5.0, 15.0))
        throughput = float(np.random.uniform(30.0, 110.0))
        retransmissions = int(np.random.randint(2, 6))
        ttl = int(64 - hops)
        jitter = float(np.random.uniform(25.0, 75.0))

        records.append({
            "packet_size": pkt_size,
            "latency": round(latency, 2),
            "packet_loss": round(loss, 2),
            "throughput": round(throughput, 2),
            "retransmissions": retransmissions,
            "hops": hops,
            "ttl": ttl,
            "jitter": round(jitter, 2),
            "anomaly": 1,
            "health_class": "WARNING",
            "condition": "WEAK_LINK"
        })

    df = pd.DataFrame(records)
    # Shuffle
    df = df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    return df

FEATURE_COLUMNS = [
    "packet_size",
    "latency",
    "packet_loss",
    "throughput",
    "retransmissions",
    "hops",
    "ttl",
    "jitter"
]
