"""Repeatable simulator smoke evaluation, not real-world model validation.

Run from backend: python -m ai.evaluate
"""
import json
import random
from collections import Counter
from pathlib import Path
from .analyzer import NetworkAIAnalyzer
from simulation.packet_engine import PacketEngine
from simulation.scenarios import SCENARIOS
from simulation.topology import NetworkTopology


def evaluate(repetitions=30):
    analyzer = NetworkAIAnalyzer()
    if not analyzer.is_ml_active:
        raise RuntimeError(f"ML models unavailable: {analyzer.model_error}")
    results = {}
    for scenario_id, scenario in SCENARIOS.items():
        random.seed(42)
        topology = NetworkTopology()
        if scenario["flags"].get("disable_router"):
            topology.set_node_status(scenario["flags"]["disable_router"], False)
        analyses = [analyzer.analyze_metrics(PacketEngine(topology).simulate_journey(
            scenario["params"], scenario["flags"])["metrics"]) for _ in range(repetitions)]
        results[scenario_id] = {
            "runs": repetitions,
            "model_anomalies": sum(result["model_is_anomaly"] for result in analyses),
            "model_health": dict(Counter(result["model_health_status"] for result in analyses)),
            "final_health": dict(Counter(result["health_status"] for result in analyses)),
            "fallback_runs": sum(result["is_fallback"] for result in analyses),
        }
    return {"scope": "Seeded simulator smoke check; no real-network validation or calibrated confidence.",
            "seed": 42, "scenarios": results}


if __name__ == "__main__":
    report = evaluate()
    target = Path(__file__).resolve().parents[1] / "models" / "scenario_evaluation.json"
    target.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
