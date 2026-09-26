import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import PacketSimulator from './pages/PacketSimulator';
import HistoryReports from './pages/HistoryReports';
export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
        
        {/* Top Header Navigation */}
        <Navbar />

        {/* Main Content Body */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/simulator" element={<PacketSimulator />} />
            <Route path="/history" element={<HistoryReports />} />
          </Routes>
        </main>

        {/* Global Clean Footer */}
        <footer className="border-t border-slate-200 bg-slate-50 py-6 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900">
                NetPath AI
              </span>
              <span>— Network Simulator & Diagnostics</span>
            </div>

            <div className="flex items-center space-x-3 text-[11px]">
              <span>OSI Architecture</span>
              <span>•</span>
              <span>Dijkstra Pathfinding</span>
              <span>•</span>
              <span>AI Anomaly Detection</span>
            </div>
          </div>
        </footer>

      </div>
    </Router>
  );
}
