import pytest
from ai.analyzer import NetworkAIAnalyzer, FEATURE_KEYS
from simulation.packet_engine import PacketEngine
from simulation.scenarios import SCENARIOS
from simulation.topology import NetworkTopology

BASE = {"packet_size": 1024, "latency": 25, "packet_loss": 0,
        "throughput": 500, "retransmissions": 0, "hops": 3, "ttl": 61, "jitter": 2}


@pytest.fixture
def fallback(tmp_path):
    return NetworkAIAnalyzer(str(tmp_path))


def packet(**changes):
    return {**SCENARIOS["NORMAL"]["params"], **changes}


def test_health_and_empty_summary(client):
    assert client.get('/api/health').status_code == 200
    summary = client.get('/api/metrics').json['summary']
    assert summary['network_health'] == 'UNKNOWN'
    assert summary['avg_latency'] is None


@pytest.mark.parametrize('body', [[], 'text', 3, None])
@pytest.mark.parametrize('url', ['/api/packet/create', '/api/packet/simulate', '/api/ai/analyze', '/api/scenario/run', '/api/topology/failure'])
def test_non_object_body(client, url, body):
    import json
    assert client.post(url, data=json.dumps(body), content_type='application/json').status_code == 400


def test_malformed_json(client):
    assert client.post('/api/ai/analyze', data='{', content_type='application/json').status_code == 400


@pytest.mark.parametrize('changes', [dict(packet_size=2.5), dict(ttl=True), dict(ttl=float('inf')),
                                   dict(payload=None), dict(protocol=[]), dict(protocol='SCTP'),
                                   dict(source_node=[]), dict(source_ip='192.168.001.10')])
def test_invalid_packet(client, changes):
    assert client.post('/api/packet/create', json=packet(**changes)).status_code == 422


@pytest.mark.parametrize('flags', [[], {'weak_link': 'false'}, {'congestion_factor': -1},
                                 {'loss_override': 101}, {'disable_router': []}])
def test_invalid_flags(client, flags):
    assert client.post('/api/packet/simulate', json=packet(scenario_flags=flags)).status_code == 422


def test_strict_boolean(client):
    assert client.post('/api/topology/failure', json={'node_id': 'R2', 'is_active': 'false'}).status_code == 422


@pytest.mark.parametrize('query', ['limit=abc', 'limit=-1', 'offset=-2', 'limit=999999', 'limit=1.5'])
def test_pagination(client, query):
    assert client.get('/api/history?' + query).status_code == 422


@pytest.mark.parametrize('key', FEATURE_KEYS)
def test_missing_telemetry(client, key):
    metrics = dict(BASE)
    del metrics[key]
    assert client.post('/api/ai/analyze', json=metrics).status_code == 422


@pytest.mark.parametrize('changes', [{'latency': float('nan')}, {'throughput': -1}, {'ttl': True},
                                   {'hops': 1.2}, {'packet_loss': 101}, {'latency': None}])
def test_bad_telemetry(client, changes):
    assert client.post('/api/ai/analyze', json={**BASE, **changes}).status_code == 422


@pytest.mark.parametrize('changes,health,metric', [({'throughput': 0}, 'CRITICAL', 'throughput'),
                                               ({'ttl': 0}, 'CRITICAL', 'ttl'),
                                               ({'jitter': 25}, 'WARNING', 'jitter'),
                                               ({'retransmissions': 1}, 'WARNING', 'retransmissions'),
                                               ({'packet_loss': 5}, 'WARNING', 'packet_loss')])
def test_fallback_evidence(fallback, changes, health, metric):
    result = fallback.analyze_metrics({**BASE, **changes})
    assert result['health_status'] == health
    assert result['confidence'] is None
    assert result['health_confidence'] is None
    assert metric in [item['metric'] for item in result['evidence']]
    assert result['is_fallback']


def test_healthy_explanation_does_not_claim_hardware_condition(fallback):
    result = fallback.analyze_metrics(BASE)
    assert result['health_status'] == 'HEALTHY'
    assert 'cannot establish' in result['possible_cause']


def test_bundled_models_work_and_critical_override():
    analyzer = NetworkAIAnalyzer()
    assert analyzer.is_ml_active, analyzer.model_error
    result = analyzer.analyze_metrics({**BASE, 'throughput': 0})
    assert not result['is_fallback']
    assert result['health_status'] == 'CRITICAL'
    assert result['is_anomaly']
    assert result['confidence'] is None
    assert 0 <= result['health_confidence'] <= 1


