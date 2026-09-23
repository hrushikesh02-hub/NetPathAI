import React from 'react';
import { Cpu, AlertTriangle, ShieldAlert, Sparkles, Wrench, AlertCircle } from 'lucide-react';

export default function AIExplanationCard({ analysis = null, loading = false }) {
  if (loading) {
    return (
      <div className="glass-panel rounded-xl border border-slate-800 p-6 animate-pulse space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800" />
          <div className="space-y-2">
            <div className="h-4 w-36 bg-slate-800 rounded" />
            <div className="h-3 w-24 bg-slate-800 rounded" />
          </div>
        </div>
        <div className="h-16 bg-slate-800/60 rounded-lg" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="glass-panel rounded-xl border border-slate-800 p-6 text-center">
        <Cpu className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-300">AI Telemetry Analyzer Idle</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Start a journey simulation or adjust parameters to trigger Isolation Forest anomaly detection and health classification.
        </p>
      </div>
    );
  }

  const isAnomaly = analysis.is_anomaly || analysis.status === 'anomaly';
  const health = analysis.health_status || 'HEALTHY';
  const risk = (analysis.risk_level || 'low').toUpperCase();
  const confidence = Math.round((analysis.confidence || 0.95) * 100);

  const getRiskColor = (r) => {
    switch (r) {
      case 'CRITICAL': return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'HIGH': return 'bg-orange-500/10 text-orange-300 border-orange-500/30';
      case 'MODERATE': return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      default: return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
  };

  const getHealthColor = (h) => {
    switch (h) {
      case 'CRITICAL': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'WARNING': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className={`glass-panel rounded-xl border p-6 transition-all duration-200 ${
      isAnomaly ? 'border-rose-500/30' : 'border-slate-800'
    }`}>
      
      {/* Fallback Notice */}
      {analysis.is_fallback && (
        <div className="mb-4 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center space-x-2 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{analysis.fallback_message || 'AI service unavailable — fallback network rule analyzer is active.'}</span>
        </div>
      )}

      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg border ${
            isAnomaly ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {isAnomaly ? <ShieldAlert className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isAnomaly ? 'ANOMALY DETECTED' : 'HEALTHY NETWORK TELEMETRY'}
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskColor(risk)}`}>
                {risk} RISK
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Engine: <span className="text-slate-300 font-medium">{analysis.model_source || 'Isolation Forest ML'}</span>
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Health State</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${getHealthColor(health)}`}>
              {health}
            </span>
          </div>

          <div className="text-right pl-3 border-l border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">AI Confidence</span>
            <span className="text-sm font-bold text-sky-400 font-mono">
              {confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Diagnostics */}
      <div className="mt-4 space-y-3 text-xs">
        
        {/* Reason */}
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="flex items-center space-x-1.5 text-slate-300 font-semibold mb-1">
            <AlertTriangle className={`w-3.5 h-3.5 ${isAnomaly ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span>Root Cause Observation:</span>
          </div>
          <p className="text-slate-300 leading-relaxed pl-5">
            {analysis.reason || 'Telemetry metrics operate strictly within expected QoS bounds.'}
          </p>
        </div>

        {/* Cause */}
        {analysis.possible_cause && (
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold mb-1">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Probable Network Cause:</span>
            </div>
            <p className="text-slate-300 leading-relaxed pl-5">
              {analysis.possible_cause}
            </p>
          </div>
        )}

        {/* Recommendation */}
        <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-500/20">
          <div className="flex items-center space-x-1.5 text-sky-300 font-semibold mb-1">
            <Wrench className="w-3.5 h-3.5 text-sky-400" />
            <span>Recommended Engineering Action:</span>
          </div>
          <p className="text-sky-200 leading-relaxed pl-5">
            {analysis.recommendation || 'No immediate remediation required. Continue automated telemetry collection.'}
          </p>
        </div>

      </div>

    </div>
  );
}
