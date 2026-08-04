"use client";

import React, { useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

// Initial Traffic Intersections (Nodes)
const initialNodes: Node[] = [
  { id: 'A', position: { x: 100, y: 100 }, data: { label: 'Intersection A (Inflow)' }, style: { border: '2px solid #22c55e', padding: 10 } },
  { id: 'B', position: { x: 400, y: 100 }, data: { label: 'Intersection B' }, style: { border: '1px solid #333', padding: 10 } },
  { id: 'C', position: { x: 100, y: 300 }, data: { label: 'Intersection C' }, style: { border: '1px solid #333', padding: 10 } },
  { id: 'D', position: { x: 400, y: 300 }, data: { label: 'Intersection D (Outflow)' }, style: { border: '2px solid #ef4444', padding: 10 } },
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

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const handleOptimize = async () => {
    setStatus("Calculating route optimization...");
    try {
      const response = await fetch('http://127.0.0.1:8000/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Dummy incidence matrix and inflows for initial testing
          incidence_matrix: [[1, 1, 0, 0], [0, -1, 1, 0], [-1, 0, 0, 1], [0, 0, -1, -1]],
          external_inflows: [100, 0, 0, -100]
        })
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        setStatus(`Optimization Complete! Bottlenecks: ${data.bottlenecks_detected ? "Yes" : "No"}`);
        // Update edge labels with real optimized flows from FastAPI
        setEdges((eds) => eds.map((edge, index) => ({
          ...edge,
          label: `${data.optimized_flows[index]} units/hr`,
          style: { stroke: data.optimized_flows[index] > 80 ? '#ef4444' : '#22c55e', strokeWidth: 2 }
        })));
      }
    } catch (error) {
      console.error("Backend connection failed:", error);
      setStatus("Error: Cannot reach FastAPI backend.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-50 font-sans">
      <header className="p-6 bg-white shadow-sm border-b flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Traffic Flow Optimizer</h1>
          <p className="text-zinc-500 text-sm">{status}</p>
        </div>
        <button 
          onClick={handleOptimize}
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-zinc-800 transition-all font-medium shadow-sm"
        >
          Run Math Engine
        </button>
      </header>
      
      <div className="flex-1 w-full relative">
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