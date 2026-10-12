"""Synthetic-model inference with evidence-based, explicitly heuristic advice."""
import json
import logging
import os
from validation import number

FEATURE_KEYS = ["packet_size", "latency", "packet_loss", "throughput",
                "retransmissions", "hops", "ttl", "jitter"]
FEATURE_LIMITS = {
    "packet_size": (64, 9000, True), "latency": (0, 1e9, False),
    "packet_loss": (0, 100, False), "throughput": (0, 1e9, False),
    "retransmissions": (0, 1000000, True), "hops": (0, 255, True),
    "ttl": (0, 255, True), "jitter": (0, 1e9, False),
}
HEALTH_ORDER = {"HEALTHY": 0, "WARNING": 1, "CRITICAL": 2}


class NetworkAIAnalyzer:
    def __init__(self, models_dir=None):
        self.models_dir = models_dir or os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
        self.scaler = self.iso_forest = self.health_classifier = None
        self.is_ml_active = False
        self.model_error = None
        self.load_models()

    def load_models(self):
        self.is_ml_active = False
        try:
            import joblib
            import warnings
            from sklearn.exceptions import InconsistentVersionWarning
            with warnings.catch_warnings():
                warnings.simplefilter("error", InconsistentVersionWarning)
                self.scaler = joblib.load(os.path.join(self.models_dir, "scaler.joblib"))
                self.iso_forest = joblib.load(os.path.join(self.models_dir, "isolation_forest.joblib"))
                self.health_classifier = joblib.load(os.path.join(self.models_dir, "health_classifier.joblib"))
            for model in (self.scaler, self.iso_forest, self.health_classifier):
                if model.n_features_in_ != len(FEATURE_KEYS):
                    raise ValueError("Model feature count does not match telemetry schema")
            with open(os.path.join(self.models_dir, "training_metrics.json"), encoding="utf-8") as handle:
                metadata = json.load(handle)
            if metadata.get("feature_columns") != FEATURE_KEYS:
                raise ValueError("Model feature order does not match telemetry schema")
            if set(self.health_classifier.classes_) != set(HEALTH_ORDER):
                raise ValueError("Model health classes do not match telemetry schema")
            self.is_ml_active = True
            self.model_error = None
        except Exception as exc:
            self.model_error = type(exc).__name__
            logging.warning("ML unavailable; using rules: %s", exc)

    @staticmethod
    def rule_findings(f):
        """Thresholds are simulator policy, not proven root causes."""
        findings = []
        def add(metric, severity, observation, advice):
            findings.append({"metric": metric, "value": f[metric], "severity": severity,
                             "observation": observation, "recommendation": advice})
        if f["ttl"] == 0:
            add("ttl", "CRITICAL", "The packet has no hops left (TTL is 0).", "Increase the starting TTL so the packet can travel farther. Check the route, then try again.")
        if f["packet_loss"] >= 2:
            add("packet_loss", "CRITICAL" if f["packet_loss"] >= 15 else "WARNING",
                f"Packet loss is {f['packet_loss']:.1f}%.", "Check where packets are being lost in the journey. Try TCP to see how it sends lost data again.")
        if f["latency"] >= 150:
            add("latency", "CRITICAL" if f["latency"] >= 350 else "WARNING",
                f"Packets are taking longer to arrive: {f['latency']:.1f} ms.", "Check which links add the most delay. Compare with Normal Baseline to see how much slower this run is.")
        if f["throughput"] < 80:
            add("throughput", "CRITICAL" if f["throughput"] < 20 else "WARNING",
                f"Data transfer is slow: {f['throughput']:.1f} Mbps.", "Check the slowest link on the route. Compare with Normal Baseline to see how much data the route can carry.")
        if f["retransmissions"] >= 1:
            add("retransmissions", "CRITICAL" if f["retransmissions"] >= 6 else "WARNING",
                f"TCP sent data again {f['retransmissions']} time(s).", "Check packet loss and the retry steps in the journey. See whether the packet arrived after these retries.")
        if f["jitter"] >= 20:
            add("jitter", "WARNING", f"Packet delay varies by {f['jitter']:.1f} ms (jitter).", "Run the same scenario again and compare the delay. Use Normal Baseline to check whether delivery is more steady.")
        return findings

    def analyze_metrics(self, data):
        if not isinstance(data, dict):
            raise ValueError("Telemetry must be a JSON object.")
        missing = [key for key in FEATURE_KEYS if key not in data]
        if missing:
            raise ValueError("Missing telemetry: " + ", ".join(missing))
        features = {key: number(data[key], key, *FEATURE_LIMITS[key]) for key in FEATURE_KEYS}
        findings = self.rule_findings(features)
        if str(data.get("status", "")).startswith("DROPPED"):
            findings.append({"metric": "status", "value": data["status"], "severity": "CRITICAL",
                             "observation": "The packet was dropped before it reached its destination.",
                             "recommendation": "Find the drop step in the packet journey. Check the route, TTL, and failure settings before trying again."})
        rule_health = max((item["severity"] for item in findings), key=HEALTH_ORDER.get, default="HEALTHY")
        model_health = None
        health_score = anomaly_score = None
        model_anomaly = None
        if self.is_ml_active:
            try:
                import numpy as np
                vector = np.array([[features[key] for key in FEATURE_KEYS]])
                scaled = self.scaler.transform(vector)
                anomaly_score = float(self.iso_forest.decision_function(scaled)[0])
                model_anomaly = bool(self.iso_forest.predict(scaled)[0] == -1)
                model_health = str(self.health_classifier.predict(vector)[0])
                health_score = float(max(self.health_classifier.predict_proba(vector)[0]))
            except Exception as exc:
                logging.exception("ML inference failed; using rules")
                self.is_ml_active = False
                self.model_error = type(exc).__name__
                model_health = model_anomaly = health_score = anomaly_score = None
        health = max((rule_health, model_health or "HEALTHY"), key=HEALTH_ORDER.get)
        is_anomaly = bool(model_anomaly or health != "HEALTHY")
        risk = ("critical" if features["ttl"] == 0 or features["packet_loss"] >= 25 or features["latency"] >= 450 or features["throughput"] == 0
                else "high") if health == "CRITICAL" else "moderate" if is_anomaly else "low"
        reasons = [item["observation"] for item in findings]
        recommendations = [item["recommendation"] for item in findings]
        if not reasons:
            if is_anomaly:
                reasons.append("The traffic pattern looks unusual, even though no single reading is outside its usual range.")
                recommendations.append("Run the same scenario again. Compare delay, packet loss, and transfer speed with Normal Baseline.")
            else:
                reasons.append(f"No warning signs were found. Delay is {features['latency']:.1f} ms, packet loss is {features['packet_loss']:.1f}%, and TCP retries are {features['retransmissions']}.")
                recommendations.append("No changes are suggested for this run. Compare it with another scenario to see how the results change.")
        return {
            "status": "anomaly" if is_anomaly else "normal", "is_anomaly": is_anomaly,
            "health_status": health, "risk_level": risk,
            "confidence": None, "health_confidence": health_score,
            "confidence_kind": "uncalibrated_model_class_score" if model_health else "not_available",
            "model_health_status": model_health, "model_is_anomaly": model_anomaly,
            "anomaly_score": anomaly_score, "rule_health_status": rule_health,
            "rule_override": model_health is not None and HEALTH_ORDER[rule_health] > HEALTH_ORDER[model_health],
            "reason": " ".join(reasons),
            "possible_cause": "These readings alone do not show the exact cause. Check the packet journey and scenario settings for more details.",
            "recommendation": " ".join(recommendations), "evidence": findings,
            "model_source": "Isolation Forest + Random Forest with rule safeguards" if model_health else "Fallback Network Rule Analyzer",
            "explanation_source": "metric_threshold_rules", "training_data_source": "synthetic",
            "limitations": "Dataset-trained classification with metric-based suggestions. Model class scores are uncalibrated; they are not the probability that a suggestion is correct.",
            "is_fallback": model_health is None,
            "fallback_message": "AI analysis is unavailable. Basic network checks are shown instead." if model_health is None else None,
            "features_analyzed": features,
        }