def test_inference_failure_is_reported(monkeypatch):
    analyzer = NetworkAIAnalyzer()
    def fail(*args):
        raise RuntimeError('forced inference failure')
    monkeypatch.setattr(analyzer.scaler, 'transform', fail)
    result = analyzer.analyze_metrics(BASE)
    assert result['is_fallback']
    assert not analyzer.is_ml_active
    assert result['anomaly_score'] is None


@pytest.mark.parametrize('scenario_id', list(SCENARIOS))
def test_all_scenarios_persist_and_agree(client, scenario_id):
    response = client.post('/api/scenario/run', json={'scenario_id': scenario_id})
    assert response.status_code == 200, response.json
    result = response.json
    sim = result['simulation']
    assert sim['packet_data']['source_ip'] == sim['routing']['node_details'][0]['ip']
    assert result['ai_analysis']['features_analyzed']['ttl'] == sim['metrics']['ttl']
    delivered = sim['metrics']['status'].startswith('DELIVERED')
    assert any(step['phase'] == 'DECAPSULATION' for step in sim['trajectory']) == delivered
    record = client.get(f"/api/history/{result['record_id']}").json['record']
    assert record['ai_confidence'] is None
    assert record['status'] == sim['metrics']['status']


def test_presets_do_not_mutate_manual_topology(client):
    client.post('/api/topology/failure', json={'node_id': 'R3', 'is_active': False})
    result = client.post('/api/scenario/run', json={'scenario_id': 'ROUTER_FAILURE'}).json
    assert 'R3' in result['simulation']['routing']['path']
    assert client.get('/api/topology').json['topology']['disabled_nodes'] == ['R3']


def test_routing_failure(client):
    for node in ('R2', 'R3'):
        client.post('/api/topology/failure', json={'node_id': node, 'is_active': False})
    assert client.post('/api/packet/simulate', json=packet()).status_code == 400


def test_selected_node_ip_must_match(client):
    assert client.post('/api/packet/simulate', json=packet(source_node='Laptop1')).status_code == 400


@pytest.mark.parametrize('protocol', ['TCP', 'UDP', 'ICMP'])
def test_total_loss_has_no_delivery(protocol):
    sim = PacketEngine().simulate_journey(packet(protocol=protocol), {'loss_override': 100})
    assert sim['metrics']['status'] == 'DROPPED'
    assert sim['traversed_path'][-1] != 'Server1'
    assert not any(step['phase'] == 'DECAPSULATION' for step in sim['trajectory'])


@pytest.mark.parametrize('protocol', ['UDP', 'ICMP'])
def test_forced_unreliable_drop(protocol):
    sim = PacketEngine().simulate_journey(packet(protocol=protocol), {'simulate_drop': True})
    assert sim['metrics']['status'] == 'DROPPED'
    assert sim['metrics']['retransmissions'] == 0


def test_tcp_forced_recovery():
    sim = PacketEngine().simulate_journey(packet(), {'simulate_drop': True})
    assert sim['metrics']['status'] == 'DELIVERED_WITH_RETRANSMISSION'
    assert sim['metrics']['retransmissions'] >= 1
    assert any(step['phase'] == 'RETRANSMISSION' for step in sim['trajectory'])


@pytest.mark.parametrize('ttl,last,delivered', [(1, 'R1', False), (2, 'R2', False), (3, 'Server1', True)])
def test_ttl_only_decrements_at_forwarding_routers(ttl, last, delivered):
    sim = PacketEngine().simulate_journey(packet(ttl=ttl))
    assert sim['traversed_path'][-1] == last
    assert sim['metrics']['ttl'] == (ttl - 2 if delivered else 0)
    assert sim['metrics']['status'].startswith('DELIVERED') == delivered


def test_direct_link_forced_drop():
    sim = PacketEngine().simulate_journey(packet(destination_node='SW1', destination_ip='192.168.1.254', protocol='UDP'), {'simulate_drop': True})
    assert sim['traversed_path'] == ['PC1']
    assert sim['metrics']['status'] == 'DROPPED'


def test_route_properties_and_disabled_links():
    topology = NetworkTopology()
    topology.disabled_links.add(('R1', 'R2'))
    result = topology.find_shortest_path('PC1', 'Server1')
    assert 'R3' in result['path']
    assert result['bandwidth_mbps'] == 250
    assert result['packet_loss'] == 3.96


