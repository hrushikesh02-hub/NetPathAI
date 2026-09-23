"""Unit tests for Simulation and Routing components."""
import pytest
from simulation.topology import NetworkTopology
from simulation.encapsulation import EncapsulationEngine
from simulation.metrics import NetworkMetricsEngine
from simulation.packet_engine import PacketEngine

def test_topology_dijkstra_shortest_path():
    topo = NetworkTopology()
    res = topo.find_shortest_path("PC1", "Server1")
    assert res["success"] is True
    assert res["path"] == ["PC1", "SW1", "R1", "R2", "SW2", "Server1"]
    assert res["hops"] == 5
    assert res["latency"] > 0

def test_topology_router_failure_failover():
    topo = NetworkTopology()
    # Disable primary Core Router R2
    topo.set_node_status("R2", False)
    res = topo.find_shortest_path("PC1", "Server1")
    assert res["success"] is True
    # Should automatically route via R3
    assert res["path"] == ["PC1", "SW1", "R1", "R3", "SW2", "Server1"]
    assert "R3" in res["path"]
    assert "R2" not in res["path"]

def test_encapsulation_layers_generation():
    packet_data = {
        "source_ip": "192.168.1.10",
        "destination_ip": "192.168.2.20",
        "protocol": "TCP",
        "app_protocol": "HTTP",
        "payload": "HELLO SERVER",
        "source_port": 5000,
        "destination_port": 80,
        "ttl": 64
    }
    enc = EncapsulationEngine.generate_layers(packet_data)
    assert 7 in enc["osi_layers"]
    assert 1 in enc["osi_layers"]
    assert enc["osi_layers"][7]["name"] == "Application"
    assert enc["osi_layers"][4]["name"] == "Transport"
    assert enc["osi_layers"][3]["name"] == "Network"
    assert len(enc["encapsulation_steps"]) == 5
    assert len(enc["decapsulation_steps"]) == 5

def test_network_metrics_calculation():
    # Normal metrics
    norm_metrics = NetworkMetricsEngine.calculate_telemetry(hops=5, packet_size=1024, protocol="TCP", congestion_factor=0.0)
    assert norm_metrics["latency"] < 70.0
    assert norm_metrics["packet_loss"] == 0.0
    assert norm_metrics["retransmissions"] == 0

    # Congested metrics
    cong_metrics = NetworkMetricsEngine.calculate_telemetry(hops=5, packet_size=1400, protocol="TCP", congestion_factor=0.9)
    assert cong_metrics["latency"] > 100.0
    assert cong_metrics["packet_loss"] > 10.0
    assert cong_metrics["retransmissions"] >= 1

def test_packet_validation():
    valid_data = {
        "source_ip": "192.168.1.10",
        "destination_ip": "192.168.2.20",
        "source_port": 5000,
        "destination_port": 80,
        "packet_size": 1024,
        "ttl": 64,
        "payload": "TEST"
    }
    is_valid, errors = PacketEngine.validate_packet_input(valid_data)
    assert is_valid is True
    assert len(errors) == 0

    # Invalid IP
    invalid_data = valid_data.copy()
    invalid_data["source_ip"] = "999.999.999.999"
    is_valid, errors = PacketEngine.validate_packet_input(invalid_data)
    assert is_valid is False
    assert "source_ip" in errors
