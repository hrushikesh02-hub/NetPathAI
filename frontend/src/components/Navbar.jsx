import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  PlayCircle, 
  Cpu, 
  Compass, 
  BarChart3, 
  History, 
  BookOpen, 
  Wifi,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function Navbar() {
  const [backendHealth, setBackendHealth] = useState({ status: 'checking', ml_model_active: false });
  const [showDocsModal, setShowDocsModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    api.getHealth().then(data => {
      if (isMounted) setBackendHealth(data);
    }).catch(() => {
      if (isMounted) setBackendHealth({ status: 'offline', ml_model_active: false });
    });
    const interval = setInterval(() => {
      api.getHealth().then(data => {
        if (isMounted) setBackendHealth(data);
      }).catch(() => {
        if (isMounted) setBackendHealth({ status: 'offline', ml_model_active: false });
      });
    }, 15000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  const mainNavItems = [
    { to: '/simulator', label: 'Live Simulator', icon: PlayCircle },
    { to: '/', label: 'Dashboard', icon: BarChart3 },
    { to: '/ai-analyzer', label: 'AI Diagnostics', icon: Cpu },
    { to: '/scenarios', label: 'Scenarios Lab', icon: Compass },
    { to: '/osi-layers', label: 'OSI Inspector', icon: Layers },
    { to: '/history', label: 'Logs & Reports', icon: History },
    { to: '/about', label: 'Viva Guide', icon: BookOpen },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#080C16]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Title */}
            <NavLink to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 transition-colors">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base tracking-tight text-white">
                    NetPath AI
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    SaaS Sim
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Packet Journey & Network Telemetry</p>
              </div>
            </NavLink>

            {/* Navigation Bar */}
            <nav className="hidden lg:flex items-center space-x-1 p-1 bg-slate-900/80 rounded-lg border border-slate-800">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right Status & Help */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDocsModal(true)}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                title="View OSI Reference Guide"
              >
                <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                <span>OSI Guide</span>
              </button>

              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <span className={`w-2 h-2 rounded-full ${
                  backendHealth.status === 'healthy' 
                    ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' 
                    : 'bg-amber-400 animate-pulse'
                }`} />
                <span className="text-[11px] font-medium text-slate-300">
                  {backendHealth.status === 'healthy' ? 'AI Engine Ready' : 'Connecting...'}
                </span>
              </div>
            </div>

          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-800 overflow-x-auto">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center px-2 py-1 text-[10px] font-medium transition-colors whitespace-nowrap ${
                    isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

        </div>
      </header>

      {/* OSI Guide Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0d1322] border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">OSI 7-Layer & TCP/IP Quick Cheat Sheet</h3>
              </div>
              <button 
                onClick={() => setShowDocsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {[
                { layer: 'Layer 7 - Application', color: 'border-violet-500/30 bg-violet-500/10 text-violet-300', desc: 'HTTP, DNS, HTTPS - Application requests & payload generation.' },
                { layer: 'Layer 4 - Transport', color: 'border-blue-500/30 bg-blue-500/10 text-blue-300', desc: 'TCP / UDP - Ports, sequence/ACK numbers, window size, segmenting.' },
                { layer: 'Layer 3 - Network', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300', desc: 'IPv4 / IPv6 - Source & Dest IP, TTL countdown, Dijkstra routing.' },
                { layer: 'Layer 2 - Data Link', color: 'border-amber-500/30 bg-amber-500/10 text-amber-300', desc: 'Ethernet MAC framing - Hop-by-hop MAC addressing & FCS CRC checksum.' },
                { layer: 'Layer 1 - Physical', color: 'border-rose-500/30 bg-rose-500/10 text-rose-300', desc: 'Physical Medium - Bitstream transmission over copper or fiber.' },
              ].map((item, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${item.color}`}>
                  <h4 className="font-semibold text-xs">{item.layer}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
