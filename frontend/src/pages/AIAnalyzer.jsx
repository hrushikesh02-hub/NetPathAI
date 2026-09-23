import React, { useState, useEffect } from 'react';
import { Sliders, BarChart2 } from 'lucide-react';
import AIExplanationCard from '../components/AIExplanationCard';
import { api } from '../services/api';

export default function AIAnalyzer() {
  const [metrics, setMetrics] = useState({
    latency: 24.5,
    packet_loss: 0.0,
    throughput: 550.0,
    retransmissions: 0,
    packet_size: 1024,
    ttl: 64,
    hops: 4,
    jitter: 2.1
  });

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async (customMetrics = metrics) => {
    setLoading(true);
    try {
      const result = await api.analyzeTelemetry(customMetrics);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const handleSliderChange = (field, val) => {
    const num = parseFloat(val);
    const updated = { ...metrics, [field]: num };
    setMetrics(updated);
    runAnalysis(updated);
  };

  const loadPreset = (presetName) => {
    let p = {};
    if (presetName === 'healthy') {
      p = { latency: 18.0, packet_loss: 0.0, throughput: 680.0, retransmissions: 0, packet_size: 1024, ttl: 64, hops: 4, jitter: 1.5 };
    } else if (presetName === 'high_latency') {
      p = { latency: 320.0, packet_loss: 2.0, throughput: 110.0, retransmissions: 1, packet_size: 1024, ttl: 58, hops: 6, jitter: 45.0 };
    } else if (presetName === 'heavy_loss') {
      p = { latency: 95.0, packet_loss: 22.0, throughput: 35.0, retransmissions: 6, packet_size: 1500, ttl: 54, hops: 5, jitter: 18.0 };
    } else if (presetName === 'congestion') {
      p = { latency: 260.0, packet_loss: 14.0, throughput: 28.0, retransmissions: 5, packet_size: 1420, ttl: 48, hops: 7, jitter: 38.0 };
    }
    setMetrics(p);
    runAnalysis(p);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider">
              Scikit-Learn ML Inference Engine
            </span>
            <span className="text-xs text-slate-400">Isolation Forest & Random Forest Classifiers</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Intelligent AI Network Telemetry Analyzer
          </h1>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadPreset('healthy')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
          >
            Healthy Preset
          </button>
          <button
            onClick={() => loadPreset('high_latency')}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
          >
            Latency Spike
          </button>
          <button
            onClick={() => loadPreset('heavy_loss')}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/20 transition-colors"
          >
            Packet Loss Outlier
          </button>
          <button
            onClick={() => loadPreset('congestion')}
            className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/30 text-xs font-semibold hover:bg-orange-500/20 transition-colors"
          >
            Buffer Congestion
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Feature Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-xl border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Network Telemetry Parameter Controls
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Real-time Feature Vector</span>
            </div>

            {/* Slider 1: Latency */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Latency (Round-Trip Time)</span>
                <span className="font-mono text-sky-400 font-bold">{metrics.latency} ms</span>
              </div>
              <input
                type="range"
                min="1"
                max="500"
                step="1"
                value={metrics.latency}
                onChange={(e) => handleSliderChange('latency', e.target.value)}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1ms (LAN)</span>
                <span>200ms (WAN)</span>
                <span>500ms (Severe Delay)</span>
              </div>
            </div>

            {/* Slider 2: Packet Loss */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Packet Loss Percentage</span>
                <span className="font-mono text-rose-400 font-bold">{metrics.packet_loss}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={metrics.packet_loss}
                onChange={(e) => handleSliderChange('packet_loss', e.target.value)}
                className="w-full accent-rose-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0% (Ideal)</span>
                <span>5% (Degraded)</span>
                <span>50% (Critical)</span>
              </div>
            </div>

            {/* Slider 3: Throughput */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Effective Throughput</span>
                <span className="font-mono text-emerald-400 font-bold">{metrics.throughput} Mbps</span>
              </div>
              <input
                type="range"
                min="1"
                max="1000"
                step="10"
                value={metrics.throughput}
                onChange={(e) => handleSliderChange('throughput', e.target.value)}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 Mbps (Bottleneck)</span>
                <span>500 Mbps</span>
                <span>1000 Mbps (Gigabit)</span>
              </div>
            </div>

            {/* Slider 4: Retransmissions */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">TCP Retransmission Count</span>
                <span className="font-mono text-amber-400 font-bold">{metrics.retransmissions} retries</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={metrics.retransmissions}
                onChange={(e) => handleSliderChange('retransmissions', e.target.value)}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Sub sliders */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Hops Count</span>
                  <span className="font-mono text-sky-400 font-bold">{metrics.hops}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={metrics.hops}
                  onChange={(e) => handleSliderChange('hops', e.target.value)}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Jitter</span>
                  <span className="font-mono text-purple-400 font-bold">{metrics.jitter} ms</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={metrics.jitter}
                  onChange={(e) => handleSliderChange('jitter', e.target.value)}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: AI Live Inference Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <AIExplanationCard analysis={analysis} loading={loading} />

          {/* Feature Importance & ML Metadata Card */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <BarChart2 className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                ML Feature Importance Weights
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { feature: 'Packet Loss Rate (%)', weight: 35, color: 'bg-rose-500' },
                { feature: 'Latency / RTT (ms)', weight: 28, color: 'bg-sky-500' },
                { feature: 'TCP Retransmission Count', weight: 20, color: 'bg-amber-500' },
                { feature: 'Effective Throughput (Mbps)', weight: 12, color: 'bg-emerald-500' },
                { feature: 'Jitter & Buffer Delay (ms)', weight: 5, color: 'bg-purple-500' }
              ].map((f) => (
                <div key={f.feature} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">{f.feature}</span>
                    <span className="font-mono text-slate-400 font-bold">{f.weight}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div className={`h-full ${f.color} rounded-full`} style={{ width: `${f.weight}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[10px] text-slate-500 leading-relaxed border-t border-slate-800">
              Trained on synthetic network telemetry profiles simulating LAN, WAN, Congestion, Buffer Bloat, and Hardware Fault patterns.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
