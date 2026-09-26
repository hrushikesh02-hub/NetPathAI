import React from 'react';
import { Cpu, AlertTriangle, ShieldAlert, Sparkles, Wrench, AlertCircle } from 'lucide-react';

export default function AIExplanationCard({ analysis = null, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse space-y-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-36 bg-slate-200 rounded" />
            <div className="h-3 w-24 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="h-16 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center shadow-sm">
        <Cpu className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-700">Analyzer Idle</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Start a simulation to see network diagnostics and AI health analysis.
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
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MODERATE': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getHealthColor = (h) => {
    switch (h) {
      case 'CRITICAL': return 'text-red-700 bg-red-50 border-red-200';
      case 'WARNING': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className={`bg-white rounded-xl border p-6 transition-all duration-300 hover:border-blue-300 hover:shadow-md shadow-sm ${
      isAnomaly ? 'border-red-200 hover:border-red-400' : 'border-slate-200'
    }`}>
      
      {/* Fallback Notice */}
      {analysis.is_fallback && (
        <div className="mb-4 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center space-x-2 text-xs text-amber-700">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{analysis.fallback_message || 'AI service unavailable — using fallback rules.'}</span>
        </div>
      )}

      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg border ${
            isAnomaly ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}>
            {isAnomaly ? <ShieldAlert className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {isAnomaly ? 'Issue Detected' : 'Network is Healthy'}
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskColor(risk)}`}>
                {risk} RISK
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Engine: <span className="text-slate-700 font-medium">{analysis.model_source || 'Anomaly Detector'}</span>
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Health State</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${getHealthColor(health)}`}>
              {health}
            </span>
          </div>

          <div className="text-right pl-3 border-l border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Confidence</span>
            <span className="text-sm font-bold text-blue-600 font-mono">
              {confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Diagnostics */}
      <div className="mt-4 space-y-3 text-sm">
        
        {/* Reason */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-1.5 text-slate-700 font-semibold mb-1">
            <AlertTriangle className={`w-4 h-4 ${isAnomaly ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span>Observation:</span>
          </div>
          <p className="text-slate-600 leading-relaxed pl-5 text-xs">
            {analysis.reason || 'Traffic looks normal and is within expected bounds.'}
          </p>
        </div>

        {/* Cause */}
        {analysis.possible_cause && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center space-x-1.5 text-slate-700 font-semibold mb-1">
              <Cpu className="w-4 h-4 text-blue-500" />
              <span>Possible Cause:</span>
            </div>
            <p className="text-slate-600 leading-relaxed pl-5 text-xs">
              {analysis.possible_cause}
            </p>
          </div>
        )}

        {/* Recommendation */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center space-x-1.5 text-blue-800 font-semibold mb-1">
            <Wrench className="w-4 h-4 text-blue-600" />
            <span>Recommendation:</span>
          </div>
          <p className="text-blue-700 leading-relaxed pl-5 text-xs">
            {analysis.recommendation || 'No action needed. Everything is operating normally.'}
          </p>
        </div>

      </div>

    </div>
  );
}
