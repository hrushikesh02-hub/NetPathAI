import React, { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import LayerStackVisualizer from '../components/LayerStackVisualizer';
import PacketHeaderViewer from '../components/PacketHeaderViewer';
import { api } from '../services/api';
import { DEFAULT_PACKET } from '../utils/constants';

export default function LayerVisualizer() {
  const [packetData, setPacketData] = useState(DEFAULT_PACKET);
  const [encapsulation, setEncapsulation] = useState(null);
  const [activeLayer, setActiveLayer] = useState(7);
  const [isDecapsulating, setIsDecapsulating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerateLayers = async () => {
    setLoading(true);
    try {
      const res = await api.createPacket(packetData);
      setEncapsulation(res.encapsulation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateLayers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold uppercase tracking-wider">
              Curriculum Units I & II
            </span>
            <span className="text-xs text-slate-400">OSI Reference vs TCP/IP Architecture</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            OSI & TCP/IP Layer Stack Inspector
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerateLayers}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow transition-all disabled:opacity-50"
          >
            <Layers className="w-4 h-4 text-slate-950" />
            <span>{loading ? 'Building Headers...' : 'REBUILD LAYER ENCAPSULATION'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Layer Visualizer */}
      <LayerStackVisualizer
        osiLayers={encapsulation?.osi_layers || {}}
        activeLayer={activeLayer}
        isDecapsulation={isDecapsulating}
        onSelectLayer={(l) => setActiveLayer(l)}
      />

      {/* Protocol Headers & Bitstream Raw Inspector */}
      <PacketHeaderViewer
        packetData={packetData}
        hexDump={encapsulation?.hex_dump}
        bitstream={encapsulation?.bitstream}
      />

      {/* Academic Layer Comparison Matrix */}
      <div className="glass-panel rounded-xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">OSI 7-Layer vs TCP/IP Architecture Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="pb-3">OSI Layer</th>
                <th className="pb-3">TCP/IP Equivalent</th>
                <th className="pb-3">PDU Name</th>
                <th className="pb-3">Key Hardware & Protocols</th>
                <th className="pb-3">Primary Header Fields</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 font-bold text-sky-400">7. Application</td>
                <td className="py-3 text-white font-medium" rowSpan={3}>Application Layer</td>
                <td className="py-3 text-emerald-400 font-mono">Data</td>
                <td className="py-3 text-slate-300">HTTP, HTTPS, DNS, FTP, SMTP, DHCP</td>
                <td className="py-3 text-slate-400 font-mono">Request Method, URI, Headers</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 font-bold text-sky-400">6. Presentation</td>
                <td className="py-3 text-emerald-400 font-mono">Data</td>
                <td className="py-3 text-slate-300">TLS/SSL, ASCII, UTF-8, JPEG, GZIP</td>
                <td className="py-3 text-slate-400 font-mono">Cipher Suite, Content-Encoding</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 font-bold text-sky-400">5. Session</td>
                <td className="py-3 text-emerald-400 font-mono">Data</td>
                <td className="py-3 text-slate-300">RPC, NetBIOS, Sockets, PPTP</td>
                <td className="py-3 text-slate-400 font-mono">Session ID, Sync Points</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 font-bold text-indigo-400">4. Transport</td>
                <td className="py-3 text-white font-medium">Transport Layer</td>
                <td className="py-3 text-emerald-400 font-mono">Segment / Datagram</td>
                <td className="py-3 text-slate-300">TCP (Reliable), UDP (Connectionless)</td>
                <td className="py-3 text-slate-400 font-mono">Src/Dst Ports, Seq, Ack, Flags, Win</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 font-bold text-purple-400">3. Network</td>
                <td className="py-3 text-white font-medium">Internet Layer</td>
                <td className="py-3 text-emerald-400 font-mono">Packet</td>
                <td className="py-3 text-slate-300">IPv4, IPv6, ICMP, Routers, Dijkstra</td>
                <td className="py-3 text-slate-400 font-mono">Src/Dst IP, TTL, Checksum, Proto</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 font-bold text-amber-400">2. Data Link</td>
                <td className="py-3 text-white font-medium" rowSpan={2}>Network Interface Layer</td>
                <td className="py-3 text-emerald-400 font-mono">Frame</td>
                <td className="py-3 text-slate-300">Ethernet IEEE 802.3, Wi-Fi 802.11, Switches</td>
                <td className="py-3 text-slate-400 font-mono">Src/Dst MAC, EtherType, CRC/FCS</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 font-bold text-rose-400">1. Physical</td>
                <td className="py-3 text-emerald-400 font-mono">Bits</td>
                <td className="py-3 text-slate-300">Cat6 Copper, Fiber Optics, Wireless RF, Hubs</td>
                <td className="py-3 text-slate-400 font-mono">Voltage levels, Modulation, Preamble</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
