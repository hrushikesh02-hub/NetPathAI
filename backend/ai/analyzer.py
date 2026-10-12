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
            add("ttl", "CRITICAL", "TTL is exhausted (0).", "Check the initial TTL and forwarding path; the packet cannot be forwarded with TTL 0.")
        if f["packet_loss"] >= 2:
            add("packet_loss", "CRITICAL" if f["packet_loss"] >= 15 else "WARNING",
                f"Packet loss is {f['packet_loss']:.1f}%.", "Compare this sample with Normal Baseline. Run Packet Loss & TCP Retransmission to observe how TCP recovers from simulated loss.")
        if f["latency"] >= 150:
            add("latency", "CRITICAL" if f["latency"] >= 350 else "WARNING",
                f"Latency is {f['latency']:.1f} ms.", "Compare High Latency and Severe Network Congestion with Normal Baseline to distinguish simulated propagation delay from queueing delay.")
        if f["throughput"] < 80:
            add("throughput", "CRITICAL" if f["throughput"] < 20 else "WARNING",
                f"Throughput is {f['throughput']:.1f} Mbps.", "Compare with Normal Baseline and inspect the selected route's link capacity. Use Weak Link and Congestion presets to explore why simulated throughput falls.")
        if f["retransmissions"] >= 1:
            add("retransmissions", "CRITICAL" if f["retransmissions"] >= 6 else "WARNING",
                f"The telemetry reports {f['retransmissions']} TCP retransmission(s).", "Use the Packet Loss and Excessive TCP Retransmission presets to compare retry counts and delivery outcomes.")
        if f["jitter"] >= 20:
            add("jitter", "WARNING", f"Jitter is {f['jitter']:.1f} ms.", "Repeat the same preset and compare its delay variation with Normal Baseline, then compare Congestion and Weak Link.")
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
                             "observation": f"The simulation reports {data['status']} for this packet.",
                             "recommendation": "Inspect the journey's drop event and fault settings; this packet did not reach its destination."})
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
                reasons.append("The synthetic-trained model flags an unusual feature combination; no configured metric threshold is exceeded.")
                recommendations.append("Compare this feature combination with the saved normal dataset samples. An outlier can differ from the training baseline without exceeding a warning threshold.")
            else:
                reasons.append(f"No configured warning thresholds are exceeded: latency {features['latency']:.1f} ms, loss {features['packet_loss']:.1f}%, retransmissions {features['retransmissions']}.")
                recommendations.append("Use this sample as a baseline, then run a fault preset to compare the metrics and model predictions.")
        return {
            "status": "anomaly" if is_anomaly else "normal", "is_anomaly": is_anomaly,
            "health_status": health, "risk_level": risk,
            "confidence": None, "health_confidence": health_score,
            "confidence_kind": "uncalibrated_model_class_score" if model_health else "not_available",
            "model_health_status": model_health, "model_is_anomaly": model_anomaly,
            "anomaly_score": anomaly_score, "rule_health_status": rule_health,
            "rule_override": model_health is not None and HEALTH_ORDER[rule_health] > HEALTH_ORDER[model_health],
            "reason": " ".join(reasons),
            "possible_cause": "Telemetry alone cannot establish a root cause. In this simulator, scenario settings and the modeled route generate the measurements.",
            "recommendation": " ".join(recommendations), "evidence": findings,
            "model_source": "Isolation Forest + Random Forest with rule safeguards" if model_health else "Fallback Network Rule Analyzer",
            "explanation_source": "metric_threshold_rules", "training_data_source": "synthetic",
            "limitations": "Dataset-trained classification with metric-based suggestions. Model class scores are uncalibrated; they are not the probability that a suggestion is correct.",
            "is_fallback": model_health is None,
            "fallback_message": "ML models unavailable or incompatible; metric rules are active." if model_health is None else None,
            "features_analyzed": features,
        }
