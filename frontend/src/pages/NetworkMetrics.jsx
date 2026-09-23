import React, { useState, useEffect } from 'react';
import { Clock, Percent, Zap, RefreshCw, ShieldAlert } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Legend 
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { api } from '../services/api';

export default function NetworkMetrics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getMetricsSummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const telemetryData = summary?.recent_packets && summary.recent_packets.length > 0
    ? summary.recent_packets.slice(0, 15).reverse().map((p, idx) => ({
        id: `#${p.packet_id || idx + 1}`,
        latency: p.latency,
        loss: p.packet_loss,
        throughput: p.throughput,
        retransmits: p.retransmissions
      }))
    : [
        { id: '#1', latency: 15, loss: 0, throughput: 650, retransmits: 0 },
        { id: '#2', latency: 22, loss: 0, throughput: 610, retransmits: 0 },
        { id: '#3', latency: 310, loss: 12, throughput: 60, retransmits: 3 },
        { id: '#4', latency: 28, loss: 0, throughput: 590, retransmits: 0 },
        { id: '#5', latency: 95, loss: 4, throughput: 280, retransmits: 1 }
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
              Network Telemetry & Analytics
            </span>
            <span className="text-xs text-slate-400">Quality of Service (QoS) Parameter Monitoring</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Performance Metrics & QoS Analytics
          </h1>
        </div>

        <button
          onClick={fetchMetrics}
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center space-x-2 border border-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH TELEMETRY</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Average Latency (RTT)"
          value={summary?.avg_latency || 24.5}
          unit="ms"
          icon={Clock}
          color="sky"
          subtitle="One-way + Queue delay"
        />
        <MetricCard
          title="Average Packet Loss"
          value={summary?.avg_packet_loss || 0.0}
          unit="%"
          icon={Percent}
          color="rose"
          subtitle="Packet drop percentage"
        />
        <MetricCard
          title="Average Throughput"
          value={summary?.avg_throughput || 480.0}
          unit="Mbps"
          icon={Zap}
          color="emerald"
          subtitle="Effective bandwidth utilization"
        />
        <MetricCard
          title="Anomaly Incidents"
          value={summary?.anomaly_count || 0}
          unit="events"
          icon={ShieldAlert}
          color={summary?.anomaly_count > 0 ? "rose" : "indigo"}
          subtitle="Isolation Forest detections"
        />
      </div>

      {/* Detailed Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Latency Curve */}
        <div className="glass-panel rounded-xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Latency Trend (ms)</h3>
            <span className="text-xs text-sky-400 font-mono">QoS Delay Curve</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData}>
                <defs>
                  <linearGradient id="metricLat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="id" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="latency" stroke="#38bdf8" strokeWidth={2} fill="url(#metricLat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Throughput vs Loss */}
        <div className="glass-panel rounded-xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Throughput (Mbps) vs Retransmissions</h3>
            <span className="text-xs text-emerald-400 font-mono">TCP Flow Control</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={telemetryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="id" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="throughput" name="Throughput (Mbps)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="retransmits" name="Retransmits" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
