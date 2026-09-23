import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Share2, 
  Cpu, 
  ChevronDown,
  ChevronUp,
  Globe,
  Lock,
  Search as SearchIcon,
  Video,
  Terminal
} from 'lucide-react';

import TopologyCanvas from '../components/TopologyCanvas';
import LayerStackVisualizer from '../components/LayerStackVisualizer';
import PacketHeaderViewer from '../components/PacketHeaderViewer';
import PathTimeline from '../components/PathTimeline';
import AIExplanationCard from '../components/AIExplanationCard';
import { api } from '../services/api';
import { DEFAULT_PACKET } from '../utils/constants';

export default function PacketSimulator() {
  const [formData, setFormData] = useState(DEFAULT_PACKET);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [topology, setTopology] = useState({ nodes: [], links: [] });
  const [disabledNodes, setDisabledNodes] = useState([]);

  const [simulationResult, setSimulationResult] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [isSimulating, setIsSimulating] = useState(false);

  const [forcePacketLoss, setForcePacketLoss] = useState(false);
  const [forceHighLatency, setForceHighLatency] = useState(false);
  const [forceBufferCongestion, setForceBufferCongestion] = useState(false);

  const [activeTab, setActiveTab] = useState('topology');
  const timerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    api.getTopology().then(data => {
      if (isMounted && data) {
        setTopology(data);
        const disabled = (data.nodes || []).filter(n => n.status === 'offline').map(n => n.id);
        setDisabledNodes(disabled);
      }
    }).catch(console.error);

    api.simulateJourney(DEFAULT_PACKET, {}).then(res => {
      if (isMounted && res) {
        setSimulationResult(res);
        setCurrentStepIndex(0);
      }
    }).catch(console.error);

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (isPlaying && simulationResult?.trajectory) {
      timerRef.current = setTimeout(() => {
        if (currentStepIndex < simulationResult.trajectory.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, playbackSpeed);
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentStepIndex, simulationResult, playbackSpeed]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const applyPreset = async (type) => {
    let newForm = { ...formData };
    let flags = { force_packet_loss: false, force_high_latency: false, force_congestion: false };

    if (type === 'http') {
      newForm = {
        ...newForm,
        app_protocol: 'HTTP',
        protocol: 'TCP',
        destination_port: 80,
        payload: 'GET /index.html HTTP/1.1\r\nHost: server1.net\r\nAccept: text/html',
        packet_size: 1024
      };
    } else if (type === 'https') {
      newForm = {
        ...newForm,
        app_protocol: 'HTTPS',
        protocol: 'TCP',
        destination_port: 443,
        payload: 'TLSv1.3 Client Hello [Cipher: AES-256-GCM]',
        packet_size: 1420
      };
    } else if (type === 'dns') {
      newForm = {
        ...newForm,
        app_protocol: 'DNS',
        protocol: 'UDP',
        destination_port: 53,
        payload: 'Standard Query 0x1a2b A server1.local',
        packet_size: 512
      };
    } else if (type === 'video') {
      newForm = {
        ...newForm,
        app_protocol: 'CUSTOM',
        protocol: 'UDP',
        destination_port: 5004,
        payload: 'RTP H.264 Video Stream Frame #4021',
        packet_size: 1350
      };
    } else if (type === 'loss') {
      flags.force_packet_loss = true;
      setForcePacketLoss(true);
    } else if (type === 'latency') {
      flags.force_high_latency = true;
      setForceHighLatency(true);
    }

    setFormData(newForm);
    runSimWithParams(newForm, flags);
  };

  const handleToggleNode = async (nodeId, makeActive) => {
    try {
      await api.toggleNodeFailure(nodeId, makeActive);
      setDisabledNodes(prev => {
        if (makeActive) return prev.filter(id => id !== nodeId);
        return [...prev, nodeId];
      });
      runSimWithParams(formData, {
        force_packet_loss: forcePacketLoss,
        force_high_latency: forceHighLatency,
        force_congestion: forceBufferCongestion
      });
    } catch (err) {
      console.error(err);
    }
  };

  const runSimWithParams = async (params, flags) => {
    setIsSimulating(true);
    setIsPlaying(false);
    try {
      const result = await api.simulateJourney(params, flags);
      setSimulationResult(result);
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } catch (err) {
      alert(`Simulation Notice: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRunSimulation = () => {
    runSimWithParams(formData, {
      force_packet_loss: forcePacketLoss,
      force_high_latency: forceHighLatency,
      force_congestion: forceBufferCongestion
    });
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const trajectory = simulationResult?.trajectory || [];
  const currentStep = trajectory[currentStepIndex] || {};
  const activeHopNode = currentStep.current_node || (simulationResult?.active_path ? simulationResult.active_path[0] : 'PC1');
  const activeOSILayer = currentStep.osi_layer || 7;
  const isDecapsulationPhase = currentStep.phase === 'DECAPSULATION';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Hero Bar & Presets */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] font-semibold uppercase tracking-wider">
                Interactive Simulator
              </span>
              <span className="text-xs text-slate-400">OSI & TCP/IP Packet Journey</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Packet Journey & Network Flow
            </h1>
            <p className="text-xs text-slate-300">
              Select a quick preset or customize headers to visualize encapsulation and routing in real-time.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-md transition-all disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Simulating...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>LAUNCH PACKET JOURNEY</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1-Click Quick Presets Bar */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Quick Presets:</span>
          
          <button
            onClick={() => applyPreset('http')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
              formData.app_protocol === 'HTTP' && !forcePacketLoss && !forceHighLatency
                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Web (HTTP GET)</span>
          </button>

          <button
            onClick={() => applyPreset('https')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
              formData.app_protocol === 'HTTPS'
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Secure (HTTPS)</span>
          </button>

          <button
            onClick={() => applyPreset('dns')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
              formData.app_protocol === 'DNS'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <SearchIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>DNS Lookup (UDP)</span>
          </button>

          <button
            onClick={() => applyPreset('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
              formData.destination_port === 5004
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span>UDP Video Stream</span>
          </button>

          <button
            onClick={() => handleToggleNode('Router2', disabledNodes.includes('Router2'))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border transition-all ${
              disabledNodes.includes('Router2')
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{disabledNodes.includes('Router2') ? 'Restore Router R2' : 'Simulate R2 Failure'}</span>
          </button>
        </div>
      </div>

      {/* Main Visualizer Tabs */}
      <div className="space-y-4">
        
        {/* Navigation Tabs Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('topology')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'topology'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>1. Network Topology Map</span>
            </button>

            <button
              onClick={() => setActiveTab('layers')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'layers'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. OSI / TCP-IP Layer Stack</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'ai'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>3. AI Diagnosis</span>
            </button>

            <button
              onClick={() => setActiveTab('headers')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'headers'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>4. Wireshark Headers</span>
            </button>
          </div>

          {simulationResult && (
            <div className="flex items-center space-x-2 text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Path:</span>
              <span className="font-mono font-bold text-sky-400">
                {(simulationResult.active_path || []).join(' ➔ ')}
              </span>
            </div>
          )}
        </div>

        {/* Tab 1: Topology Map View */}
        {activeTab === 'topology' && (
          <TopologyCanvas
            nodes={topology.nodes || []}
            links={topology.links || []}
            activePath={simulationResult?.active_path || []}
            currentHop={activeHopNode}
            disabledNodes={disabledNodes}
            onToggleNode={handleToggleNode}
            isSimulating={isSimulating}
          />
        )}

        {/* Tab 2: OSI Layer Stack View */}
        {activeTab === 'layers' && (
          <LayerStackVisualizer
            osiLayers={simulationResult?.encapsulation?.osi_layers || {}}
            activeLayer={activeOSILayer}
            isDecapsulation={isDecapsulationPhase}
          />
        )}

        {/* Tab 3: AI Diagnosis View */}
        {activeTab === 'ai' && simulationResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Telemetry Metrics
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  simulationResult.status?.includes('DELIVERED') 
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                }`}>
                  {simulationResult.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Latency</span>
                  <span className="text-lg font-bold text-sky-400 font-mono">
                    {simulationResult.metrics?.latency} ms
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Packet Loss</span>
                  <span className="text-lg font-bold text-white font-mono">
                    {simulationResult.metrics?.packet_loss}%
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Throughput</span>
                  <span className="text-lg font-bold text-indigo-400 font-mono">
                    {simulationResult.metrics?.throughput} Mbps
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">TCP Retransmits</span>
                  <span className="text-lg font-bold text-amber-400 font-mono">
                    {simulationResult.metrics?.retransmissions}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <div>Hops: <strong className="text-sky-400 font-mono">{simulationResult.metrics?.hops}</strong></div>
                <div>TTL: <strong className="text-emerald-400 font-mono">{simulationResult.metrics?.final_ttl}</strong></div>
                <div>Jitter: <strong className="text-purple-400 font-mono">{simulationResult.metrics?.jitter} ms</strong></div>
              </div>
            </div>

            <AIExplanationCard
              analysis={simulationResult.ai_analysis}
              loading={false}
            />
          </div>
        )}

        {/* Tab 4: Wireshark Protocol Headers View */}
        {activeTab === 'headers' && simulationResult && (
          <PacketHeaderViewer
            packetData={formData}
            hexDump={simulationResult?.encapsulation?.hex_dump}
            bitstream={simulationResult?.encapsulation?.bitstream}
          />
        )}

        {/* Interactive Playback Controller */}
        {simulationResult && (
          <PathTimeline
            trajectory={trajectory}
            currentStepIndex={currentStepIndex}
            isPlaying={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onReset={handleReset}
            onStepForward={() => setCurrentStepIndex(prev => Math.min(trajectory.length - 1, prev + 1))}
            onStepBack={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
            onSeekStep={(idx) => setCurrentStepIndex(idx)}
            playbackSpeed={playbackSpeed}
            onChangeSpeed={(s) => setPlaybackSpeed(s)}
          />
        )}

      </div>

      {/* Collapsible Advanced Configuration */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Advanced Packet & Network Modifiers
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              Optional
            </span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="p-5 border-t border-slate-800 bg-slate-900/40 space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Source Node</label>
                <select
                  name="source_node"
                  value={formData.source_node}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="PC1">PC1 (192.168.1.10)</option>
                  <option value="Laptop1">Laptop1 (192.168.1.15)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Destination Node</label>
                <select
                  name="destination_node"
                  value={formData.destination_node}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Server1">Server1 (192.168.2.20)</option>
                  <option value="PC2">PC2 (192.168.2.30)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Transport Protocol</label>
                <select
                  name="protocol"
                  value={formData.protocol}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-sky-500"
                >
                  <option value="TCP">TCP (Reliable / 3-Way Handshake)</option>
                  <option value="UDP">UDP (Fast / Connectionless)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Dest Port</label>
                <input
                  type="number"
                  name="destination_port"
                  value={formData.destination_port}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Packet Size (Bytes)</label>
                <input
                  type="number"
                  name="packet_size"
                  value={formData.packet_size}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">TTL (Time to Live)</label>
                <input
                  type="number"
                  name="ttl"
                  value={formData.ttl}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Payload Message</label>
                <input
                  type="text"
                  name="payload"
                  value={formData.payload}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Network Hazard Modifiers */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-4">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forcePacketLoss}
                  onChange={(e) => setForcePacketLoss(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
                <span className="text-rose-400 font-medium">Force Packet Loss</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forceHighLatency}
                  onChange={(e) => setForceHighLatency(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
                <span className="text-amber-400 font-medium">Force Core High Latency (+250ms)</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forceBufferCongestion}
                  onChange={(e) => setForceBufferCongestion(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-0"
                />
                <span className="text-orange-400 font-medium">Simulate Router Queue Congestion</span>
              </label>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
