import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Percent, 
  Zap, 
  ShieldAlert, 
  Play, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

import MetricCard from '../components/MetricCard';
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

  const handleQuickRun = async (scenarioId) => {
    setQuickRunning(true);
    try {
      await api.runScenario(scenarioId);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setQuickRunning(false);
    }
  };

  const chartData = summary?.recent_packets && summary.recent_packets.length > 0
    ? summary.recent_packets.slice(0, 10).reverse().map((p, idx) => ({
        name: `#${p.packet_id || idx + 1}`,
        latency: p.latency,
        loss: p.packet_loss,
        throughput: p.throughput,
        retransmissions: p.retransmissions
      }))
    : [
        { name: '#1', latency: 18, loss: 0, throughput: 650 },
        { name: '#2', latency: 24, loss: 0, throughput: 620 },
        { name: '#3', latency: 22, loss: 0, throughput: 640 },
        { name: '#4', latency: 310, loss: 18, throughput: 45 },
        { name: '#5', latency: 25, loss: 0, throughput: 630 }
      ];

  const healthState = summary?.network_health || 'HEALTHY';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Welcome & Network Health Card */}
      <div className="glass-panel rounded-xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Autonomous Telemetry & AI Anomaly Detection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Network Telemetry Dashboard
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Real-time simulation of OSI & TCP/IP layer encapsulation, Dijkstra routing, packet drop recovery, and Machine Learning anomaly detection.
            </p>
          </div>

          {/* Network Health Card */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900 border border-slate-800 min-w-[200px] text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Network Health Status
            </span>
            <div className="flex items-center space-x-2 my-1">
              <span className={`w-3 h-3 rounded-full ${
                healthState === 'HEALTHY' ? 'bg-emerald-400' : healthState === 'WARNING' ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'
              }`} />
              <span className={`text-lg font-bold ${
                healthState === 'HEALTHY' ? 'text-emerald-400' : healthState === 'WARNING' ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {healthState}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Continuous Telemetry Assessment</span>
          </div>
        </div>

        {/* Quick Simulation Presets */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-300">Quick Presets:</span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'NORMAL', label: 'Normal Traffic', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20' },
              { id: 'HIGH_LATENCY', label: 'High Latency Spike', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20' },
              { id: 'PACKET_LOSS', label: 'Packet Loss & Retransmit', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20' },
              { id: 'CONGESTION', label: 'Buffer Congestion', color: 'bg-orange-500/10 text-orange-300 border-orange-500/30 hover:bg-orange-500/20' },
              { id: 'ROUTER_FAILURE', label: 'Router R2 Failure', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20' },
            ].map((sc) => (
              <button
                key={sc.id}
                disabled={quickRunning}
                onClick={() => handleQuickRun(sc.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1.5 ${sc.color} disabled:opacity-50`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{sc.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Packets Simulated"
          value={summary?.total_packets || 0}
          unit="pkts"
          icon={Activity}
          subtitle="Processed through simulation engine"
          color="sky"
        />
        <MetricCard
          title="Successful Deliveries"
          value={summary?.successful_packets || 0}
          unit="pkts"
          icon={CheckCircle2}
          subtitle="Reached destination host"
          color="emerald"
          badge={`${summary?.total_packets ? Math.round((summary.successful_packets / summary.total_packets) * 100) : 100}% Rate`}
          badgeColor="emerald"
        />
        <MetricCard
          title="Average Latency"
          value={summary?.avg_latency || 24.5}
          unit="ms"
          icon={Clock}
          subtitle="Propagation + Queueing delay"
          color="indigo"
        />
        <MetricCard
          title="Detected AI Anomalies"
          value={summary?.anomaly_count || 0}
          unit="flags"
          icon={ShieldAlert}
          subtitle="Isolation Forest identified outliers"
          color={summary?.anomaly_count > 0 ? "rose" : "sky"}
          badge={summary?.anomaly_count > 0 ? "Action Required" : "Optimal"}
          badgeColor={summary?.anomaly_count > 0 ? "rose" : "sky"}
        />
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Average Packet Loss"
          value={summary?.avg_packet_loss || 0.0}
          unit="%"
          icon={Percent}
          subtitle="Interface drops / CRC errors"
          color="rose"
        />
        <MetricCard
          title="Average Throughput"
          value={summary?.avg_throughput || 450.0}
          unit="Mbps"
          icon={Zap}
          subtitle="Effective bandwidth transmission"
          color="emerald"
        />
        <MetricCard
          title="Lost / Dropped Packets"
          value={summary?.lost_packets || 0}
          unit="pkts"
          icon={XCircle}
          subtitle="Discarded before destination"
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latency & Loss Chart */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Latency Trend (ms)</h3>
            <span className="text-xs text-slate-400 font-mono">Recent Telemetry</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="latency" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#latGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Throughput Distribution Chart */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Throughput Distribution (Mbps)</h3>
            <span className="text-xs text-slate-400 font-mono">Bandwidth Utilization</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="throughput" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Simulation Journeys Table */}
      <div className="glass-panel rounded-xl border border-slate-800 p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Packet Journey Simulations</h3>
            <p className="text-xs text-slate-400">Chronological telemetry records stored in SQLite database</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <th className="pb-3">Packet ID</th>
                <th className="pb-3">Source → Destination</th>
                <th className="pb-3">Protocol</th>
                <th className="pb-3">Latency</th>
                <th className="pb-3">Loss %</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">AI Diagnosis</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {summary?.recent_packets && summary.recent_packets.length > 0 ? (
                summary.recent_packets.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-bold text-sky-400">{p.packet_id}</td>
                    <td className="py-3 text-slate-300 font-sans">
                      {p.source_ip} <span className="text-slate-500">→</span> {p.destination_ip}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-bold border border-slate-800">
                        {p.protocol} ({p.app_protocol})
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{p.latency} ms</td>
                    <td className="py-3 text-slate-300">{p.packet_loss}%</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status.includes('DELIVERED') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.ai_status === 'anomaly' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {p.ai_health || (p.ai_status === 'anomaly' ? 'ANOMALY' : 'NORMAL')}
                      </span>
                    </td>
                    <td className="py-3 text-right font-sans">
                      <Link
                        to="/simulator"
                        className="text-sky-400 hover:text-sky-300 text-xs font-semibold"
                      >
                        Replay
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No simulation records yet. Click a preset above or open the Packet Simulator to start.
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
