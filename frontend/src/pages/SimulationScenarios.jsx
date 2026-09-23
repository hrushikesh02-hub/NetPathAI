import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function SimulationScenarios() {
  const [runningId, setRunningId] = useState(null);
  const navigate = useNavigate();

  const scenarios = [
    {
      id: 'NORMAL',
      title: '1. Standard Web Browsing (HTTP over TCP)',
      unit: 'Units I, II, III, IV',
      desc: 'Simulates clean packet traversal from PC1 through Switch1, Router1, Router2 (Core Primary), Switch2 to Server1 with zero packet loss and low latency (24ms).',
      learning: 'Demonstrates baseline 7-layer OSI encapsulation, IP routing, and 2-way handshake completion.'
    },
    {
      id: 'ROUTER_FAILURE',
      title: '2. Core Router R2 Hardware Failure (Dynamic Dijkstra Rerouting)',
      unit: 'Unit III (Network Layer Routing)',
      desc: 'Primary Core Router 2 fails offline. The simulation engine detects link failure and dynamically recalculates Dijkstra shortest path through Core Backup Router 3.',
      learning: 'Teaches Link-State routing protocols, routing table updates, and automated failover resiliency.'
    },
    {
      id: 'PACKET_LOSS',
      title: '3. Data Link CRC Frame Loss & TCP Retransmission',
      unit: 'Units II & IV (Data Link & Transport)',
      desc: 'A corrupted frame is dropped at Switch 1 due to simulated CRC error. TCP timeout occurs at host PC1, triggering exponential backoff and segment retransmission.',
      learning: 'Shows error detection (FCS), TCP Sequence/Ack tracking, and reliable transport mechanisms.'
    },
    {
      id: 'HIGH_LATENCY',
      title: '4. Trans-Continental WAN Latency Spike (+280ms)',
      unit: 'Units III & V (QoS & AI Telemetry)',
      desc: 'Simulates extreme satellite/intercontinental propagation latency. AI Isolation Forest flags the anomaly and recommends TCP Window Scaling & BBR congestion control.',
      learning: 'Demonstrates Round-Trip Time (RTT) impact on TCP sliding windows and QoS monitoring.'
    },
    {
      id: 'CONGESTION',
      title: '5. Router Queue Congestion & Buffer Bloat',
      unit: 'Units III & IV (Congestion Control)',
      desc: 'Router 1 egress buffer overflows due to high traffic volume, causing 14% packet drops and high jitter. AI module diagnoses queue bottleneck.',
      learning: 'Explains Random Early Detection (RED), buffer bloat, and TCP congestion window throttling.'
    },
    {
      id: 'TTL_EXCEEDED',
      title: '6. Time-to-Live (TTL) Expiration & ICMP Time Exceeded',
      unit: 'Unit III (Network Layer & TTL)',
      desc: 'A packet initialized with TTL=2 traverses the topology. At Router 2, TTL decrements to 0 and the packet is discarded, generating an ICMP Type 11 message.',
      learning: 'Teaches loop prevention in IP networks and how Traceroute uses incremental TTL values.'
    },
    {
      id: 'DNS_QUERY',
      title: '7. Connectionless DNS Lookup over UDP',
      unit: 'Units IV & V (Transport & Application)',
      desc: 'Simulates lightweight DNS domain resolution on UDP port 53. No TCP handshake or retransmission overhead.',
      learning: 'Contrasts UDP connectionless datagram efficiency against TCP connection-oriented overhead.'
    }
  ];

  const handleLaunchScenario = async (scenarioId) => {
    setRunningId(scenarioId);
    try {
      await api.runScenario(scenarioId);
      navigate('/simulator');
    } catch (err) {
      console.error(err);
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold uppercase tracking-wider">
              Educational Curriculum Lab
            </span>
            <span className="text-xs text-slate-400">7 Interactive Pre-Configured Experiments</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Network Simulation Scenarios
          </h1>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((sc) => (
          <div
            key={sc.id}
            className="glass-panel rounded-xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  {sc.unit}
                </span>
                <span className="text-[10px] font-mono text-slate-500">ID: {sc.id}</span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug">{sc.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{sc.desc}</p>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                  Learning Objective:
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{sc.learning}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleLaunchScenario(sc.id)}
                disabled={runningId === sc.id}
                className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow transition-all disabled:opacity-50"
              >
                {runningId === sc.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    <span>Loading Scenario...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 text-slate-950" />
                    <span>RUN SCENARIO IN SIMULATOR</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
