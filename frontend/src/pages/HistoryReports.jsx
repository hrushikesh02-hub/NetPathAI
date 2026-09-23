import React, { useState, useEffect } from 'react';
import { Printer, Trash2, Search } from 'lucide-react';
import { api } from '../services/api';

export default function HistoryReports() {
  const [historyList, setHistoryList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory(100);
      setHistoryList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all simulation history logs?')) {
      await api.clearHistory();
      await fetchHistory();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredHistory = historyList.filter(item => {
    const matchesSearch = 
      item.packet_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source_ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.destination_ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.protocol?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'ALL') return matchesSearch;
    if (filterStatus === 'DELIVERED') return matchesSearch && item.status?.includes('DELIVERED');
    if (filterStatus === 'LOST') return matchesSearch && !item.status?.includes('DELIVERED');
    if (filterStatus === 'ANOMALY') return matchesSearch && item.ai_status === 'anomaly';
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:m-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold uppercase tracking-wider">
              Audit & Persistence
            </span>
            <span className="text-xs text-slate-400">SQLite Logged Telemetry & Diagnostic Reports</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Simulation History & Executive Report
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow transition-all"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>EXPORT / PRINT REPORT</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-rose-950/60 hover:text-rose-400 text-slate-300 text-xs font-bold border border-slate-800 transition-colors flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Printable Executive Report Header */}
      <div className="glass-panel rounded-xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">NetPath AI - Executive Network Telemetry Summary</h2>
            <p className="text-xs text-slate-400">Automated packet journey audit report generated from simulation logs</p>
          </div>
          <div className="text-right text-xs font-mono text-slate-400">
            <div>Total Audited Runs: <strong className="text-sky-400">{historyList.length}</strong></div>
            <div>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search packet ID, IP, protocol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center space-x-1 text-xs">
            {['ALL', 'DELIVERED', 'LOST', 'ANOMALY'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-md font-semibold border transition-all ${
                  filterStatus === st
                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <th className="pb-3">Packet ID</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Route (Src → Dst)</th>
                <th className="pb-3">Protocol</th>
                <th className="pb-3">Latency</th>
                <th className="pb-3">Loss %</th>
                <th className="pb-3">Hops</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">AI Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-3 font-bold text-sky-400">{item.packet_id}</td>
                    <td className="py-3 text-slate-400 text-[10px]">{item.timestamp}</td>
                    <td className="py-3 text-slate-200 font-sans">
                      {item.source_ip} → {item.destination_ip}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-bold border border-slate-800">
                        {item.protocol}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{item.latency} ms</td>
                    <td className="py-3 text-slate-300">{item.packet_loss}%</td>
                    <td className="py-3 text-slate-300">{item.hops}</td>
                    <td className="py-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status?.includes('DELIVERED') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.ai_status === 'anomaly' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {item.ai_health || (item.ai_status === 'anomaly' ? 'ANOMALY' : 'HEALTHY')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                    No matching history records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
