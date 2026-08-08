"use client";

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import ReactFlow, { Background, Controls, addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

const defaultNodeStyle = 'bg-white border-2 border-slate-200 rounded-lg shadow-sm text-slate-700 font-semibold px-4 py-2 text-sm';
const inflowNodeStyle = 'bg-blue-50 border-2 border-blue-400 rounded-lg shadow-sm text-blue-900 font-semibold px-4 py-2 text-sm';
const outflowNodeStyle = 'bg-indigo-50 border-2 border-indigo-400 rounded-lg shadow-sm text-indigo-900 font-semibold px-4 py-2 text-sm';

const initialNodes: Node[] = [
  { id: 'A', position: { x: 150, y: 100 }, data: { label: 'Node A (Inflow)' }, className: inflowNodeStyle },
  { id: 'B', position: { x: 450, y: 100 }, data: { label: 'Node B' }, className: defaultNodeStyle },
  { id: 'C', position: { x: 150, y: 300 }, data: { label: 'Node C' }, className: defaultNodeStyle },
  { id: 'D', position: { x: 450, y: 300 }, data: { label: 'Node D (Outflow)' }, className: outflowNodeStyle },
];

const initialEdges: Edge[] = [
  { id: 'eA-B', source: 'A', target: 'B', animated: true, label: '---', style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'eA-C', source: 'A', target: 'C', animated: true, label: '---', style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'eB-D', source: 'B', target: 'D', animated: true, label: '---', style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'eC-D', source: 'C', target: 'D', animated: true, label: '---', style: { stroke: '#94a3b8', strokeWidth: 2 } },
];

export default function TrafficDashboard() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [status, setStatus] = useState("System Standby");
  const [inflowA, setInflowA] = useState(100);
  const [outflowD, setOutflowD] = useState(100);
  const [capacityThreshold, setCapacityThreshold] = useState(80);
  
  const [isLocked, setIsLocked] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [metrics, setMetrics] = useState({ totalFlow: 0, maxFlow: 0, bottleneckCount: 0 });

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  
  const onConnect = useCallback((params: Connection) => {
    const newEdge = { ...params, id: `e${params.source}-${params.target}`, animated: true, label: '---', style: { stroke: '#94a3b8', strokeWidth: 2 } };
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
    if (edges.length === 0) return setStatus("Error: No topology found");
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
        
        // Map flows to edges for the UI
        const updatedEdges = edges.map((edge, index) => {
          const flow = Math.abs(data.optimized_flows[index] || 0); 
          const isBottleneck = flow >= capacityThreshold;
          
          total += flow;
          if (flow > max) max = flow;
          if (isBottleneck) bCount++;

          return {
            ...edge,
            label: `${flow} units/hr`,
            labelStyle: { fill: '#334155', fontWeight: 600 },
            labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
            style: { 
              stroke: isBottleneck ? '#ef4444' : '#10b981', 
              strokeWidth: isBottleneck ? 3 : 2 
            }
          };
        });

        setStatus(`Optimization Complete`);
        setEdges(updatedEdges);
        setMetrics({ totalFlow: total, maxFlow: max, bottleneckCount: bCount });
        setShowAnalysis(true);
        
        // Helper to grab real names for the math page
        const getNodeLabel = (id: string) => nodes.find(n => n.id === id)?.data.label || id;

        // Save data to session storage (passing the FULL edges array so the mini-map works)
        sessionStorage.setItem('liveMathData', JSON.stringify({
          matrix: matrix,
          bVector: inflows,
          xVector: data.optimized_flows,
          nodeLabels: nodes.map(n => n.data.label),
          edgeLabels: edges.map(e => `${getNodeLabel(e.source)} → ${getNodeLabel(e.target)}`),
          nodes: nodes,
          edges: updatedEdges // Pass the colored/labeled edges!
        }));
      }
    } catch (error) {
      setStatus("Error: Connection Failed");
    }
  };

  const loadConnaughtPlacePreset = () => {
    const cpNodes = [
      { id: 'cp-center', position: { x: 400, y: 300 }, data: { label: 'Rajiv Chowk (Hub)' }, className: defaultNodeStyle, draggable: false, selectable: false },
      { id: 'cp-north', position: { x: 400, y: 100 }, data: { label: 'Minto Rd (In)' }, className: inflowNodeStyle, draggable: false, selectable: false },
      { id: 'cp-east', position: { x: 600, y: 300 }, data: { label: 'Barakhamba (Rad)' }, className: defaultNodeStyle, draggable: false, selectable: false },
      { id: 'cp-south', position: { x: 400, y: 500 }, data: { label: 'Janpath (Out)' }, className: outflowNodeStyle, draggable: false, selectable: false },
      { id: 'cp-west', position: { x: 200, y: 300 }, data: { label: 'Sansad Marg (Rad)' }, className: defaultNodeStyle, draggable: false, selectable: false },
    ];

    const cpEdges = [
      { id: 'e-n-e', source: 'cp-north', target: 'cp-east', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
      { id: 'e-e-s', source: 'cp-east', target: 'cp-south', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
      { id: 'e-s-w', source: 'cp-south', target: 'cp-west', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
      { id: 'e-w-n', source: 'cp-west', target: 'cp-north', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
      { id: 'e-n-c', source: 'cp-north', target: 'cp-center', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
      { id: 'e-c-s', source: 'cp-center', target: 'cp-south', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
      { id: 'e-w-c', source: 'cp-west', target: 'cp-center', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
      { id: 'e-c-e', source: 'cp-center', target: 'cp-east', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
    ];

    setNodes(cpNodes);
    setEdges(cpEdges);
    setIsLocked(true);
    setShowAnalysis(false);
  };

  const resetToCustom = () => {
    const unlockedNodes = initialNodes.map(node => ({ ...node, draggable: true, selectable: true }));
    setNodes(unlockedNodes);
    setEdges(initialEdges);
    setIsLocked(false);
    setShowAnalysis(false);
  };
  
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              FlowOptimizer
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">Math Engine Dashboard</p>
          </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col gap-5 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Inflow Volume</label>
            <input 
              type="number" 
              value={inflowA} 
              onChange={(e) => setInflowA(Number(e.target.value))} 
              className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-slate-800" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Outflow Volume</label>
            <input 
              type="number" 
              value={outflowD} 
              onChange={(e) => setOutflowD(Number(e.target.value))} 
              className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-slate-800" 
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-wide">
              <span>Bottleneck Limit</span>
              <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">{capacityThreshold} units</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="200" 
              value={capacityThreshold} 
              onChange={(e) => setCapacityThreshold(Number(e.target.value))} 
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 appearance-none rounded-lg"
            />
          </div>

          <hr className="border-slate-100 my-2" />

          {!isLocked && (
            <button 
              onClick={handleAddIntersection} 
              className="w-full bg-white text-slate-700 px-4 py-2.5 rounded-md hover:bg-slate-50 transition-colors font-medium text-sm border border-slate-200 shadow-sm"
            >
              + Add New Intersection
            </button>
          )}

          <button 
            onClick={handleOptimize} 
            className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-semibold text-sm shadow-sm mt-1"
          >
            Run Math Engine
          </button>

          <div className="mt-2 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
              Real-World Presets
            </h3>
            {isLocked ? (
              <button 
                onClick={resetToCustom}
                className="w-full bg-white text-slate-600 font-medium text-sm py-2 px-4 rounded-md hover:bg-slate-50 border border-slate-200 shadow-sm"
              >
                Unlock & Reset to Custom
              </button>
            ) : (
              <button 
                onClick={loadConnaughtPlacePreset}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white font-medium text-sm py-2 px-4 rounded-md hover:bg-slate-900 transition-colors shadow-sm"
              >
                Load Connaught Place
              </button>
            )}
          </div>

          <div className="mt-auto p-3 bg-slate-50 rounded-md border border-slate-200 text-xs shadow-inner">
            <span className="block font-semibold text-slate-700 mb-1">System Status:</span> 
            <span className={status.includes('Error') ? 'text-red-600' : 'text-blue-600'}>{status}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={isLocked ? undefined : onNodesChange} 
          onEdgesChange={isLocked ? undefined : onEdgesChange} 
          onConnect={onConnect} 
          nodesDraggable={!isLocked}
          nodesConnectable={!isLocked}
          elementsSelectable={!isLocked}
          fitView
          className="bg-slate-50"
        >
          <Background color="#cbd5e1" gap={20} size={1} />
          <Controls className="bg-white border-slate-200 fill-slate-600 shadow-sm" showInteractive={false} />
        </ReactFlow>

        <div className={`absolute top-0 right-0 h-full w-80 bg-white border-l border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${showAnalysis ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 flex-1">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">Analysis Results</h2>
              <button onClick={() => setShowAnalysis(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Total Network Load</p>
                <p className="text-3xl text-slate-800 font-light">{metrics.totalFlow} <span className="text-sm text-slate-500 font-normal">units/hr</span></p>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Peak Bottleneck Volume</p>
                <p className="text-3xl text-blue-600 font-light">{metrics.maxFlow} <span className="text-sm text-slate-500 font-normal">units/hr</span></p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Active Stress Points</p>
                <p className={`text-3xl font-light ${metrics.bottleneckCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {metrics.bottleneckCount}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Engine utilized least-squares solver to balance Ax = b across active vectors.
            </p>
            <Link href="/the-math" className="w-full block text-center bg-slate-800 text-white font-medium text-sm py-2.5 px-4 rounded-md hover:bg-slate-900 transition-colors shadow-sm">
              View Live Math Breakdown &rarr;
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}