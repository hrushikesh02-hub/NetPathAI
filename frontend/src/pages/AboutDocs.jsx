import React, { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import { SYLLABUS_MODULES } from '../utils/constants';

export default function AboutDocs() {
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (idx) => {
    setOpenFaq(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const vivaQuestions = [
    {
      q: '1. What is the fundamental difference between the OSI 7-Layer Model and TCP/IP Architecture?',
      a: 'The OSI model is a 7-layer theoretical reference framework created by ISO to standardize communication protocols. TCP/IP is a 4-layer pragmatic implementation suite designed for the ARPANET and modern Internet, collapsing Application, Presentation, and Session into a single Application layer, and combining Data Link and Physical into a Network Interface (Host-to-Network) layer.'
    },
    {
      q: '2. How does Dijkstra Algorithm determine the shortest path in network routing?',
      a: 'Dijkstra maintains a priority queue of unvisited nodes with cumulative path metrics (latency + link cost). Starting at the source node, it greedily relaxes adjacent edges by updating neighbor distances if a shorter path is discovered, guaranteeing the optimal least-cost loop-free path in Link-State protocols like OSPF.'
    },
    {
      q: '3. Why is Frame Check Sequence (CRC-32) computed at Layer 2 while Checksum is at Layer 3?',
      a: 'Layer 2 (Ethernet) protects against physical electromagnetic noise and bit flips over the immediate physical medium via hardware-accelerated CRC-32. Layer 3 (IPv4) computes a fast 16-bit one\'s complement checksum over the IP header only (not data payload) to detect corruption in router forwarding tables and TTL decrements.'
    },
    {
      q: '4. How does Isolation Forest detect network telemetry anomalies without pre-labeled attack data?',
      a: 'Isolation Forest is an unsupervised tree ensemble algorithm. Anomalies are few and attribute-different, meaning they require significantly fewer random splits to isolate in an isolation tree compared to normal cluster points. A short average path length translates to a high anomaly score (>0.60).'
    },
    {
      q: '5. What occurs when an IPv4 packet TTL decrements to 0 at an intermediate router?',
      a: 'The router discards the packet to prevent infinite forwarding loops and transmits an ICMP Type 11 (Time to Live Exceeded in Transit) message back to the source IP. This mechanism is the foundation for the Traceroute diagnostic utility.'
    },
    {
      q: '6. What is the difference between Propagation Delay and Transmission Delay?',
      a: 'Transmission Delay = Packet Size / Link Bandwidth (the time required to push bits onto the wire). Propagation Delay = Distance / Signal Speed (the time required for one bit to physically travel across the medium, typically 200,000 km/s in fiber).'
    },
    {
      q: '7. How does TCP handle packet loss differently than UDP?',
      a: 'TCP guarantees reliability using Sequence and Acknowledgment numbers. Upon loss or missing ACKs after Retransmission Timeout (RTO) or 3 duplicate ACKs, TCP triggers Fast Retransmit and throttles its Congestion Window (cwnd). UDP is connectionless and best-effort; lost datagrams are simply ignored without recovery.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold uppercase tracking-wider">
              Educational Documentation & Viva Guide
            </span>
            <span className="text-xs text-slate-400">Engineering Curriculum Alignment (Units I - V)</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Computer Networks Syllabus Mapping & Knowledge Base
          </h1>
        </div>
      </div>

      {/* Syllabus Units Accordion Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          University Curriculum Mapping (Units I to V)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SYLLABUS_MODULES.map((mod) => (
            <div key={mod.unit} className="glass-panel rounded-xl border border-slate-800 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-bold text-xs border border-sky-500/20">
                  {mod.unit}
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{mod.title}</h4>

                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside pt-1">
                  {mod.topics.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-sky-300">
                <strong>Project Implementation:</strong> {mod.relevance}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mathematical & Algorithmic Formulas Reference */}
      <div className="glass-panel rounded-xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Core Mathematical Models & Algorithms
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-sky-400 font-bold uppercase text-[11px] block font-sans">1. Total Latency / RTT Equation</span>
            <div className="p-2 rounded bg-slate-950 text-emerald-400">
              Total Latency = Transmission + Propagation + Queueing + Processing
            </div>
            <p className="text-slate-400 text-[11px] font-sans">
              Where Transmission = Size / Bandwidth, and Propagation = Distance / c.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-indigo-400 font-bold uppercase text-[11px] block font-sans">2. Dijkstra Edge Relaxation</span>
            <div className="p-2 rounded bg-slate-950 text-sky-300">
              if dist[u] + weight(u, v) &lt; dist[v]: dist[v] = dist[u] + weight(u, v)
            </div>
            <p className="text-slate-400 text-[11px] font-sans">
              Guarantees minimal latency graph traversal and automated link failover.
            </p>
          </div>
        </div>
      </div>

      {/* Viva / Oral Exam Practice Questions */}
      <div className="glass-panel rounded-xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Oral / Viva Voce Examination Prep (High-Scoring Answers)
          </h3>
        </div>

        <div className="space-y-2">
          {vivaQuestions.map((viva, idx) => (
            <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/60 overflow-hidden text-xs">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-3 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-slate-800/60 transition-colors"
              >
                <span>{viva.q}</span>
                {openFaq[idx] ? <ChevronDown className="w-4 h-4 text-sky-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
              </button>

              {openFaq[idx] && (
                <div className="p-3.5 border-t border-slate-800 text-slate-300 text-xs leading-relaxed pl-5 bg-slate-950/60">
                  {viva.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
