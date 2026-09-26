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
    if (window.confirm('Are you sure you want to clear all history logs?')) {
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:m-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Simulation History
          </h1>
          <p className="text-sm text-slate-500 mt-1">View past simulation results and metrics.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center space-x-2 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="px-4 py-2 rounded-md bg-white hover:bg-red-50 text-red-600 text-sm font-medium border border-slate-200 hover:border-red-200 transition-colors flex items-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 print:hidden">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, IP, protocol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 text-sm">
            {['ALL', 'DELIVERED', 'LOST', 'ANOMALY'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-md font-medium border transition-all ${
                  filterStatus === st
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Packet ID</th>
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Route (Src → Dst)</th>
                <th className="pb-3 font-semibold">Protocol</th>
                <th className="pb-3 font-semibold">Latency</th>
                <th className="pb-3 font-semibold">Hops</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 font-medium text-slate-900">{item.packet_id}</td>
                    <td className="py-3 text-slate-500 text-xs">{item.timestamp}</td>
                    <td className="py-3 text-slate-700">
                      {item.source_ip} → {item.destination_ip}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                        {item.protocol}
                      </span>
                    </td>
                    <td className="py-3 text-slate-700">{item.latency} ms</td>
                    <td className="py-3 text-slate-700">{item.hops}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        item.status?.includes('DELIVERED') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {item.status?.includes('DELIVERED') ? 'Delivered' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        item.ai_status === 'anomaly' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {item.ai_health || (item.ai_status === 'anomaly' ? 'Anomaly' : 'Normal')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
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
