import React, { useState } from 'react';
import { 
  Monitor, 
  Laptop, 
  Server, 
  Radio, 
  Network, 
  Router as RouterIcon, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function TopologyCanvas({
  nodes = [],
  links = [],
  activePath = [],
  currentHop = null,
  packetPosition = null,
  onToggleNode = null,
  disabledNodes = [],
  isSimulating = false
}) {
  const [selectedNode, setSelectedNode] = useState(null);

  const getNodeIcon = (type) => {
    switch (type) {
      case 'pc': return Monitor;
      case 'laptop': return Laptop;
      case 'access_point': return Radio;
      case 'switch': return Network;
      case 'router': return RouterIcon;
      case 'server': return Server;
      default: return Monitor;
    }
  };

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  const isLinkInActivePath = (src, tgt) => {
    if (!activePath || activePath.length < 2) return false;
    for (let i = 0; i < activePath.length - 1; i++) {
      if (
        (activePath[i] === src && activePath[i+1] === tgt) ||
        (activePath[i] === tgt && activePath[i+1] === src)
      ) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="relative bg-white rounded-xl border border-slate-200 p-4 shadow-sm overflow-hidden">
      
      {/* Topology Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-blue-500" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Network Topology</h3>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            Dijkstra Routing
          </span>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-600">Active Path</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-600">Node Failed</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Online</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-[380px] bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
        
        {/* Grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]" />

        <svg viewBox="0 0 1000 400" className="w-full h-full select-none">
          {/* 1. Draw Links */}
          {links.map((link, idx) => {
            const src = nodeMap[link.source];
            const tgt = nodeMap[link.target];
            if (!src || !tgt) return null;

            const isPathActive = isLinkInActivePath(link.source, link.target);
            const isSrcDisabled = disabledNodes.includes(link.source);
            const isTgtDisabled = disabledNodes.includes(link.target);
            const isFaulty = isSrcDisabled || isTgtDisabled;

            return (
              <g key={`link-${idx}`}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={isFaulty ? '#ef4444' : isPathActive ? '#3b82f6' : '#cbd5e1'}
                  strokeWidth={isPathActive ? 3 : 1.5}
                  strokeDasharray={isFaulty ? '4 4' : isPathActive ? '6 4' : 'none'}
                  className={isPathActive ? 'animate-flow' : ''}
                  strokeOpacity={isFaulty ? 0.4 : isPathActive ? 0.9 : 0.6}
                />

                {/* Link Latency Tag */}
                <rect
                  x={(src.x + tgt.x) / 2 - 18}
                  y={(src.y + tgt.y) / 2 - 9}
                  width="36"
                  height="18"
                  rx="4"
                  fill="#ffffff"
                  stroke={isPathActive ? '#3b82f6' : '#cbd5e1'}
                  strokeWidth="1"
                  className="pointer-events-none"
                />
                <text
                  x={(src.x + tgt.x) / 2}
                  y={(src.y + tgt.y) / 2 + 3.5}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isFaulty ? '#ef4444' : isPathActive ? '#2563eb' : '#64748b'}
                  fontWeight="600"
                  className="pointer-events-none"
                >
                  {isFaulty ? 'FAIL' : `${link.latency}ms`}
                </text>
              </g>
            );
          })}

          {/* 2. Draw Nodes */}
          {nodes.map((node) => {
            const isDisabled = disabledNodes.includes(node.id) || node.status === 'offline';
            const isCurrentHop = currentHop === node.id;
            const isInPath = activePath.includes(node.id);
            const Icon = getNodeIcon(node.type);

            return (
              <g
                key={`node-${node.id}`}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onClick={() => setSelectedNode(node)}
              >
                <g className="transition-transform group-hover:scale-110">
                {/* Active Ripple */}
                {isCurrentHop && (
                  <circle
                    r="30"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    className="animate-ping opacity-50"
                  />
                )}

                {/* Outer Glow Circle */}
                <circle
                  r="22"
                  fill={isDisabled ? '#fef2f2' : isInPath ? '#eff6ff' : '#ffffff'}
                  stroke={
                    isDisabled
                      ? '#ef4444'
                      : isCurrentHop
                      ? '#3b82f6'
                      : isInPath
                      ? '#60a5fa'
                      : '#cbd5e1'
                  }
                  strokeWidth={isCurrentHop ? 3 : isInPath ? 2 : 1.5}
                />

                {/* Node Icon Box */}
                <foreignObject x="-12" y="-12" width="24" height="24" className="pointer-events-none">
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon
                      className={`w-4 h-4 ${
                        isDisabled
                          ? 'text-red-500'
                          : isCurrentHop
                          ? 'text-blue-600'
                          : isInPath
                          ? 'text-blue-500'
                          : 'text-slate-500'
                      }`}
                    />
                  </div>
                </foreignObject>

                {/* Node Label */}
                <text
                  y="36"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={isDisabled ? '#ef4444' : isInPath ? '#1e293b' : '#64748b'}
                >
                  {node.id}
                </text>

                {/* IP Label */}
                <text
                  y="48"
                  textAnchor="middle"
                  fontSize="9"
                  fill="#94a3b8"
                  fontFamily="monospace"
                >
                  {node.ip}
                </text>

                {/* Status Dot */}
                {isDisabled ? (
                  <circle cx="15" cy="-15" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                ) : (
                  <circle cx="15" cy="-15" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                )}
                </g>
              </g>
            );
          })}

          {/* 3. Moving Packet Indicator */}
          {currentHop && nodeMap[currentHop] && (
            <g
              transform={`translate(${nodeMap[currentHop].x}, ${nodeMap[currentHop].y - 32})`}
            >
              <rect x="-26" y="-11" width="52" height="16" rx="4" fill="#3b82f6" />
              <text x="0" y="1" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">
                PACKET
              </text>
            </g>
          )}

        </svg>

        {/* Floating Node Inspector Modal / Drawer */}
        {selectedNode && (
          <div className="absolute top-3 right-3 w-72 bg-white rounded-lg border border-slate-200 p-3.5 shadow-xl z-20 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900">{selectedNode.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  disabledNodes.includes(selectedNode.id)
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  {disabledNodes.includes(selectedNode.id) ? 'OFFLINE' : 'ONLINE'}
                </span>
              </div>
              <button 
                onClick={() => setSelectedNode(null)} 
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-2.5 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Node ID:</span>
                <span className="text-slate-900 font-mono">{selectedNode.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Device Type:</span>
                <span className="text-blue-600 uppercase font-medium">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IPv4 Address:</span>
                <span className="text-slate-700 font-mono">{selectedNode.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MAC Address:</span>
                <span className="text-slate-700 font-mono text-[10px]">{selectedNode.mac}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subnet:</span>
                <span className="text-slate-600 font-mono">{selectedNode.subnet}</span>
              </div>
            </div>

            {onToggleNode && (
              <button
                onClick={() => {
                  const currentlyDisabled = disabledNodes.includes(selectedNode.id);
                  onToggleNode(selectedNode.id, currentlyDisabled);
                }}
                className={`mt-3 w-full py-1.5 rounded-md text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                  disabledNodes.includes(selectedNode.id)
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {disabledNodes.includes(selectedNode.id) ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Restore Device</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Simulate Failure</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>

      {/* Path Summary */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-700">Computed Route:</span>
          <div className="flex items-center space-x-1 font-mono text-blue-600 font-medium">
            {activePath && activePath.length > 0 ? (
              activePath.map((node, i) => (
                <React.Fragment key={node}>
                  <span className={`px-1.5 py-0.5 rounded text-[11px] ${currentHop === node ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}>
                    {node}
                  </span>
                  {i < activePath.length - 1 && <span className="text-slate-400">→</span>}
                </React.Fragment>
              ))
            ) : (
              <span className="text-red-500">No route available (Network Partitioned)</span>
            )}
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Tip: Click any node to inspect or simulate failure.
        </div>
      </div>

    </div>
  );
}
