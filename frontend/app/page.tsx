"use client";

import React, { useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  { id: 'A', position: { x: 150, y: 100 }, data: { label: 'Intersection A (Inflow)' }, style: { border: '2px solid #22c55e', padding: 10 } },
  { id: 'B', position: { x: 450, y: 100 }, data: { label: 'Intersection B' }, style: { border: '1px solid #333', padding: 10 } },
  { id: 'C', position: { x: 150, y: 300 }, data: { label: 'Intersection C' }, style: { border: '1px solid #333', padding: 10 } },
  { id: 'D', position: { x: 450, y: 300 }, data: { label: 'Intersection D (Outflow)' }, style: { border: '2px solid #ef4444', padding: 10 } },
];

const initialEdges: Edge[] = [
  { id: 'eA-B', source: 'A', target: 'B', animated: true, label: 'Pending...' },
  { id: 'eA-C', source: 'A', target: 'C', animated: true, label: 'Pending...' },
  { id: 'eB-D', source: 'B', target: 'D', animated: true, label: 'Pending...' },
  { id: 'eC-D', source: 'C', target: 'D', animated: true, label: 'Pending...' },
];

export default function TrafficDashboard() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [status, setStatus] = useState("Awaiting Optimization...");
  const [inflowA, setInflowA] = useState(100);
  const [outflowD, setOutflowD] = useState(100);
  
  // New state for the bottleneck capacity threshold slider
  const [capacityThreshold, setCapacityThreshold] = useState(80);

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  
  const onConnect = useCallback((params: Connection) => {
    const newEdge = { ...params, id: `e${params.source}-${params.target}`, animated: true, label: 'Pending...' };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  const handleAddIntersection = () => {
    const nextId = String.fromCharCode(65 + nodes.length);
    const newNode = {
      id: nextId,
      position: { x: Math.random() * 200 + 250, y: Math.random() * 200 + 150 },
      data: { label: `Intersection ${nextId}` },
      style: { border: '1px solid #333', padding: 10 }
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
      const response = await fetch('http://127.0.0.1:8000/optimize', {
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
          return {
            ...edge,
            label: `${flow} units/hr`,
            // Using our interactive slider threshold here!
            style: { stroke: flow >= capacityThreshold ? '#ef4444' : '#22c55e', strokeWidth: 2 }
          };
        }));
      }
    } catch (error) {
      console.error("Backend connection failed:", error);
      setStatus("Error: Cannot reach FastAPI backend.");
    }
  };

  return (
    <div className="flex h-screen w-full bg-zinc-50 font-sans">
      <div className="w-80 bg-white border-r shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-zinc-900">Traffic Settings</h1>
          <p className="text-xs text-zinc-500 mt-1">Adjust flow and run the engine.</p>
        </div>
        
        <div className="p-6 flex-1 flex flex-col gap-5 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-700">Inflow at Node A (units/hr)</label>
            <input type="number" value={inflowA} onChange={(e) => setInflowA(Number(e.target.value))} className="border p-2 rounded-md text-sm text-black" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-700">Outflow at Last Node (units/hr)</label>
            <input type="number" value={outflowD} onChange={(e) => setOutflowD(Number(e.target.value))} className="border p-2 rounded-md text-sm text-black" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm font-semibold text-zinc-700">
              <span>Bottleneck Limit</span>
              <span className="text-blue-600">{capacityThreshold} units</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="200" 
              value={capacityThreshold} 
              onChange={(e) => setCapacityThreshold(Number(e.target.value))} 
              className="accent-black cursor-pointer"
            />
          </div>

          <button onClick={handleAddIntersection} className="w-full bg-zinc-200 text-zinc-800 px-4 py-2 rounded-md hover:bg-zinc-300 transition-all font-medium text-sm">
            + Add New Intersection
          </button>

          <button onClick={handleOptimize} className="w-full bg-black text-white px-4 py-3 rounded-md hover:bg-zinc-800 transition-all font-medium shadow-sm mt-2">
            Run Math Engine
          </button>

          <div className="mt-2 p-4 bg-zinc-100 rounded-md border text-sm text-zinc-700">
            <strong>Status:</strong> <br/> {status}
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView>
          <Background color="#ccc" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}