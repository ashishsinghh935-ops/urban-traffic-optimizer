"use client";

import React, { useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

// 1. Industrial Dark Theme Node Styling
const defaultNodeStyle = 'bg-zinc-800 border-2 border-zinc-600 rounded-md shadow-lg text-zinc-200 font-mono text-sm px-4 py-2';
const inflowNodeStyle = 'bg-zinc-900 border-2 border-emerald-500 rounded-md shadow-lg text-emerald-400 font-mono text-sm px-4 py-2';
const outflowNodeStyle = 'bg-zinc-900 border-2 border-orange-500 rounded-md shadow-lg text-orange-400 font-mono text-sm px-4 py-2';

const initialNodes: Node[] = [
  { id: 'A', position: { x: 150, y: 100 }, data: { label: 'Node A (In)' }, className: inflowNodeStyle },
  { id: 'B', position: { x: 450, y: 100 }, data: { label: 'Node B' }, className: defaultNodeStyle },
  { id: 'C', position: { x: 150, y: 300 }, data: { label: 'Node C' }, className: defaultNodeStyle },
  { id: 'D', position: { x: 450, y: 300 }, data: { label: 'Node D (Out)' }, className: outflowNodeStyle },
];

const initialEdges: Edge[] = [
  { id: 'eA-B', source: 'A', target: 'B', animated: true, label: '---', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'eA-C', source: 'A', target: 'C', animated: true, label: '---', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'eB-D', source: 'B', target: 'D', animated: true, label: '---', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'eC-D', source: 'C', target: 'D', animated: true, label: '---', style: { stroke: '#52525b', strokeWidth: 2 } },
];

export default function TrafficDashboard() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [status, setStatus] = useState("System Standby");
  const [inflowA, setInflowA] = useState(100);
  const [outflowD, setOutflowD] = useState(100);
  const [capacityThreshold, setCapacityThreshold] = useState(80);
  
  // New States for locking and analysis
  const [isLocked, setIsLocked] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [metrics, setMetrics] = useState({ totalFlow: 0, maxFlow: 0, bottleneckCount: 0 });

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  
  const onConnect = useCallback((params: Connection) => {
    const newEdge = { ...params, id: `e${params.source}-${params.target}`, animated: true, label: '---', style: { stroke: '#52525b', strokeWidth: 2 } };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  const handleAddIntersection = () => {
    const nextId = String.fromCharCode(65 + nodes.length);
    const newNode = {
      id: nextId,
      position: { x: Math.random() * 200 + 250, y: Math.random() * 200 + 150 },
      data: { label: `Node ${nextId}` },
      className: defaultNodeStyle
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleOptimize = async () => {
    if (edges.length === 0) return setStatus("ERR: NO_TOPOLOGY");
    setStatus("Computing Matrix...");

    const matrix: number[][] = Array(nodes.length).fill(0).map(() => Array(edges.length).fill(0));
    
    edges.forEach((edge, edgeIndex) => {
      const sourceIndex = nodes.findIndex(n => n.id === edge.source);
      const targetIndex = nodes.findIndex(n => n.id === edge.target);
      if (sourceIndex !== -1) matrix[sourceIndex][edgeIndex] = 1;
      if (targetIndex !== -1) matrix[targetIndex][edgeIndex] = -1;
    });

    const inflows = Array(nodes.length).fill(0);
    inflows[0] = inflowA;
    inflows[nodes.length - 1] = -outflowD;

    try {
      const response = await fetch('https://urban-traffic-optimizer.onrender.com/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidence_matrix: matrix, external_inflows: inflows })
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        let total = 0;
        let max = 0;
        let bCount = 0;

        setStatus(`OK: CONVERGED`);
        setEdges((eds) => eds.map((edge, index) => {
          const flow = Math.abs(data.optimized_flows[index] || 0); 
          const isBottleneck = flow >= capacityThreshold;
          
          // Calculate Metrics
          total += flow;
          if (flow > max) max = flow;
          if (isBottleneck) bCount++;

          return {
            ...edge,
            label: `${flow} u/h`,
            labelStyle: { fill: '#e4e4e7', fontWeight: 700, fontFamily: 'monospace' },
            labelBgStyle: { fill: '#18181b' },
            style: { 
              stroke: isBottleneck ? '#ef4444' : '#10b981', 
              strokeWidth: isBottleneck ? 3 : 2 
            }
          };
        }));

        setMetrics({ totalFlow: total, maxFlow: max, bottleneckCount: bCount });
        setShowAnalysis(true);
      }
    } catch (error) {
      setStatus("ERR: SOLVER_TIMEOUT");
    }
  };

  const loadConnaughtPlacePreset = () => {
    const cpNodes = [
      { id: 'cp-center', position: { x: 400, y: 300 }, data: { label: 'Rajiv Chowk (Hub)' }, className: defaultNodeStyle },
      { id: 'cp-north', position: { x: 400, y: 100 }, data: { label: 'Minto Rd (In)' }, className: inflowNodeStyle },
      { id: 'cp-east', position: { x: 600, y: 300 }, data: { label: 'Barakhamba (Rad)' }, className: defaultNodeStyle },
      { id: 'cp-south', position: { x: 400, y: 500 }, data: { label: 'Janpath (Out)' }, className: outflowNodeStyle },
      { id: 'cp-west', position: { x: 200, y: 300 }, data: { label: 'Sansad Marg (Rad)' }, className: defaultNodeStyle },
    ];

    const cpEdges = [
      { id: 'e-n-e', source: 'cp-north', target: 'cp-east', animated: true, type: 'smoothstep', style: { stroke: '#52525b', strokeWidth: 2 } },
      { id: 'e-e-s', source: 'cp-east', target: 'cp-south', animated: true, type: 'smoothstep', style: { stroke: '#52525b', strokeWidth: 2 } },
      { id: 'e-s-w', source: 'cp-south', target: 'cp-west', animated: true, type: 'smoothstep', style: { stroke: '#52525b', strokeWidth: 2 } },
      { id: 'e-w-n', source: 'cp-west', target: 'cp-north', animated: true, type: 'smoothstep', style: { stroke: '#52525b', strokeWidth: 2 } },
      { id: 'e-n-c', source: 'cp-north', target: 'cp-center', animated: true, style: { stroke: '#52525b', strokeWidth: 2 } },
      { id: 'e-c-s', source: 'cp-center', target: 'cp-south', animated: true, style: { stroke: '#52525b', strokeWidth: 2 } },
      { id: 'e-w-c', source: 'cp-west', target: 'cp-center', animated: true, style: { stroke: '#52525b', strokeWidth: 2 } },
      { id: 'e-c-e', source: 'cp-center', target: 'cp-east', animated: true, style: { stroke: '#52525b', strokeWidth: 2 } },
    ];

    setNodes(cpNodes);
    setEdges(cpEdges);
    setIsLocked(true); // Locks the canvas
    setShowAnalysis(false);
  };

  const resetToCustom = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setIsLocked(false);
    setShowAnalysis(false);
  };
  
  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-300 font-sans overflow-hidden">
      
      {/* Sidebar Command Center */}
      <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col z-10 shadow-2xl">
        <div className="p-6 border-b border-zinc-800 bg-zinc-950">
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight font-mono">
            SYS//FLOW_OPT
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-mono tracking-widest uppercase">Linear Engine v1.0</p>
        </div>
        
        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Inflow Volume</label>
            <input 
              type="number" 
              value={inflowA} 
              onChange={(e) => setInflowA(Number(e.target.value))} 
              className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 rounded focus:outline-none focus:border-emerald-500 transition-colors font-mono text-zinc-200" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Outflow Volume</label>
            <input 
              type="number" 
              value={outflowD} 
              onChange={(e) => setOutflowD(Number(e.target.value))} 
              className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 rounded focus:outline-none focus:border-emerald-500 transition-colors font-mono text-zinc-200" 
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <span>Threshold</span>
              <span className="text-orange-400 font-mono">{capacityThreshold}u</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="200" 
              value={capacityThreshold} 
              onChange={(e) => setCapacityThreshold(Number(e.target.value))} 
              className="w-full accent-emerald-500 cursor-pointer h-1 bg-zinc-800 appearance-none rounded"
            />
          </div>

          <hr className="border-zinc-800 my-2" />

          {!isLocked && (
            <button 
              onClick={handleAddIntersection} 
              className="w-full bg-zinc-800 text-zinc-300 px-4 py-2 rounded hover:bg-zinc-700 transition-colors font-mono text-xs border border-zinc-700 uppercase tracking-wider"
            >
              + Inject Node
            </button>
          )}

          <button 
            onClick={handleOptimize} 
            className="w-full bg-emerald-600 text-zinc-950 px-4 py-3 rounded hover:bg-emerald-500 transition-colors font-bold font-mono tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            Execute Matrix
          </button>

          <div className="mt-2 border-t border-zinc-800 pt-4">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
              Preset Topologies
            </h3>
            {isLocked ? (
              <button 
                onClick={resetToCustom}
                className="w-full bg-zinc-800 text-zinc-300 font-mono text-xs py-2 px-4 rounded hover:bg-zinc-700 border border-zinc-600 uppercase"
              >
                Unlock & Reset
              </button>
            ) : (
              <button 
                onClick={loadConnaughtPlacePreset}
                className="w-full flex items-center justify-center gap-2 bg-zinc-800 text-zinc-300 hover:text-white font-mono text-xs py-2 px-4 rounded hover:bg-zinc-700 transition-colors border border-zinc-700 uppercase"
              >
                Load Connaught Pl.
              </button>
            )}
          </div>

          <div className="mt-auto p-3 bg-zinc-950 rounded border border-zinc-800 text-xs font-mono">
            <span className="block text-zinc-500 mb-1">STATUS</span> 
            <span className={status.includes('ERR') ? 'text-red-400' : 'text-emerald-400'}>{status}</span>
          </div>
        </div>
      </div>
      
      {/* React Flow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onConnect={onConnect} 
          nodesDraggable={!isLocked}
          nodesConnectable={!isLocked}
          elementsSelectable={!isLocked}
          fitView
          className="bg-zinc-950"
        >
          <Background color="#27272a" gap={20} size={1} />
          <Controls className="bg-zinc-800 border-zinc-700 fill-zinc-400 shadow-lg" />
        </ReactFlow>

        {/* Analysis Drawer */}
        <div className={`absolute top-0 right-0 h-full w-72 bg-zinc-900 border-l border-zinc-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${showAnalysis ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6">
              <h2 className="text-sm font-bold text-zinc-100 font-mono tracking-widest">ANALYSIS</h2>
              <button onClick={() => setShowAnalysis(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest mb-1">TOTAL NETWORK LOAD</p>
                <p className="text-2xl text-zinc-200 font-mono">{metrics.totalFlow} <span className="text-sm text-zinc-500">u/h</span></p>
              </div>
              
              <div>
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest mb-1">PEAK BOTTLENECK</p>
                <p className="text-2xl text-orange-400 font-mono">{metrics.maxFlow} <span className="text-sm text-zinc-500">u/h</span></p>
              </div>

              <div>
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest mb-1">STRESS POINTS</p>
                <p className={`text-2xl font-mono ${metrics.bottleneckCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {metrics.bottleneckCount}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                  Engine utilized least-squares solver to balance $Ax = b$ across {edges.length} active vectors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}