def test_zero_loss_average_is_preserved(client):
    client.post('/api/scenario/run', json={'scenario_id': 'NORMAL'})
    assert client.get('/api/metrics').json['summary']['avg_packet_loss'] == 0


def test_history_deletion(client):
    record = client.post('/api/scenario/run', json={'scenario_id': 'NORMAL'}).json['record_id']
    assert client.delete(f'/api/history/{record}').status_code == 200
    assert client.delete(f'/api/history/{record}').status_code == 404


def test_packet_ids_do_not_replace_history(client):
    for _ in range(2):
        assert client.post('/api/packet/simulate', json=packet(packet_id='same')).status_code == 200
    assert client.get('/api/history').json['count'] == 2


def test_unknown_browser_origin_cannot_clear_history(client):
    response = client.post('/api/history/clear', headers={'Origin': 'https://untrusted.example'})
    assert response.status_code == 403


def test_null_congestion_is_rejected(client):
    assert client.post('/api/packet/simulate', json=packet(scenario_flags={'congestion_factor': None})).status_code == 422


def test_drop_is_explained_even_without_rate_threshold(fallback):
    result = fallback.analyze_metrics({**BASE, 'status': 'DROPPED'})
    assert result['health_status'] == 'CRITICAL'
    assert 'DROPPED' in result['reason']


def test_dataset_size_and_rng_isolation():
    import numpy as np
    from ai.dataset import generate_network_dataset
    np.random.seed(19)
    expected = np.random.random()
    np.random.seed(19)
    assert len(generate_network_dataset(17)) == 17
    assert np.random.random() == expected


def test_icmp_has_no_transport_ports():
    from simulation.encapsulation import EncapsulationEngine
    layers = EncapsulationEngine.generate_layers(packet(protocol='ICMP'))
    assert layers['osi_layers'][3]['header_data']['Protocol Number'] == '1 (ICMP)'
    assert layers['osi_layers'][4]['header_data'] == {}
    assert not any(step['layer'] == 'Transport (L4)' for step in layers['encapsulation_steps'])


def test_binary_preview_uses_utf8_and_limit():
    from simulation.encapsulation import EncapsulationEngine
    assert EncapsulationEngine.text_to_binary('é', 8) == '11000011 ... (truncated)'


def test_saved_dataset_split_matches_generated_samples():
    import pandas as pd
    from pathlib import Path
    from ai.dataset import generate_network_dataset
    folder = Path(__file__).resolve().parents[1] / 'models' / 'dataset'
    train = pd.read_csv(folder / 'train.csv')
    test = pd.read_csv(folder / 'test.csv')
    assert len(train) == 3200 and len(test) == 800
    assert set(train.sample_id).isdisjoint(test.sample_id)
    combined = pd.concat([train, test]).sort_values('sample_id').reset_index(drop=True)
    assert combined.sample_id.tolist() == list(range(4000))
    pd.testing.assert_frame_equal(combined.drop(columns='sample_id'), generate_network_dataset(4000, 42))


def test_saved_predictions_reproduce_model_evaluation():
    import hashlib
    import json
    import numpy as np
    import pandas as pd
    from pathlib import Path
    folder = Path(__file__).resolve().parents[1] / 'models'
    meta = json.loads((folder / 'training_metrics.json').read_text())
    for artifact in meta['dataset_files'].values():
        assert hashlib.sha256((folder / artifact['path']).read_bytes()).hexdigest() == artifact['sha256']
    test = pd.read_csv(folder / 'dataset' / 'test.csv')
    predictions = pd.read_csv(folder / 'dataset' / 'test_predictions.csv')
    assert predictions.sample_id.tolist() == test.sample_id.tolist()
    assert predictions.health_class.tolist() == test.health_class.tolist()
    assert predictions.anomaly.tolist() == test.anomaly.tolist()
    model = NetworkAIAnalyzer()
    vector = test[FEATURE_KEYS].values
    assert predictions.predicted_health.tolist() == model.health_classifier.predict(vector).tolist()
    raw = model.iso_forest.predict(model.scaler.transform(vector))
    assert predictions.predicted_anomaly.tolist() == np.where(raw == -1, 1, 0).tolist()
    health_accuracy = (predictions.predicted_health == test.health_class).mean()
    assert health_accuracy == pytest.approx(meta['health_classification_report']['accuracy'])
