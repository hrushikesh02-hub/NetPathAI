import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import TopologyCanvas from '../components/TopologyCanvas';
import { api } from '../services/api';

export default function NetworkTopology() {
  const [topology, setTopology] = useState({ nodes: [], links: [] });
  const [disabledNodes, setDisabledNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopology = async () => {
    setLoading(true);
    try {
      const data = await api.getTopology();
      setTopology(data);
      const disabled = (data.nodes || []).filter(n => n.status === 'offline').map(n => n.id);
      setDisabledNodes(disabled);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopology();
  }, []);

  const handleToggleNode = async (nodeId, makeActive) => {
    try {
      await api.toggleNodeFailure(nodeId, makeActive);
      setDisabledNodes(prev => {
        if (makeActive) return prev.filter(id => id !== nodeId);
        return [...prev, nodeId];
      });
      await fetchTopology();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold uppercase tracking-wider">
              Network Graph & Dijkstra Engine
            </span>
            <span className="text-xs text-slate-400">Layer 2/3 Switching & Routing Infrastructure</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Interactive Enterprise Network Topology
          </h1>
        </div>

        <button
          onClick={fetchTopology}
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center space-x-2 border border-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH TOPOLOGY</span>
        </button>
      </div>

      {/* Main Topology Graph Canvas */}
      <TopologyCanvas
        nodes={topology.nodes || []}
        links={topology.links || []}
        activePath={['PC1', 'Switch1', 'Router1', 'Router2', 'Router3', 'Switch2', 'Server1']}
        currentHop={null}
        disabledNodes={disabledNodes}
        onToggleNode={handleToggleNode}
      />

      {/* Device Inventory & Failure Simulator Table */}
      <div className="glass-panel rounded-xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Network Infrastructure Device Inventory</h3>
            <p className="text-xs text-slate-400">Toggle online/offline state to observe dynamic Dijkstra link-state convergence</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="pb-3">Device Node</th>
                <th className="pb-3">Role / Description</th>
                <th className="pb-3">IPv4 Address</th>
                <th className="pb-3">MAC Address</th>
                <th className="pb-3">Subnet</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Failure Injection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {topology.nodes?.map((node) => {
                const isOffline = disabledNodes.includes(node.id) || node.status === 'offline';
                return (
                  <tr key={node.id} className="hover:bg-slate-800/30">
                    <td className="py-3 text-white font-bold font-sans flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>{node.label} ({node.id})</span>
                    </td>
                    <td className="py-3 text-slate-300 font-sans uppercase text-[11px] font-semibold text-sky-400">
                      {node.type}
                    </td>
                    <td className="py-3 text-slate-200">{node.ip}</td>
                    <td className="py-3 text-slate-400 text-[11px]">{node.mac}</td>
                    <td className="py-3 text-slate-400">{node.subnet}</td>
                    <td className="py-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isOffline ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {isOffline ? 'OFFLINE / FAILED' : 'ONLINE'}
                      </span>
                    </td>
                    <td className="py-3 text-right font-sans">
                      <button
                        onClick={() => handleToggleNode(node.id, isOffline)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                          isOffline
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-rose-600 hover:bg-rose-500 text-white'
                        }`}
                      >
                        {isOffline ? 'Restore Node' : 'Simulate Fault'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
