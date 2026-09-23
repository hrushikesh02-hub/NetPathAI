import React from 'react';

export default function MetricCard({
  title,
  value,
  unit = '',
  icon: Icon,
  subtitle,
  badge,
  badgeColor = 'sky',
  color = 'sky',
  className = ''
}) {
  const colorStyles = {
    sky: 'border-sky-500/20 text-sky-400 bg-sky-500/10',
    cyan: 'border-sky-500/20 text-sky-400 bg-sky-500/10',
    emerald: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10',
    amber: 'border-amber-500/20 text-amber-400 bg-amber-500/10',
    rose: 'border-rose-500/20 text-rose-400 bg-rose-500/10',
    purple: 'border-purple-500/20 text-purple-400 bg-purple-500/10',
    indigo: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/10'
  };

  const badgeStyles = {
    sky: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    cyan: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
  };

  return (
    <div className={`glass-panel rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all duration-150 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
            {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-lg border ${colorStyles[color] || colorStyles.sky}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {(subtitle || badge) && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400 text-[11px] truncate">{subtitle}</span>}
          {badge && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeStyles[badgeColor] || badgeStyles.sky}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
