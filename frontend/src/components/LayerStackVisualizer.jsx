import React, { useState } from 'react';
import { Layers, ArrowDown, ArrowUp, ShieldCheck, Binary, Cpu, Server, Terminal, Radio } from 'lucide-react';

export default function LayerStackVisualizer({
  osiLayers = {},
  activeLayer = null,
  isDecapsulation = false,
  onSelectLayer = null
}) {
  const [selectedLayerNum, setSelectedLayerNum] = useState(activeLayer || 7);

  const layerOrder = [7, 6, 5, 4, 3, 2, 1];

  const getLayerIcon = (num) => {
    switch (num) {
      case 7: return Server;
      case 6: return Terminal;
      case 5: return ShieldCheck;
      case 4: return Cpu;
      case 3: return Layers;
      case 2: return Radio;
      case 1: return Binary;
      default: return Layers;
    }
  };

  const selectedData = osiLayers[selectedLayerNum] || osiLayers[7] || {
    layer_number: 7,
    name: "Application",
    tcpip_equivalent: "Application",
    pdu_name: "Data",
    protocol: "HTTP",
    description: "Application Layer Services",
    header_data: {}
  };

  return (
    <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
      
      {/* Title & Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              OSI & TCP/IP Layer Stack Inspector
            </h3>
            <p className="text-xs text-slate-400">
              Interactive 7-Layer Protocol Data Unit (PDU) & Encapsulation Mapping
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            {isDecapsulation ? (
              <>
                <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Decapsulation (Ascending)</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-sky-300 font-medium">Encapsulation (Descending)</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Layer Stack Buttons Column (Left) */}
        <div className="lg:col-span-5 space-y-1.5">
          {layerOrder.map((num) => {
            const layer = osiLayers[num] || { name: `Layer ${num}`, tcpip_equivalent: 'Network', pdu_name: 'PDU' };
            const isHighlighted = activeLayer === num;
            const isSelected = selectedLayerNum === num;
            const Icon = getLayerIcon(num);

            return (
              <button
                key={`layer-${num}`}
                onClick={() => {
                  setSelectedLayerNum(num);
                  if (onSelectLayer) onSelectLayer(num);
                }}
                className={`w-full text-left p-2.5 rounded-lg border transition-all duration-150 flex items-center justify-between ${
                  isHighlighted
                    ? 'bg-sky-500/20 border-sky-400 text-white font-semibold'
                    : isSelected
                    ? 'bg-slate-800/90 border-sky-500/30 text-white'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                    isHighlighted ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-800 text-sky-400 border border-slate-700'
                  }`}>
                    {num}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-white">{layer.name}</span>
                      <span className="text-[10px] text-sky-400 font-mono">({layer.pdu_name})</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      TCP/IP: <span className="text-slate-300 font-medium">{layer.tcpip_equivalent}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Icon className={`w-3.5 h-3.5 ${isHighlighted ? 'text-sky-300' : 'text-slate-500'}`} />
                  {isHighlighted && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Layer Deep Header Inspector (Right) */}
        <div className="lg:col-span-7 glass-panel bg-[#090d16] rounded-lg border border-slate-800 p-4 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 text-xs font-semibold border border-sky-500/20">
                  Layer {selectedData.layer_number}
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{selectedData.name} Layer</h4>
              </div>
              <span className="text-xs font-mono text-slate-400">
                PDU: <span className="text-emerald-400 font-medium">{selectedData.pdu_name}</span>
              </span>
            </div>

            {/* Description */}
            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              {selectedData.description}
            </p>

            {/* Encapsulation Label Banner */}
            {selectedData.encapsulation_label && (
              <div className="mt-3 p-2.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-sky-300 break-all">
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Encapsulated Structure:</span>
                {selectedData.encapsulation_label}
              </div>
            )}

            {/* Layer Header Key-Values */}
            <div className="mt-4">
              <h5 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Protocol Header Fields:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedData.header_data && Object.entries(selectedData.header_data).map(([key, val]) => (
                  <div key={key} className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{key}</span>
                    <span className="font-mono text-white text-[11px] break-words">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Mapped TCP/IP Layer: <strong className="text-sky-400 font-medium">{selectedData.tcpip_equivalent}</strong></span>
            <span>Protocol: <strong className="text-white">{selectedData.protocol}</strong></span>
          </div>

        </div>

      </div>

    </div>
  );
}
