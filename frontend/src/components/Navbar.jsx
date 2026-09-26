import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  PlayCircle, 
  BarChart3, 
  History, 
  BookOpen, 
  Wifi,
  HelpCircle,
  X,
  Layers
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
    { to: '/', label: 'Dashboard', icon: BarChart3 },
    { to: '/simulator', label: 'Simulator', icon: PlayCircle },
    { to: '/history', label: 'History', icon: History },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Title */}
            <NavLink to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base tracking-tight text-slate-900">
                    NetPath AI
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                    Simulation
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Network & Packet Analyzer</p>
              </div>
            </NavLink>

            {/* Navigation Bar */}
            <nav className="hidden lg:flex items-center space-x-1 p-1 bg-slate-50 rounded-lg border border-slate-200">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white text-blue-600 border border-slate-200 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right Status & Help */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDocsModal(true)}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                title="View OSI Reference Guide"
              >
                <HelpCircle className="w-4 h-4 text-blue-500" />
                <span>OSI Guide</span>
              </button>

              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm">
                <span className={`w-2 h-2 rounded-full ${
                  backendHealth.status === 'healthy' 
                    ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' 
                    : 'bg-amber-500 animate-pulse'
                }`} />
                <span className="text-xs font-medium text-slate-700">
                  {backendHealth.status === 'healthy' ? 'System Ready' : 'Connecting...'}
                </span>
              </div>
            </div>

          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-200 overflow-x-auto">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center px-2 py-1 text-[10px] font-medium transition-colors whitespace-nowrap ${
                    isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">OSI 7-Layer Quick Guide</h3>
              </div>
              <button 
                onClick={() => setShowDocsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {[
                { layer: 'Layer 7 - Application', color: 'border-purple-200 bg-purple-50 text-purple-900', desc: 'HTTP, DNS, HTTPS - Application requests & payload.' },
                { layer: 'Layer 4 - Transport', color: 'border-blue-200 bg-blue-50 text-blue-900', desc: 'TCP / UDP - Ports, sequences, segmenting.' },
                { layer: 'Layer 3 - Network', color: 'border-emerald-200 bg-emerald-50 text-emerald-900', desc: 'IPv4 / IPv6 - IP addressing, routing.' },
                { layer: 'Layer 2 - Data Link', color: 'border-amber-200 bg-amber-50 text-amber-900', desc: 'Ethernet MAC - Physical addressing & checksum.' },
                { layer: 'Layer 1 - Physical', color: 'border-rose-200 bg-rose-50 text-rose-900', desc: 'Physical Medium - Cables and wireless transmission.' },
              ].map((item, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${item.color}`}>
                  <h4 className="font-semibold text-xs">{item.layer}</h4>
                  <p className="text-xs mt-0.5 opacity-80">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors"
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
