import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Play, 
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickRunning, setQuickRunning] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    const data = await api.getMetricsSummary();
    setSummary(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const navigate = useNavigate();

  const handleQuickRun = (scenarioId) => {
    navigate(`/simulator?scenario=${scenarioId}`);
  };

  const healthState = summary?.network_health || 'HEALTHY';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor your network simulations and history.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 border border-slate-200 min-w-[150px] text-center">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              System Status
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${
                healthState === 'HEALTHY' ? 'bg-emerald-500' : healthState === 'WARNING' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              <span className={`text-sm font-bold ${
                healthState === 'HEALTHY' ? 'text-emerald-700' : healthState === 'WARNING' ? 'text-amber-700' : 'text-red-700'
              }`}>
                {healthState}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-700 mr-2">Quick Actions:</span>
          {[
            { id: 'NORMAL', label: 'Simulate Normal Traffic', color: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200' },
            { id: 'PACKET_LOSS', label: 'Simulate Packet Loss', color: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200' },
            { id: 'ROUTER_FAILURE', label: 'Simulate Node Failure', color: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200' },
          ].map((sc) => (
            <button
              key={sc.id}
              disabled={quickRunning}
              onClick={() => handleQuickRun(sc.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-all flex items-center space-x-2 ${sc.color} disabled:opacity-50 shadow-sm`}
            >
              <Play className="w-4 h-4 text-blue-600" />
              <span>{sc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">Total Packets</span>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{summary?.total_packets || 0}</span>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">Delivered</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{summary?.successful_packets || 0}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">Avg Latency</span>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{summary?.avg_latency || 0} <span className="text-sm text-slate-400 font-normal">ms</span></span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">Failed / Dropped</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{summary?.lost_packets || 0}</span>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Recent Simulations</h3>
          <Link
            to="/history"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">ID</th>
                <th className="pb-3 font-semibold">Route</th>
                <th className="pb-3 font-semibold">Protocol</th>
                <th className="pb-3 font-semibold">Latency</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary?.recent_packets && summary.recent_packets.length > 0 ? (
                summary.recent_packets.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-medium text-slate-900">{p.packet_id}</td>
                    <td className="py-3 text-slate-600">
                      {p.source_ip} <span className="text-slate-400 mx-1">→</span> {p.destination_ip}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                        {p.protocol}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">{p.latency} ms</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        p.status?.includes('DELIVERED') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {p.status?.includes('DELIVERED') ? 'Delivered' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">
                      {p.ai_health || 'Normal'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No records found. Run a simulation to see data here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
