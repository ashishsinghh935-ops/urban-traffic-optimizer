"use client";

import React, { useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

// Initial Traffic Intersections (Nodes)
const initialNodes: Node[] = [
  { id: 'A', position: { x: 150, y: 100 }, data: { label: 'Intersection A (Inflow)' }, style: { border: '2px solid #22c55e', padding: 10 } },
  { id: 'B', position: { x: 450, y: 100 }, data: { label: 'Intersection B' }, style: { border: '1px solid #333', padding: 10 } },
  { id: 'C', position: { x: 150, y: 300 }, data: { label: 'Intersection C' }, style: { border: '1px solid #333', padding: 10 } },
  { id: 'D', position: { x: 450, y: 300 }, data: { label: 'Intersection D (Outflow)' }, style: { border: '2px solid #ef4444', padding: 10 } },
];

// Initial Roads (Edges)
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
  
  // New state variables for dynamic inputs
  const [inflowA, setInflowA] = useState(100);
  const [outflowD, setOutflowD] = useState(100);

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const handleOptimize = async () => {
    setStatus("Calculating route optimization...");
    try {
      const response = await fetch('http://127.0.0.1:8000/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidence_matrix: [[1, 1, 0, 0], [0, -1, 1, 0], [-1, 0, 0, 1], [0, 0, -1, -1]],
          // Using our dynamic input values here!
          external_inflows: [inflowA, 0, 0, -outflowD] 
        })
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        setStatus(`Optimization Complete! Bottlenecks: ${data.bottlenecks_detected ? "Yes" : "No"}`);
        setEdges((eds) => eds.map((edge, index) => ({
          ...edge,
          label: `${data.optimized_flows[index]} units/hr`,
          // Changed bottleneck threshold to 80 for visual testing
          style: { stroke: data.optimized_flows[index] >= 80 ? '#ef4444' : '#22c55e', strokeWidth: 2 }
        })));
      }
    } catch (error) {
      console.error("Backend connection failed:", error);
      setStatus("Error: Cannot reach FastAPI backend.");
    }
  };

  return (
    <div className="flex h-screen w-full bg-zinc-50 font-sans">
      
      {/* Control Panel Sidebar */}
      <div className="w-80 bg-white border-r shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-zinc-900">Traffic Settings</h1>
          <p className="text-xs text-zinc-500 mt-1">Adjust flow and run the engine.</p>
        </div>
        
        <div className="p-6 flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-700">Inflow at Node A (units/hr)</label>
            <input 
              type="number" 
              value={inflowA}
              onChange={(e) => setInflowA(Number(e.target.value))}
              className="border p-2 rounded-md text-sm text-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-700">Outflow at Node D (units/hr)</label>
            <input 
              type="number" 
              value={outflowD}
              onChange={(e) => setOutflowD(Number(e.target.value))}
              className="border p-2 rounded-md text-sm text-black"
            />
          </div>

          <button 
            onClick={handleOptimize}
            className="w-full bg-black text-white px-4 py-3 rounded-md hover:bg-zinc-800 transition-all font-medium shadow-sm mt-4"
          >
            Run Math Engine
          </button>

          <div className="mt-4 p-4 bg-zinc-100 rounded-md border text-sm text-zinc-700">
            <strong>Status:</strong> <br/> {status}
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
          fitView
        >
          <Background color="#ccc" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}