/**
 * NetPath AI Frontend API Client.
 * Communicates with the Flask REST Backend with transparent error handling.
 */

const API_BASE = '/api';

export const api = {
  // System Health
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend offline or health check failed:', err.message);
      return { status: 'offline', service: 'Local Fallback Mode', ml_model_active: false };
    }
  },

  // Topology
  async getTopology() {
    try {
      const res = await fetch(`${API_BASE}/topology`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('getTopology error:', err);
      throw err;
    }
  },

  // Toggle Router/Node Failure
  async toggleNodeFailure(nodeId, isActive) {
    try {
      const res = await fetch(`${API_BASE}/topology/failure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: nodeId, is_active: isActive })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('toggleNodeFailure error:', err);
      throw err;
    }
  },

  // Generate / Create Packet Encapsulation
  async createPacket(packetData) {
    try {
      const res = await fetch(`${API_BASE}/packet/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packetData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create packet');
      return data;
    } catch (err) {
      console.error('createPacket error:', err);
      throw err;
    }
  },

  // Full Journey Simulation
  async simulateJourney(packetData, scenarioFlags = {}) {
    try {
      const res = await fetch(`${API_BASE}/packet/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...packetData, scenario_flags: scenarioFlags })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Simulation failed');
      return data;
    } catch (err) {
      console.error('simulateJourney error:', err);
      throw err;
    }
  },

  // AI Telemetry Analyzer
  async analyzeTelemetry(metrics) {
    try {
      const res = await fetch(`${API_BASE}/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI analysis failed');
      return data.analysis;
    } catch (err) {
      console.error('analyzeTelemetry error:', err);
      throw err;
    }
  },

  // Dashboard Metrics Summary
  async getMetricsSummary() {
    try {
      const res = await fetch(`${API_BASE}/metrics`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.summary;
    } catch (err) {
      console.warn('getMetricsSummary fallback:', err.message);
      return {
        total_packets: 0,
        successful_packets: 0,
        lost_packets: 0,
        avg_latency: 24.5,
        avg_packet_loss: 0.0,
        avg_throughput: 500.0,
        anomaly_count: 0,
        network_health: 'HEALTHY',
        health_badge: 'emerald',
        recent_packets: []
      };
    }
  },

  // Scenarios
  async getScenarios() {
    try {
      const res = await fetch(`${API_BASE}/scenarios`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.scenarios;
    } catch (err) {
      console.error('getScenarios error:', err);
      throw err;
    }
  },

  async runScenario(scenarioId) {
    try {
      const res = await fetch(`${API_BASE}/scenario/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_id: scenarioId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scenario run failed');
      return data;
    } catch (err) {
      console.error('runScenario error:', err);
      throw err;
    }
  },

  // History & Reports
  async getHistory(limit = 50, offset = 0) {
    try {
      const res = await fetch(`${API_BASE}/history?limit=${limit}&offset=${offset}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.history || [];
    } catch (err) {
      console.error('getHistory error:', err);
      return [];
    }
  },

  async getHistoryById(id) {
    try {
      const res = await fetch(`${API_BASE}/history/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.record;
    } catch (err) {
      console.error('getHistoryById error:', err);
      throw err;
    }
  },

  async deleteHistory(id) {
    try {
      const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (err) {
      console.error('deleteHistory error:', err);
      throw err;
    }
  },

  async clearHistory() {
    try {
      const res = await fetch(`${API_BASE}/history/clear`, { method: 'POST' });
      return await res.json();
    } catch (err) {
      console.error('clearHistory error:', err);
      throw err;
    }
  }
};
