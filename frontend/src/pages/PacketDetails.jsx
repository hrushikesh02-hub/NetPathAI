import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import PacketHeaderViewer from '../components/PacketHeaderViewer';
import { DEFAULT_PACKET } from '../utils/constants';

export default function PacketDetails() {
  const [packet, setPacket] = useState(DEFAULT_PACKET);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold uppercase tracking-wider">
              Deep Packet Inspection (DPI)
            </span>
            <span className="text-xs text-slate-400">Wireshark Protocol Dissector & Raw Bitstream</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Packet Header & Payload Analyzer
          </h1>
        </div>
      </div>

      {/* Packet Viewer */}
      <PacketHeaderViewer packetData={packet} />

      {/* Checksum & Integrity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl border border-slate-800 p-6 space-y-3">
          <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Layer 2 CRC-32 Frame Check Sequence (FCS)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Calculated over the entire Ethernet Frame (Preamble, Dst MAC, Src MAC, EtherType, Payload) using generator polynomial <code className="text-sky-300 font-mono">0x04C11DB7</code>.
          </p>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400">
            Calculated CRC32: 0x4B3A89F1 (STATUS: OK / NO BIT CORRUPTION)
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-slate-800 p-6 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Layer 3 IPv4 One's Complement Header Checksum</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The 16-bit one's complement sum of all 16-bit words in the IPv4 header. Verified at each routing hop as the TTL field is decremented by 1.
          </p>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-sky-400">
            Calculated Checksum: 0x82C4 (STATUS: VERIFIED AT ROUTER R1)
          </div>
        </div>
      </div>

    </div>
  );
}
