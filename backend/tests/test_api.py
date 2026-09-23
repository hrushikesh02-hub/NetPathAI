"""Unit and integration tests for Flask REST endpoints."""
import pytest
import json
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_api_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"

def test_api_packet_create(client):
    payload = {
        "source_ip": "192.168.1.10",
        "destination_ip": "192.168.2.20",
        "source_port": 5000,
        "destination_port": 80,
        "protocol": "TCP",
        "app_protocol": "HTTP",
        "payload": "HELLO SERVER",
        "packet_size": 1024,
        "ttl": 64
    }
    res = client.post("/api/packet/create", data=json.dumps(payload), content_type="application/json")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "encapsulation" in data

def test_api_packet_simulate(client):
    payload = {
        "source_ip": "192.168.1.10",
        "destination_ip": "192.168.2.20",
        "source_port": 5000,
        "destination_port": 80,
        "protocol": "TCP",
        "app_protocol": "HTTP",
        "payload": "HELLO SERVER",
        "packet_size": 1024,
        "ttl": 64
    }
    res = client.post("/api/packet/simulate", data=json.dumps(payload), content_type="application/json")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "simulation" in data
    assert "ai_analysis" in data
    assert len(data["simulation"]["trajectory"]) > 0

def test_api_topology_failure(client):
    # Disable R2
    payload = {"node_id": "R2", "is_active": False}
    res = client.post("/api/topology/failure", data=json.dumps(payload), content_type="application/json")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["new_status"] == "offline"
    assert "R3" in data["recalculated_path"]["path"]

    # Re-enable R2
    payload["is_active"] = True
    res2 = client.post("/api/topology/failure", data=json.dumps(payload), content_type="application/json")
    assert res2.status_code == 200
    assert res2.get_json()["new_status"] == "online"

def test_api_scenario_run(client):
    payload = {"scenario_id": "PACKET_LOSS"}
    res = client.post("/api/scenario/run", data=json.dumps(payload), content_type="application/json")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["scenario"]["id"] == "PACKET_LOSS"
    assert data["ai_analysis"]["is_anomaly"] is True

def test_api_history(client):
    res = client.get("/api/history")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert isinstance(data["history"], list)
