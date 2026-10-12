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
  const [scenarios, setScenarios] = useState([]);
  const [scenarioId, setScenarioId] = useState('NORMAL');
  const [scenarioError, setScenarioError] = useState(null);

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
  const runVersion = useRef(0);

  useEffect(() => {
    fetchTopology();
    return () => { clearInterval(simIntervalRef.current); runVersion.current++; };
  }, []);

  useEffect(() => {
    let active = true;
    api.getScenarios().then(data => {
      if (active) setScenarios(data);
    }).catch(error => {
      if (active) setScenarioError(error.message);
    });
    return () => { active = false; };
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
    setScenarioId(scenarioId);
    const version = ++runVersion.current;
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
      if (version !== runVersion.current) return;
      const sim = result.simulation;
      const scenario = result.scenario;

      if (scenario && scenario.params) {
        setSourceId(sim.packet_data.source_node);
        setDestId(sim.packet_data.destination_node);
        setProtocol(scenario.params.protocol || 'TCP');
        setPacketSize(scenario.params.packet_size);
      }

      setTopology(result.topology);
      setDisabledNodes(result.topology.disabled_nodes);

      const pathNodes = sim?.traversed_path || sim?.routing?.path || [];

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
      
      simIntervalRef.current = setInterval(() => {
        if (version !== runVersion.current) return;
        hopIndex++;
        if (hopIndex >= pathNodes.length) {
          clearInterval(simIntervalRef.current);
          setSimState(prev => ({
            ...prev,
            status: 'DONE',
            currentHop: null,
            latency: sim?.metrics?.latency,
            packetLoss: sim?.metrics?.packet_loss,
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
      if (version !== runVersion.current) return;
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
      setSimState(prev => ({ ...prev, status: 'ERROR', error: err.message }));
    }
  };

  const handleToggleNode = async (nodeId, currentlyDisabled) => {
    try {
      const result = await api.toggleNodeFailure(nodeId, currentlyDisabled);
      setTopology(result.topology);
      setDisabledNodes(result.topology.disabled_nodes);
    } catch (err) {
      setSimState(prev => ({ ...prev, status: 'ERROR', error: err.message }));
    }
  };

  const handleRestoreAll = async () => {
    try {
      for (const nodeId of disabledNodes) {
        await api.toggleNodeFailure(nodeId, true);
      }
      const data = await api.getTopology();
      setTopology(data.topology);
      setDisabledNodes(data.topology.disabled_nodes);
    } catch (err) {
      setSimState(prev => ({ ...prev, status: 'ERROR', error: err.message }));
    }
  };

  const handleRunSimulation = async () => {
    if (sourceId === destId) {
      setSimState(prev => ({ ...prev, status: 'ERROR', error: 'Source and destination cannot be the same node.' }));
      return;
    }

    const version = ++runVersion.current;
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
      const source = topology.nodes.find(node => node.id === sourceId);
      const destination = topology.nodes.find(node => node.id === destId);
      if (!source || !destination) throw new Error('Select valid source and destination nodes.');
      const currentTopology = await api.getTopology();
      if (version !== runVersion.current) return;
      setTopology(currentTopology.topology);
      setDisabledNodes(currentTopology.topology.disabled_nodes);
      const result = await api.simulateJourney({
        source_node: sourceId,
        destination_node: destId,
        source_ip: source.ip,
        destination_ip: destination.ip,
        source_port: 5000,
        destination_port: 80,
        protocol: protocol,
        app_protocol: 'HTTP',
        payload: 'Simulation Payload',
        ttl: 64,
        packet_size: Number(packetSize)
      });

      if (version !== runVersion.current) return;
      const sim = result.simulation;
      const pathNodes = sim?.traversed_path || sim?.routing?.path || [];

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
      simIntervalRef.current = setInterval(() => {
        if (version !== runVersion.current) return;
        hopIndex++;
        if (hopIndex >= pathNodes.length) {
          clearInterval(simIntervalRef.current);
          setSimState(prev => ({
            ...prev,
            status: 'DONE',
            currentHop: null,
            latency: sim?.metrics?.latency,
            packetLoss: sim?.metrics?.packet_loss,
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
      if (version !== runVersion.current) return;
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Network Simulator</h1>
        <p className="text-sm text-slate-500 mt-1">Test network paths, simulate failures, and get AI diagnostics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <label htmlFor="scenario-preset" className="block text-sm font-bold text-slate-900">Scenario Preset</label>
            {scenarioError && <p role="alert" className="text-xs text-red-700">Presets unavailable: {scenarioError}</p>}
            <select id="scenario-preset" value={scenarioId} onChange={event => setScenarioId(event.target.value)}
              disabled={simState.status === 'RUNNING' || !scenarios.length}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-sm">
              {scenarios.map(scenario => <option key={scenario.id} value={scenario.id}>{scenario.title}</option>)}
            </select>
            <p className="text-xs text-slate-500">{scenarios.find(scenario => scenario.id === scenarioId)?.description}</p>
            <button onClick={() => handleRunScenario(scenarioId)}
              disabled={simState.status === 'RUNNING' || !scenarios.some(scenario => scenario.id === scenarioId)}
              className="w-full py-2 rounded-md bg-blue-600 text-white text-sm font-semibold disabled:opacity-50">
              Run Preset
            </button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Network className="w-4 h-4 text-blue-500" />
              <span>Path Settings</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label htmlFor="source-node" className="block text-xs font-semibold text-slate-500 mb-1">Source Node</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                  id="source-node" value={sourceId} onChange={e => setSourceId(e.target.value)}
                  disabled={simState.status === 'RUNNING' || !topology.nodes.length}
                >
                  {topology.nodes.map(n => <option key={n.id} value={n.id}>{n.id} ({n.type})</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="destination-node" className="block text-xs font-semibold text-slate-500 mb-1">Destination Node</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                  id="destination-node" value={destId} onChange={e => setDestId(e.target.value)}
                  disabled={simState.status === 'RUNNING' || !topology.nodes.length}
                >
                  {topology.nodes.map(n => <option key={n.id} value={n.id}>{n.id} ({n.type})</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="protocol" className="block text-xs font-semibold text-slate-500 mb-1">Protocol</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                  id="protocol" value={protocol} onChange={e => setProtocol(e.target.value)}
                  disabled={simState.status === 'RUNNING' || !topology.nodes.length}
                >
                  <option value="TCP">TCP (Reliable)</option>
                  <option value="UDP">UDP (Fast)</option>
                  <option value="ICMP">ICMP (Ping)</option>
                </select>
              </div>

              <div>
                <label htmlFor="packet-size" className="block text-xs font-semibold text-slate-500 mb-1">Packet Size (Bytes)</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                  id="packet-size" value={packetSize} onChange={e => setPacketSize(e.target.value)}
                  min="64" max="9000"
                  disabled={simState.status === 'RUNNING' || !topology.nodes.length}
                />
              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={simState.status === 'RUNNING' || !topology.nodes.length}
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
                disabled={simState.status === 'RUNNING'}
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
                     <span className="text-sm text-slate-600">Estimated Path Latency</span>
                     <span className="text-lg font-bold text-slate-900">{simState.latency > 0 ? simState.latency : '--'} ms</span>
                   </div>
                   <div className="flex items-center justify-between mt-3">
                     <span className="text-sm text-slate-600">Packet Loss Rate</span>
                     <span className={`text-lg font-bold ${simState.packetLoss > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                       {simState.status === 'DONE' ? simState.packetLoss : '--'} %
                     </span>
                   </div>
                </div>

                {simState.status === 'DONE' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-sm text-slate-700 font-medium text-center">
                      {simState.metrics?.status?.startsWith('DELIVERED') ? `Packet delivered across ${simState.metrics.hops} links.` : `Packet dropped after ${simState.metrics?.hops} links (${simState.metrics?.status}).`}
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
