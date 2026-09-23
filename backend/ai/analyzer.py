"""
AI Inference, Anomaly Detection, and Natural Language Explanation Engine for NetPath AI.
Includes trained Scikit-learn models and robust Rule-Based Fallback.
"""

import os
import json
from typing import Dict, Any, Optional

FEATURE_KEYS = [
    "packet_size",
    "latency",
    "packet_loss",
    "throughput",
    "retransmissions",
    "hops",
    "ttl",
    "jitter"
]

class NetworkAIAnalyzer:
    def __init__(self, models_dir: Optional[str] = None):
        if models_dir is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            models_dir = os.path.join(os.path.dirname(current_dir), "models")
        
        self.models_dir = models_dir
        self.scaler = None
        self.iso_forest = None
        self.health_classifier = None
        self.is_ml_active = False
        self.load_models()

    def load_models(self):
        """Attempts to load trained joblib models. Falls back cleanly on failure."""
        try:
            import joblib
            scaler_p = os.path.join(self.models_dir, "scaler.joblib")
            iso_p = os.path.join(self.models_dir, "isolation_forest.joblib")
            rf_p = os.path.join(self.models_dir, "health_classifier.joblib")

            if os.path.exists(scaler_p) and os.path.exists(iso_p) and os.path.exists(rf_p):
                self.scaler = joblib.load(scaler_p)
                self.iso_forest = joblib.load(iso_p)
                self.health_classifier = joblib.load(rf_p)
                self.is_ml_active = True
                print("NetPath AI: Machine Learning models loaded successfully.")
            else:
                print("NetPath AI: Trained model files not found. Using Rule-Based Fallback Engine.")
                self.is_ml_active = False
        except Exception as e:
            print(f"NetPath AI: Failed to load ML models ({e}). Using Rule-Based Fallback Engine.")
            self.is_ml_active = False

    def generate_explanation(
        self,
        features: Dict[str, Any],
        is_anomaly: bool,
        health_class: str,
        risk_level: str
    ) -> Dict[str, str]:
        """Generates dynamic, human-understandable root-cause diagnosis and actionable recommendations."""
        lat = float(features.get("latency", 0))
        loss = float(features.get("packet_loss", 0))
        tp = float(features.get("throughput", 0))
        retx = int(features.get("retransmissions", 0))
        jitter = float(features.get("jitter", 0))
        hops = int(features.get("hops", 0))

        reasons = []
        possible_causes = []
        recommendations = []

        if health_class == "HEALTHY" and not is_anomaly:
            return {
                "reason": f"Network telemetry is optimal with low latency ({lat:.1f} ms), negligible packet loss ({loss:.1f}%), and zero retransmission overhead.",
                "possible_cause": "All intermediary switches, edge routers, and physical links are operating well within capacity thresholds.",
                "recommendation": "Maintain current link-state monitoring and QoS bandwidth allocations."
            }

        # Identify Specific Bottlenecks
        if loss >= 15.0:
            reasons.append(f"Severe packet drop rate detected ({loss:.1f}%) exceeding the 5% SLA threshold.")
            possible_causes.append("Interface queue buffer overflow, physical cable damage, or severe link-layer noise.")
            recommendations.append("Inspect switch interface queue depth and verify CRC frame drop counters on physical interfaces.")

        if lat >= 250.0:
            reasons.append(f"Elevated round-trip latency ({lat:.1f} ms) with high jitter ({jitter:.1f} ms).")
            possible_causes.append("Bufferbloat on congested WAN gateway or sub-optimal routing hops.")
            recommendations.append("Enable Active Queue Management (CoDel / FQ-CoDel) or optimize OSPF/BGP metric cost.")

        if retx >= 4:
            reasons.append(f"Frequent TCP retransmissions ({retx} retransmit cycles) causing TCP window collapse.")
            possible_causes.append("Asymmetric duplex mismatch, unacknowledged segment drops, or high RTT variance.")
            recommendations.append("Check TCP MSS/MTU negotiation and verify duplex settings between Edge Router R1 and Core Router R2.")

        if tp <= 35.0 and tp > 0.0:
            reasons.append(f"Constrained network throughput ({tp:.1f} Mbps) despite available link capacity.")
            possible_causes.append("TCP congestion control backoff (AIMD reduction) due to packet loss events.")
            recommendations.append("Reduce link saturation by throttling non-critical broadcast traffic and prioritize DSCP voice/video queues.")

        if hops >= 7:
            reasons.append(f"High routing hop count ({hops} hops) resulting in cumulative processing delay.")
            possible_causes.append("Sub-optimal routing paths or routing loops.")
            recommendations.append("Audit routing tables and recompute Dijkstra shortest path.")

        # Default fallback text if specific conditions weren't flagged
        if not reasons:
            reasons.append("Telemetry metrics deviate from normal baseline traffic distribution.")
            possible_causes.append("Transient network burst or routing micro-loop.")
            recommendations.append("Monitor link telemetry and re-evaluate interface error counters.")

        return {
            "reason": " ".join(reasons),
            "possible_cause": " ".join(possible_causes),
            "recommendation": " ".join(recommendations)
        }

    def analyze_metrics(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes inference on incoming telemetry features.
        Accepts:
          - packet_size, latency, packet_loss, throughput, retransmissions, hops, ttl, jitter
        Returns:
          - status: 'anomaly' | 'normal'
          - health_status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
          - risk_level: 'low' | 'moderate' | 'high' | 'critical'
          - confidence: float (0.0 - 1.0)
          - reason, possible_cause, recommendation
          - model_source: 'IsolationForest + RandomForest' | 'Fallback Rule Engine'
        """
        # Extract features with safe defaults
        features = {
            "packet_size": float(data.get("packet_size", 1024)),
            "latency": float(data.get("latency", 25.0)),
            "packet_loss": float(data.get("packet_loss", 0.0)),
            "throughput": float(data.get("throughput", 500.0)),
            "retransmissions": int(data.get("retransmissions", 0)),
            "hops": int(data.get("hops", 3)),
            "ttl": int(data.get("ttl", 61)),
            "jitter": float(data.get("jitter", 2.0))
        }

        # Try ML Inference if active
        if self.is_ml_active and self.iso_forest and self.health_classifier and self.scaler:
            try:
                import numpy as np
                feature_vector = np.array([[features[k] for k in FEATURE_KEYS]])
                feature_vector_scaled = self.scaler.transform(feature_vector)

                # Isolation Forest Anomaly Detection
                raw_score = self.iso_forest.decision_function(feature_vector_scaled)[0]
                iso_pred = self.iso_forest.predict(feature_vector_scaled)[0]
                is_anomaly = bool(iso_pred == -1)

                # Convert decision score to confidence percentage
                # Decision function: negative -> anomalous, positive -> normal
                if is_anomaly:
                    confidence = min(0.99, max(0.70, 0.70 + abs(raw_score) * 1.2))
                else:
                    confidence = min(0.99, max(0.75, 0.75 + raw_score * 0.8))

                # Health Classifier
                health_pred = self.health_classifier.predict(feature_vector)[0]
                health_probs = self.health_classifier.predict_proba(feature_vector)[0]
                max_prob = float(np.max(health_probs))
                health_confidence = round(max_prob, 2)

                # Determine Risk Level
                if health_pred == "CRITICAL" or (is_anomaly and features["packet_loss"] > 10.0):
                    risk_level = "critical" if features["packet_loss"] > 20.0 or features["latency"] > 400.0 else "high"
                elif health_pred == "WARNING" or is_anomaly:
                    risk_level = "moderate"
                else:
                    risk_level = "low"

                explanation = self.generate_explanation(features, is_anomaly, health_pred, risk_level)

                return {
                    "status": "anomaly" if is_anomaly else "normal",
                    "is_anomaly": is_anomaly,
                    "health_status": health_pred,
                    "risk_level": risk_level,
                    "confidence": round(float(confidence), 2),
                    "health_confidence": health_confidence,
                    "reason": explanation["reason"],
                    "possible_cause": explanation["possible_cause"],
                    "recommendation": explanation["recommendation"],
                    "model_source": "Machine Learning (Isolation Forest & Random Forest)",
                    "is_fallback": False,
                    "features_analyzed": features
                }
            except Exception as e:
                print(f"ML Inference error ({e}), falling back to heuristic engine.")

        # =========================================================================
        # Robust Rule-Based Fallback Engine (Zero dependencies, guaranteed execution)
        # =========================================================================
        lat = features["latency"]
        loss = features["packet_loss"]
        tp = features["throughput"]
        retx = features["retransmissions"]
        jit = features["jitter"]

        is_anomaly = False
        health_pred = "HEALTHY"
        risk_level = "low"
        confidence = 0.90

        if loss >= 15.0 or lat >= 350.0 or retx >= 6 or (tp < 20.0 and tp > 0):
            is_anomaly = True
            health_pred = "CRITICAL"
            risk_level = "critical" if loss >= 25.0 or lat >= 450.0 else "high"
            confidence = 0.94
        elif loss >= 2.0 or lat >= 150.0 or retx >= 1 or jit >= 20.0 or tp < 80.0:
            is_anomaly = True
            health_pred = "WARNING"
            risk_level = "moderate"
            confidence = 0.88
        else:
            is_anomaly = False
            health_pred = "HEALTHY"
            risk_level = "low"
            confidence = 0.95

        explanation = self.generate_explanation(features, is_anomaly, health_pred, risk_level)

        return {
            "status": "anomaly" if is_anomaly else "normal",
            "is_anomaly": is_anomaly,
            "health_status": health_pred,
            "risk_level": risk_level,
            "confidence": confidence,
            "health_confidence": confidence,
            "reason": explanation["reason"],
            "possible_cause": explanation["possible_cause"],
            "recommendation": explanation["recommendation"],
            "model_source": "Fallback Network Rule Analyzer",
            "is_fallback": True,
            "fallback_message": "AI service unavailable — fallback network rule analyzer is active.",
            "features_analyzed": features
        }
