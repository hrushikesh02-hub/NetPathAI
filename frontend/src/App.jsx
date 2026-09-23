import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import PacketSimulator from './pages/PacketSimulator';
import LayerVisualizer from './pages/LayerVisualizer';
import NetworkTopology from './pages/NetworkTopology';
import AIAnalyzer from './pages/AIAnalyzer';
import PacketDetails from './pages/PacketDetails';
import NetworkMetrics from './pages/NetworkMetrics';
import SimulationScenarios from './pages/SimulationScenarios';
import HistoryReports from './pages/HistoryReports';
import AboutDocs from './pages/AboutDocs';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#080C16] text-slate-100 font-sans selection:bg-sky-500 selection:text-slate-950">
        
        {/* Top Header Navigation */}
        <Navbar />

        {/* Main Content Body */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/simulator" element={<PacketSimulator />} />
            <Route path="/osi-layers" element={<LayerVisualizer />} />
            <Route path="/topology" element={<NetworkTopology />} />
            <Route path="/ai-analyzer" element={<AIAnalyzer />} />
            <Route path="/packet-details" element={<PacketDetails />} />
            <Route path="/metrics" element={<NetworkMetrics />} />
            <Route path="/scenarios" element={<SimulationScenarios />} />
            <Route path="/history" element={<HistoryReports />} />
            <Route path="/about" element={<AboutDocs />} />
          </Routes>
        </main>

        {/* Global Clean Footer */}
        <footer className="border-t border-slate-800 bg-[#060911] py-6 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white">
                NetPath AI
              </span>
              <span>— AI-Based Packet Journey Visualizer & Intelligent Network Telemetry</span>
            </div>

            <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
              <span>OSI & TCP/IP Architecture</span>
              <span>•</span>
              <span>Dijkstra Shortest Path</span>
              <span>•</span>
              <span>Isolation Forest ML</span>
            </div>
          </div>
        </footer>

      </div>
    </Router>
  );
}
