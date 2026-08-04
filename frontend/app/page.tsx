"use client";

import React, { useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

// 1. Premium Light Theme Node Styling
const initialNodes: Node[] = [
  { 
    id: 'A', 
    position: { x: 150, y: 100 }, 
    data: { label: 'Intersection A (Inflow)' }, 
    className: 'bg-emerald-50 border-2 border-emerald-400 rounded-xl shadow-sm text-emerald-900 font-semibold px-5 py-3'
  },
  { 
    id: 'B', 
    position: { x: 450, y: 100 }, 
    data: { label: 'Intersection B' }, 
    className: 'bg-white border-2 border-slate-200 rounded-xl shadow-sm text-slate-700 font-semibold px-5 py-3'
  },
  { 
    id: 'C', 
    position: { x: 150, y: 300 }, 
    data: { label: 'Intersection C' }, 
    className: 'bg-white border-2 border-slate-200 rounded-xl shadow-sm text-slate-700 font-semibold px-5 py-3'
  },
  { 
    id: 'D', 
    position: { x: 450, y: 300 }, 
    data: { label: 'Intersection D (Outflow)' }, 
    className: 'bg-rose-50 border-2 border-rose-400 rounded-xl shadow-sm text-rose-900 font-semibold px-5 py-3'
  },
];

const initialEdges: Edge[] = [
  { id: 'eA-B', source: 'A', target: 'B', animated: true, label: 'Pending...', style: { strokeWidth: 2 } },
  { id: 'eA-C', source: 'A', target: 'C', animated: true, label: 'Pending...', style: { strokeWidth: 2 } },
  { id: 'eB-D', source: 'B', target: 'D', animated: true, label: 'Pending...', style: { strokeWidth: 2 } },
  { id: 'eC-D', source: 'C', target: 'D', animated: true, label: 'Pending...', style: { strokeWidth: 2 } },
];

export default function TrafficDashboard() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [status, setStatus] = useState("Awaiting Optimization...");
  const [inflowA, setInflowA] = useState(100);
  const [outflowD, setOutflowD] = useState(100);
  const [capacityThreshold, setCapacityThreshold] = useState(80);

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  
  const onConnect = useCallback((params: Connection) => {
    const newEdge = { ...params, id: `e${params.source}-${params.target}`, animated: true, label: 'Pending...', style: { strokeWidth: 2 } };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  const handleAddIntersection = () => {
    const nextId = String.fromCharCode(65 + nodes.length);
    const newNode = {
      id: nextId,
      position: { x: Math.random() * 200 + 250, y: Math.random() * 200 + 150 },
      data: { label: `Intersection ${nextId}` },
      className: 'bg-white border-2 border-slate-200 rounded-xl shadow-sm text-slate-700 font-semibold px-5 py-3'
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleOptimize = async () => {
    if (edges.length === 0) return setStatus("Add some roads first!");
    setStatus("Calculating route optimization...");

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
        body: JSON.stringify({
          incidence_matrix: matrix,
          external_inflows: inflows
        })
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        setStatus(`Optimization Complete! Bottlenecks: ${data.bottlenecks_detected ? "Yes" : "No"}`);
        setEdges((eds) => eds.map((edge, index) => {
          const flow = data.optimized_flows[index] || 0;
          const isBottleneck = flow >= capacityThreshold;
          return {
            ...edge,
            label: `${flow} units/hr`,
            style: { 
              stroke: isBottleneck ? '#f43f5e' : '#10b981', 
              strokeWidth: isBottleneck ? 3 : 2 
            }
          };
        }));
      }
    } catch (error) {
      console.error("Backend connection failed:", error);
      setStatus("Error: Cannot reach FastAPI backend.");
    }
  };

  const loadConnaughtPlacePreset = () => {
    const cpNodes = [
      { id: 'cp-center', position: { x: 400, y: 300 }, data: { label: 'Rajiv Chowk (Inner Hub)' }, type: 'default' },
      { id: 'cp-north', position: { x: 400, y: 100 }, data: { label: 'Minto Road (Inflow)' }, type: 'input' },
      { id: 'cp-east', position: { x: 600, y: 300 }, data: { label: 'Barakhamba Rd (Radial)' }, type: 'default' },
      { id: 'cp-south', position: { x: 400, y: 500 }, data: { label: 'Janpath (Outflow)' }, type: 'output' },
      { id: 'cp-west', position: { x: 200, y: 300 }, data: { label: 'Sansad Marg (Radial)' }, type: 'default' },
    ];

    const cpEdges = [
      // Outer Ring Connections
      { id: 'e-n-e', source: 'cp-north', target: 'cp-east', animated: true, type: 'smoothstep' },
      { id: 'e-e-s', source: 'cp-east', target: 'cp-south', animated: true, type: 'smoothstep' },
      { id: 'e-s-w', source: 'cp-south', target: 'cp-west', animated: true, type: 'smoothstep' },
      { id: 'e-w-n', source: 'cp-west', target: 'cp-north', animated: true, type: 'smoothstep' },
      
      // Radial Spokes connecting to the Hub
      { id: 'e-n-c', source: 'cp-north', target: 'cp-center', animated: true },
      { id: 'e-c-s', source: 'cp-center', target: 'cp-south', animated: true },
      { id: 'e-w-c', source: 'cp-west', target: 'cp-center', animated: true },
      { id: 'e-c-e', source: 'cp-center', target: 'cp-east', animated: true },
    ];

    setNodes(cpNodes);
    setEdges(cpEdges);
  };
  
  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans selection:bg-blue-100">
      
      {/* 2. Premium Sidebar UI */}
      <div className="w-80 bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-10">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            FlowOptimizer
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide uppercase">Math Engine Dashboard</p>
        </div>
        
        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Inflow at Node A</label>
            <input 
              type="number" 
              value={inflowA} 
              onChange={(e) => setInflowA(Number(e.target.value))} 
              className="w-full border border-slate-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-slate-800 font-medium" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Outflow at Last Node</label>
            <input 
              type="number" 
              value={outflowD} 
              onChange={(e) => setOutflowD(Number(e.target.value))} 
              className="w-full border border-slate-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-slate-800 font-medium" 
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-wide">
              <span>Bottleneck Limit</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md">{capacityThreshold} units</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="200" 
              value={capacityThreshold} 
              onChange={(e) => setCapacityThreshold(Number(e.target.value))} 
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
            />
          </div>

          <hr className="border-slate-100 my-2" />

          <button 
            onClick={handleAddIntersection} 
            className="w-full bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-semibold text-sm border border-slate-200"
          >
            + Add New Intersection
          </button>

          <button 
            onClick={handleOptimize} 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl hover:opacity-90 transition-opacity font-bold shadow-md shadow-blue-500/20 mt-2"
          >
            Run Math Engine
          </button>

          {/* New Real-World Presets Button - MOVED UP HERE */}
          <div className="mt-2 border-t pt-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Real-World Networks
            </h3>
            <button 
              onClick={loadConnaughtPlacePreset}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-sm border border-slate-700 text-sm"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Load Connaught Place
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center leading-tight">
              Automatically maps radial flows and inner-circle matrices for Ax = b calculation.
            </p>
          </div>

          {/* System Status - MOVED DOWN HERE */}
          <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 shadow-inner">
            <span className="font-bold block mb-1 text-slate-900">System Status:</span> 
            <span className="text-slate-600">{status}</span>
          </div>

        </div>
      </div>
      
      {/* 3. Refined Canvas */}
      <div className="flex-1 relative">
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onConnect={onConnect} 
          fitView
        >
          <Background color="#cbd5e1" gap={20} size={1.5} />
          <Controls className="bg-white border-slate-200 shadow-md rounded-lg" />
        </ReactFlow>
      </div>
    </div>
  );
}