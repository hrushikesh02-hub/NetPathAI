import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  Layers, 
  ArrowRight, 
  AlertOctagon, 
  RefreshCw, 
  CheckCircle2
} from 'lucide-react';

export default function PathTimeline({
  trajectory = [],
  currentStepIndex = 0,
  isPlaying = false,
  onPlay = () => {},
  onPause = () => {},
  onReset = () => {},
  onStepForward = () => {},
  onStepBack = () => {},
  onSeekStep = () => {},
  playbackSpeed = 1000,
  onChangeSpeed = () => {}
}) {
  if (!trajectory || trajectory.length === 0) return null;

  const currentStep = trajectory[currentStepIndex] || trajectory[0];
  const progressPercent = Math.round(((currentStepIndex + 1) / trajectory.length) * 100);

  const getStepIcon = (phase) => {
    switch (phase) {
      case 'ENCAPSULATION': return Layers;
      case 'TOPOLOGY_HOP': return ArrowRight;
      case 'PACKET_LOSS': return AlertOctagon;
      case 'RETRANSMISSION': return RefreshCw;
      case 'DECAPSULATION': return CheckCircle2;
      default: return ArrowRight;
    }
  };

  const getStepColor = (phase) => {
    switch (phase) {
      case 'PACKET_LOSS': return 'bg-rose-500 text-white border-rose-400';
      case 'RETRANSMISSION': return 'bg-amber-500 text-slate-950 border-amber-400';
      case 'DECAPSULATION': return 'bg-emerald-500 text-slate-950 border-emerald-400';
      default: return 'bg-sky-500 text-slate-950 border-sky-400';
    }
  };

  return (
    <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
      
      {/* Playback Controls & Progress */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{currentStepIndex >= trajectory.length - 1 ? 'REPLAY JOURNEY' : 'START JOURNEY'}</span>
              </>
            )}
          </button>

          <button
            onClick={onStepBack}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 transition-colors"
            title="Step Back"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onStepForward}
            disabled={currentStepIndex >= trajectory.length - 1}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 transition-colors"
            title="Step Forward"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Reset to Start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Speed:</span>
          {[
            { label: '0.5x', delay: 1800 },
            { label: '1x', delay: 1000 },
            { label: '2x', delay: 500 },
            { label: '4x', delay: 250 }
          ].map(s => (
            <button
              key={s.label}
              onClick={() => onChangeSpeed(s.delay)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
                playbackSpeed === s.delay
                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span className="font-semibold text-white">
            Step {currentStepIndex + 1} of {trajectory.length}: {currentStep.phase}
          </span>
          <span className="font-mono text-sky-400">{progressPercent}% Completed</span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-sky-500 transition-all duration-200 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Current Step Active Card */}
      <div className={`p-4 rounded-lg border transition-all duration-150 ${
        currentStep.phase === 'PACKET_LOSS'
          ? 'bg-rose-950/20 border-rose-500/30'
          : currentStep.phase === 'RETRANSMISSION'
          ? 'bg-amber-950/20 border-amber-500/30'
          : 'bg-slate-900/70 border-slate-800'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg border font-bold ${getStepColor(currentStep.phase)}`}>
            {React.createElement(getStepIcon(currentStep.phase), { className: 'w-4 h-4' })}
          </div>
          <div className="space-y-1 flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">{currentStep.action}</span>
              <span className="text-[11px] font-mono text-slate-400">
                Node: <strong className="text-sky-300">{currentStep.current_node}</strong>
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">{currentStep.description}</p>
            {currentStep.visual && (
              <div className="mt-2 p-2 rounded bg-slate-950 border border-slate-800 text-sky-300 font-mono text-[11px] break-all">
                {currentStep.visual}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Trajectory Breadcrumbs */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Packet Journey Hops (Click any step to inspect):</span>
          <span>{currentStepIndex + 1} / {trajectory.length}</span>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none text-[11px]">
          {trajectory.map((step, idx) => {
            const isPassed = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <button
                key={`traj-step-${idx}`}
                onClick={() => {
                  onPause();
                  onSeekStep(idx);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-sm'
                    : isPassed
                    ? 'bg-slate-900 text-slate-200 border-slate-700 hover:border-sky-500/40'
                    : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
                title={`Hop ${idx + 1}: ${step.action} at ${step.current_node}`}
              >
                <span className="font-mono">{idx + 1}.</span>
                <span className="font-medium">{step.current_node}</span>
                <span className="opacity-70 text-[9.5px]">({step.phase.substring(0, 4)})</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
