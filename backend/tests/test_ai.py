"""Unit tests for AI Module and Fallback analyzer."""
import pytest
from ai.analyzer import NetworkAIAnalyzer

def test_ai_normal_traffic_analysis():
    analyzer = NetworkAIAnalyzer()
    normal_features = {
        "packet_size": 1024,
        "latency": 22.0,
        "packet_loss": 0.0,
        "throughput": 650.0,
        "retransmissions": 0,
        "hops": 3,
        "ttl": 61,
        "jitter": 1.5
    }
    result = analyzer.analyze_metrics(normal_features)
    assert result["health_status"] == "HEALTHY"
    assert result["is_anomaly"] is False
    assert result["risk_level"] == "low"
    assert result["confidence"] >= 0.70

def test_ai_anomaly_detection_congestion():
    analyzer = NetworkAIAnalyzer()
    congested_features = {
        "packet_size": 1400,
        "latency": 450.0,
        "packet_loss": 22.0,
        "throughput": 30.0,
        "retransmissions": 8,
        "hops": 5,
        "ttl": 55,
        "jitter": 85.0
    }
    result = analyzer.analyze_metrics(congested_features)
    assert result["is_anomaly"] is True
    assert result["health_status"] in ["WARNING", "CRITICAL"]
    assert result["risk_level"] in ["high", "critical"]
    assert "recommendation" in result
    assert len(result["recommendation"]) > 10

def test_fallback_analyzer():
    # Pass invalid directory to force fallback
    analyzer = NetworkAIAnalyzer(models_dir="/invalid/path/none")
    assert analyzer.is_ml_active is False
    
    # Test normal via fallback
    normal_res = analyzer.analyze_metrics({"latency": 20, "packet_loss": 0, "throughput": 500, "retransmissions": 0})
    assert normal_res["health_status"] == "HEALTHY"
    assert normal_res["is_fallback"] is True
    assert "fallback" in normal_res["model_source"].lower()
