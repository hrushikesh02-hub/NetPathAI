import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { api } from '../src/services/api.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test('offline dashboard and history do not fabricate successful results', async () => {
  globalThis.fetch = async () => { throw new Error('offline'); };
  await assert.rejects(api.getMetricsSummary(), /offline/);
  await assert.rejects(api.getHistory(), /offline/);
  assert.equal((await api.getHealth()).status, 'offline');
});

test('history mutations report HTTP failures', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 500, json: async () => ({ success: false }) });
  await assert.rejects(api.clearHistory(), /500/);
  await assert.rejects(api.deleteHistory(1), /500/);
});

test('simulation validation details reach the user', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 422, json: async () => ({
    message: 'Validation failed', errors: { ttl: 'TTL must be an integer.' }
  }) });
  await assert.rejects(api.simulateJourney({}), /TTL must be an integer/);
});

test('zero-valued metrics survive the API client', async () => {
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ summary: { avg_throughput: 0, avg_packet_loss: 0 } }) });
  assert.deepEqual(await api.getMetricsSummary(), { avg_throughput: 0, avg_packet_loss: 0 });
});
