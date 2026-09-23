import React, { useState } from 'react';
import { Terminal, Binary, ChevronRight, ChevronDown } from 'lucide-react';

export default function PacketHeaderViewer({ packetData = {}, hexDump = '', bitstream = '' }) {
  const [openSections, setOpenSections] = useState({
    eth: true,
    ip: true,
    transport: true,
    app: true,
    hex: false
  });

  const toggle = (sec) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const payload = packetData.payload || 'HELLO SERVER';
  const proto = (packetData.protocol || 'TCP').toUpperCase();
  const appProto = (packetData.app_protocol || 'HTTP').toUpperCase();

  return (
    <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Wireshark-Style Protocol Breakdown</h3>
        </div>
        <span className="text-xs font-mono text-sky-300 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
          Length: {packetData.packet_size || 1024} Bytes
        </span>
      </div>

      <div className="space-y-2 text-xs font-mono">
        
        {/* Frame / Ethernet */}
        <div className="rounded-lg border border-slate-800 bg-[#090d16] overflow-hidden">
          <button
            onClick={() => toggle('eth')}
            className="w-full flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-slate-800/80 text-slate-200 text-left font-medium transition-colors"
          >
            <div className="flex items-center space-x-2">
              {openSections.eth ? <ChevronDown className="w-3.5 h-3.5 text-sky-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <span>Ethernet II, Src: {packetData.source_mac || '00:1A:2B:3C:4D:5E'}, Dst: {packetData.destination_mac || '00:50:56:C0:00:01'}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans">Layer 2 Frame</span>
          </button>

          {openSections.eth && (
            <div className="p-3 border-t border-slate-800 space-y-1 text-slate-300 pl-6 text-[11px]">
              <div>Destination: {packetData.destination_mac || '00:50:56:C0:00:01'} (Gateway MAC)</div>
              <div>Source: {packetData.source_mac || '00:1A:2B:3C:4D:5E'} (Host NIC)</div>
              <div>Type: IPv4 (0x0800)</div>
              <div>Frame Check Sequence (FCS): 0x4B3A89F1 [CRC Verified]</div>
            </div>
          )}
        </div>

        {/* IPv4 */}
        <div className="rounded-lg border border-slate-800 bg-[#090d16] overflow-hidden">
          <button
            onClick={() => toggle('ip')}
            className="w-full flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-slate-800/80 text-slate-200 text-left font-medium transition-colors"
          >
            <div className="flex items-center space-x-2">
              {openSections.ip ? <ChevronDown className="w-3.5 h-3.5 text-sky-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <span>Internet Protocol Version 4, Src: {packetData.source_ip || '192.168.1.10'}, Dst: {packetData.destination_ip || '192.168.2.20'}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans">Layer 3 Packet</span>
          </button>

          {openSections.ip && (
            <div className="p-3 border-t border-slate-800 space-y-1 text-slate-300 pl-6 text-[11px]">
              <div>Version: 4</div>
              <div>Header Length: 20 bytes (5)</div>
              <div>Differentiated Services Field: 0x00 (Default Best Effort)</div>
              <div>Total Length: {packetData.packet_size || 1024} bytes</div>
              <div>Time to Live (TTL): {packetData.ttl || 64}</div>
              <div>Protocol: {proto} ({proto === 'TCP' ? '6' : '17'})</div>
              <div>Header Checksum: 0x82C4 [Correct]</div>
              <div>Source Address: {packetData.source_ip || '192.168.1.10'}</div>
              <div>Destination Address: {packetData.destination_ip || '192.168.2.20'}</div>
            </div>
          )}
        </div>

        {/* Transport (TCP/UDP) */}
        <div className="rounded-lg border border-slate-800 bg-[#090d16] overflow-hidden">
          <button
            onClick={() => toggle('transport')}
            className="w-full flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-slate-800/80 text-slate-200 text-left font-medium transition-colors"
          >
            <div className="flex items-center space-x-2">
              {openSections.transport ? <ChevronDown className="w-3.5 h-3.5 text-sky-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <span>{proto === 'TCP' ? 'Transmission Control Protocol' : 'User Datagram Protocol'}, Src Port: {packetData.source_port || 5000}, Dst Port: {packetData.destination_port || 80}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans">Layer 4 Segment</span>
          </button>

          {openSections.transport && (
            <div className="p-3 border-t border-slate-800 space-y-1 text-slate-300 pl-6 text-[11px]">
              <div>Source Port: {packetData.source_port || 5000}</div>
              <div>Destination Port: {packetData.destination_port || 80}</div>
              {proto === 'TCP' ? (
                <>
                  <div>Sequence Number: 1001 (relative)</div>
                  <div>Acknowledgment Number: 2001 (relative)</div>
                  <div>Header Length: 20 bytes (5)</div>
                  <div>Flags: 0x018 (PSH, ACK)</div>
                  <div>Window: 65535 (Calculated window size)</div>
                  <div>Checksum: 0x9A42 [Correct]</div>
                </>
              ) : (
                <>
                  <div>Length: {packetData.packet_size || 512} bytes</div>
                  <div>Checksum: 0x33A1 [Correct]</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Application Data */}
        <div className="rounded-lg border border-slate-800 bg-[#090d16] overflow-hidden">
          <button
            onClick={() => toggle('app')}
            className="w-full flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-slate-800/80 text-slate-200 text-left font-medium transition-colors"
          >
            <div className="flex items-center space-x-2">
              {openSections.app ? <ChevronDown className="w-3.5 h-3.5 text-sky-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <span>Application Payload ({appProto}): "{payload.substring(0, 32)}..."</span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans">Layer 7 Data</span>
          </button>

          {openSections.app && (
            <div className="p-3 border-t border-slate-800 space-y-2 text-slate-300 pl-6 text-[11px]">
              <div>Data Length: {payload.length} bytes</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-sky-300 break-all font-mono">
                {payload}
              </div>
            </div>
          )}
        </div>

        {/* Raw Hex / Bitstream Toggle */}
        <div className="rounded-lg border border-slate-800 bg-[#090d16] overflow-hidden">
          <button
            onClick={() => toggle('hex')}
            className="w-full flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-slate-800/80 text-slate-200 text-left font-medium transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Binary className="w-3.5 h-3.5 text-indigo-400" />
              <span>Physical Layer Raw Bitstream & Hex Payload Dump</span>
            </div>
            <span className="text-[10px] text-indigo-300 font-sans">{openSections.hex ? 'Hide' : 'Show Dump'}</span>
          </button>

          {openSections.hex && (
            <div className="p-3 border-t border-slate-800 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">Hexadecimal Dump:</span>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-mono tracking-widest break-all">
                  {hexDump || '48 45 4C 4C 4F 20 53 45 52 56 45 52'}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">Binary Bitstream (Sample):</span>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-sky-400 font-mono tracking-wider break-all">
                  {bitstream || '01001000 01000101 01001100 01001100 01001111 ...'}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
