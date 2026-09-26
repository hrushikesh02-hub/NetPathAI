import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import TopologyCanvas from '../components/TopologyCanvas';
import AIExplanationCard from '../components/AIExplanationCard';
import { 
  Play, 
  RotateCcw,
  Network,
  Activity,
  ServerCrash
} from 'lucide-react';

export default function PacketSimulator() {
  const [topology, setTopology] = useState({ nodes: [], links: [] });
  const [disabledNodes, setDisabledNodes] = useState([]);
  const [sourceId, setSourceId] = useState('');
  const [destId, setDestId] = useState('');
  const [protocol, setProtocol] = useState('TCP');
  const [packetSize, setPacketSize] = useState(1500);

  const [simState, setSimState] = useState({
    status: 'IDLE', // IDLE, RUNNING, DONE, ERROR
    path: [],
    currentHop: null,
    latency: 0,
    packetLoss: 0,
    metrics: null,
    aiAnalysis: null,
    error: null,
    packetId: null
  });

  const location = useLocation();
  const navigate = useNavigate();
  const simIntervalRef = useRef(null);

  useEffect(() => {
    fetchTopology();
    return () => clearInterval(simIntervalRef.current);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const scenarioId = searchParams.get('scenario');
    
    if (scenarioId && topology.nodes.length > 0) {
      handleRunScenario(scenarioId);
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, topology.nodes.length, navigate, location.pathname]);

  const handleRunScenario = async (scenarioId) => {
    clearInterval(simIntervalRef.current);
    setSimState({
      status: 'RUNNING',
      path: [],
      currentHop: null,
      latency: 0,
      packetLoss: 0,
      metrics: null,
      aiAnalysis: null,
      error: null,
      packetId: null
    });

    try {
      const result = await api.runScenario(scenarioId);
      
      const sim = result.simulation;
      const scenario = result.scenario;

      if (scenario && scenario.params) {
        setSourceId(scenario.params.source_node || 'PC1');
        setDestId(scenario.params.destination_node || 'Server1');
        setProtocol(scenario.params.protocol || 'TCP');
      }

      if (scenario && scenario.flags && scenario.flags.disable_router) {
        setDisabledNodes([scenario.flags.disable_router]);
      } else {
        setDisabledNodes([]);
      }

      const pathNodes = sim?.routing?.path || [];

      if (pathNodes.length === 0) {
        setSimState(prev => ({
          ...prev,
          status: 'ERROR',
          error: 'No valid path found. Network might be partitioned due to offline nodes.'
        }));
        return;
      }

      setSimState(prev => ({ ...prev, path: pathNodes, packetId: sim?.packet_id }));

      let hopIndex = 0;
      setSimState(prev => ({ ...prev, currentHop: pathNodes[0] }));
      
      simIntervalRef.current = setInterval(async () => {
        hopIndex++;
        if (hopIndex >= pathNodes.length) {
          clearInterval(simIntervalRef.current);
          setSimState(prev => ({
            ...prev,
            status: 'DONE',
            currentHop: null,
            latency: sim?.metrics?.latency_ms || sim?.metrics?.latency,
            packetLoss: sim?.metrics?.packet_loss_percent || sim?.metrics?.packet_loss,
            metrics: sim?.metrics,
            aiAnalysis: result.ai_analysis
          }));
        } else {
          setSimState(prev => ({
            ...prev,
            currentHop: pathNodes[hopIndex]
          }));
        }
      }, 800);

    } catch (err) {
      clearInterval(simIntervalRef.current);
      setSimState(prev => ({
        ...prev,
        status: 'ERROR',
        error: err.message
      }));
    }
  };

  const fetchTopology = async () => {
    try {
      const data = await api.getTopology();
      const topo = data.topology || data;
      setTopology(topo);
      if (topo.disabled_nodes) {
        setDisabledNodes(topo.disabled_nodes);
      }
      if (topo.nodes && topo.nodes.length >= 2) {
        setSourceId(topo.nodes[0].id);
        setDestId(topo.nodes[topo.nodes.length - 1].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleNode = async (nodeId, currentlyDisabled) => {
    try {
      await api.toggleNodeFailure(nodeId, currentlyDisabled);
      if (currentlyDisabled) {
        setDisabledNodes(prev => prev.filter(id => id !== nodeId));
      } else {
        setDisabledNodes(prev => [...prev, nodeId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreAll = async () => {
    try {
      for (const nodeId of disabledNodes) {
        await api.toggleNodeFailure(nodeId, true);
      }
      setDisabledNodes([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunSimulation = async () => {
    if (sourceId === destId) {
      setSimState(prev => ({ ...prev, status: 'ERROR', error: 'Source and destination cannot be the same node.' }));
      return;
    }

    clearInterval(simIntervalRef.current);
    setSimState({
      status: 'RUNNING',
      path: [],
      currentHop: sourceId,
      latency: 0,
      packetLoss: 0,
      metrics: null,
      aiAnalysis: null,
      error: null,
      packetId: null
    });

    try {
      const result = await api.simulateJourney({
        source_node: sourceId,
        destination_node: destId,
        source_ip: '192.168.1.10',
        destination_ip: '192.168.2.20',
        source_port: 5000,
        destination_port: 80,
        protocol: protocol,
        app_protocol: 'HTTP',
        payload: 'Simulation Payload',
        ttl: 64,
        packet_size: parseInt(packetSize),
        disabled_nodes: disabledNodes
      });

      const sim = result.simulation;
      const pathNodes = sim?.routing?.path || [];

      if (pathNodes.length === 0) {
        setSimState(prev => ({
          ...prev,
          status: 'ERROR',
          error: 'No valid path found. Network might be partitioned due to offline nodes.'
        }));
        return;
      }

      setSimState(prev => ({ ...prev, path: pathNodes, packetId: sim?.packet_id }));

      let hopIndex = 0;
      simIntervalRef.current = setInterval(async () => {
        hopIndex++;
        if (hopIndex >= pathNodes.length) {
          clearInterval(simIntervalRef.current);
          setSimState(prev => ({
            ...prev,
            status: 'DONE',
            currentHop: null,
            latency: sim?.metrics?.latency_ms || sim?.metrics?.latency,
            packetLoss: sim?.metrics?.packet_loss_percent || sim?.metrics?.packet_loss,
            metrics: sim?.metrics,
            aiAnalysis: result.ai_analysis
          }));
        } else {
          setSimState(prev => ({
            ...prev,
            currentHop: pathNodes[hopIndex]
          }));
        }
      }, 800);

    } catch (err) {
      clearInterval(simIntervalRef.current);
      setSimState(prev => ({
        ...prev,
        status: 'ERROR',
        error: err.response?.data?.error || err.message
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Live Network Simulator</h1>
        <p className="text-sm text-slate-500 mt-1">Test network paths, simulate failures, and get AI diagnostics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Network className="w-4 h-4 text-blue-500" />
              <span>Path Settings</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Source Node</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                  value={sourceId} onChange={e => setSourceId(e.target.value)}
                  disabled={simState.status === 'RUNNING'}
                >
                  {topology.nodes.map(n => <option key={n.id} value={n.id}>{n.id} ({n.type})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Destination Node</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                  value={destId} onChange={e => setDestId(e.target.value)}
                  disabled={simState.status === 'RUNNING'}
                >
                  {topology.nodes.map(n => <option key={n.id} value={n.id}>{n.id} ({n.type})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Protocol</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                  value={protocol} onChange={e => setProtocol(e.target.value)}
                  disabled={simState.status === 'RUNNING'}
                >
                  <option value="TCP">TCP (Reliable)</option>
                  <option value="UDP">UDP (Fast)</option>
                  <option value="ICMP">ICMP (Ping)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Packet Size (Bytes)</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                  value={packetSize} onChange={e => setPacketSize(e.target.value)}
                  min="64" max="9000"
                  disabled={simState.status === 'RUNNING'}
                />
              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={simState.status === 'RUNNING'}
              className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm"
            >
              {simState.status === 'RUNNING' ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Simulating...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Simulation</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 p-5 shadow-sm space-y-4">
             <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ServerCrash className="w-4 h-4 text-red-500" />
              <span>Failure Simulation</span>
            </h3>
            <p className="text-xs text-slate-500">
              Click a node on the map and choose "Simulate Failure" to break network links and force routing recalculation.
            </p>
            {disabledNodes.length > 0 && (
              <button 
                onClick={handleRestoreAll}
                className="w-full flex items-center justify-center space-x-2 py-2 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore All Nodes</span>
              </button>
            )}
          </div>

        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Error Message */}
          {simState.status === 'ERROR' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start space-x-3">
              <ServerCrash className="w-5 h-5 shrink-0" />
              <div>
                <strong className="block font-bold">Simulation Failed</strong>
                <span>{simState.error}</span>
              </div>
            </div>
          )}

          {/* Topology Map */}
          <TopologyCanvas
            nodes={topology.nodes}
            links={topology.links}
            activePath={simState.path}
            currentHop={simState.currentHop}
            disabledNodes={disabledNodes}
            onToggleNode={handleToggleNode}
            isSimulating={simState.status === 'RUNNING'}
          />

          {/* Analysis Results (Only show when DONE) */}
          {(simState.status === 'DONE' || simState.status === 'RUNNING') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AIExplanationCard 
                analysis={simState.aiAnalysis} 
                loading={simState.status === 'RUNNING'} 
              />
              
              <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 p-6 shadow-sm flex flex-col justify-center space-y-6">
                <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Delivery Metrics</h4>
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-slate-600">End-to-End Latency</span>
                     <span className="text-lg font-bold text-slate-900">{simState.latency > 0 ? simState.latency : '--'} ms</span>
                   </div>
                   <div className="flex items-center justify-between mt-3">
                     <span className="text-sm text-slate-600">Packet Loss Rate</span>
                     <span className={`text-lg font-bold ${simState.packetLoss > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                       {simState.packetLoss > 0 ? simState.packetLoss : '--'} %
                     </span>
                   </div>
                </div>

                {simState.status === 'DONE' && simState.packetLoss === 0 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm text-emerald-700 font-medium text-center">
                      Packet delivered successfully across {simState.path.length - 1} hops.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
