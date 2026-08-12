"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactFlow, { Background, Controls, addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

const defaultNodeStyle = 'bg-white border-2 border-slate-200 rounded-lg shadow-sm text-slate-700 font-semibold px-4 py-2 text-sm';
const inflowNodeStyle = 'bg-blue-50 border-2 border-blue-400 rounded-lg shadow-sm text-blue-900 font-semibold px-4 py-2 text-sm';
const outflowNodeStyle = 'bg-indigo-50 border-2 border-indigo-400 rounded-lg shadow-sm text-indigo-900 font-semibold px-4 py-2 text-sm';

const customInitialNodes: Node[] = [
  { id: 'A', position: { x: 150, y: 100 }, data: { label: 'Node A (Inflow)' }, className: inflowNodeStyle },
  { id: 'B', position: { x: 450, y: 100 }, data: { label: 'Node B' }, className: defaultNodeStyle },
  { id: 'C', position: { x: 150, y: 300 }, data: { label: 'Node C' }, className: defaultNodeStyle },
  { id: 'D', position: { x: 450, y: 300 }, data: { label: 'Node D (Outflow)' }, className: outflowNodeStyle },
];

const customInitialEdges: Edge[] = [
  { id: 'eA-B', source: 'A', target: 'B', animated: true, label: '---', style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'eA-C', source: 'A', target: 'C', animated: true, label: '---', style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'eB-D', source: 'B', target: 'D', animated: true, label: '---', style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'eC-D', source: 'C', target: 'D', animated: true, label: '---', style: { stroke: '#94a3b8', strokeWidth: 2 } },
];

export default function TrafficDashboard() {
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>(customInitialNodes);
  const [edges, setEdges] = useState<Edge[]>(customInitialEdges);
  const [status, setStatus] = useState("System Standby");
  const [inflowA, setInflowA] = useState(100);
  const [outflowD, setOutflowD] = useState(100);
  const [capacityThreshold, setCapacityThreshold] = useState(80);
  
  const [isLocked, setIsLocked] = useState(false);
  const [activePresetName, setActivePresetName] = useState("Custom Network");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [metrics, setMetrics] = useState({ totalFlow: 0, maxFlow: 0, bottleneckCount: 0 });

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  
  const onConnect = useCallback((params: Connection) => {
    const newEdge = { ...params, id: `e${params.source}-${params.target}`, animated: true, label: '---', style: { stroke: '#94a3b8', strokeWidth: 2 } };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  useEffect(() => {
    const pendingPreset = sessionStorage.getItem('pendingPreset');
    if (pendingPreset) {
      loadPreset(pendingPreset);
      sessionStorage.removeItem('pendingPreset');
    }
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

  const loadPreset = (presetId: string) => {
    setShowAnalysis(false);

    if (presetId === 'cp') {
      setActivePresetName("Connaught Place (Locked)");
      setIsLocked(true);
      setNodes([
        { id: 'cp-in', position: { x: 500, y: 50 }, data: { label: 'Minto Rd (In)' }, className: inflowNodeStyle, draggable: false, selectable: false },
        { id: 'cp-oc-ne', position: { x: 800, y: 200 }, data: { label: 'Barakhamba Rd' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'cp-oc-se', position: { x: 800, y: 500 }, data: { label: 'K.G. Marg' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'cp-out', position: { x: 500, y: 650 }, data: { label: 'Janpath (Out)' }, className: outflowNodeStyle, draggable: false, selectable: false },
        { id: 'cp-oc-sw', position: { x: 200, y: 500 }, data: { label: 'Sansad Marg' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'cp-oc-nw', position: { x: 200, y: 200 }, data: { label: 'Panchkuian Rd' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'cp-ic-n', position: { x: 500, y: 200 }, data: { label: 'Inner Circle (N)' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'cp-ic-e', position: { x: 650, y: 350 }, data: { label: 'Inner Circle (E)' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'cp-ic-s', position: { x: 500, y: 500 }, data: { label: 'Inner Circle (S)' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'cp-ic-w', position: { x: 350, y: 350 }, data: { label: 'Inner Circle (W)' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'cp-center', position: { x: 500, y: 350 }, data: { label: 'Rajiv Chowk Station' }, className: defaultNodeStyle, draggable: false, selectable: false },
      ]);
      setEdges([
        { id: 'e-in-nw', source: 'cp-in', target: 'cp-oc-nw', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-nw-sw', source: 'cp-oc-nw', target: 'cp-oc-sw', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-sw-out', source: 'cp-oc-sw', target: 'cp-out', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-out-se', source: 'cp-out', target: 'cp-oc-se', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-se-ne', source: 'cp-oc-se', target: 'cp-oc-ne', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-ne-in', source: 'cp-oc-ne', target: 'cp-in', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-ic-n-e', source: 'cp-ic-n', target: 'cp-ic-e', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-ic-e-s', source: 'cp-ic-e', target: 'cp-ic-s', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-ic-s-w', source: 'cp-ic-s', target: 'cp-ic-w', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-ic-w-n', source: 'cp-ic-w', target: 'cp-ic-n', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-r-in', source: 'cp-in', target: 'cp-ic-n', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-r-ne', source: 'cp-oc-ne', target: 'cp-ic-e', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-r-out', source: 'cp-ic-s', target: 'cp-out', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-r-sw', source: 'cp-oc-sw', target: 'cp-ic-w', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-r-nw', source: 'cp-ic-w', target: 'cp-oc-nw', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-r-se', source: 'cp-ic-e', target: 'cp-oc-se', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-c-n', source: 'cp-ic-n', target: 'cp-center', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-c-s', source: 'cp-center', target: 'cp-ic-s', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-c-w', source: 'cp-ic-w', target: 'cp-center', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-c-e', source: 'cp-center', target: 'cp-ic-e', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
      ]);
    } 
    else if (presetId === 'du-north') {
      setActivePresetName("DU North Campus (Locked)");
      setIsLocked(true);
      setNodes([
        { id: 'du-metro', position: { x: 500, y: 50 }, data: { label: 'Vishwavidyalaya Metro (In)' }, className: inflowNodeStyle, draggable: false, selectable: false },
        { id: 'du-khalsa', position: { x: 300, y: 150 }, data: { label: 'GTB Rd / SGTB Khalsa' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'du-arts', position: { x: 700, y: 150 }, data: { label: 'Chatra Marg / Arts Faculty' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'du-patel', position: { x: 200, y: 300 }, data: { label: 'Patel Chest / SRCC' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'du-stephens', position: { x: 600, y: 300 }, data: { label: 'St. Stephen\'s / Hindu' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'du-cic', position: { x: 900, y: 300 }, data: { label: 'Cluster Innovation Centre' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'du-ramjas', position: { x: 400, y: 450 }, data: { label: 'Sudhir Bose Marg / Ramjas' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'du-kamla', position: { x: 800, y: 450 }, data: { label: 'Bungalow Rd / Kamla Nagar' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'du-malka', position: { x: 500, y: 600 }, data: { label: 'Malka Ganj Chowk (Out)' }, className: outflowNodeStyle, draggable: false, selectable: false },
      ]);
      setEdges([
        { id: 'e-m-k', source: 'du-metro', target: 'du-khalsa', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-m-a', source: 'du-metro', target: 'du-arts', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-k-a', source: 'du-khalsa', target: 'du-arts', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-k-p', source: 'du-khalsa', target: 'du-patel', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-a-s', source: 'du-arts', target: 'du-stephens', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-a-c', source: 'du-arts', target: 'du-cic', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-p-r', source: 'du-patel', target: 'du-ramjas', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-p-m', source: 'du-patel', target: 'du-malka', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-s-r', source: 'du-stephens', target: 'du-ramjas', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-s-k', source: 'du-stephens', target: 'du-kamla', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-c-k', source: 'du-cic', target: 'du-kamla', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-r-m', source: 'du-ramjas', target: 'du-malka', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-k-m', source: 'du-kamla', target: 'du-malka', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
      ]);
    }
    else if (presetId === 'igi-connector') {
      setActivePresetName("IGI Airport Connector (Locked)");
      setIsLocked(true);
      setNodes([
        { id: 'igi-dk', position: { x: 800, y: 100 }, data: { label: 'Dhaula Kuan (In)' }, className: inflowNodeStyle, draggable: false, selectable: false },
        { id: 'igi-nh8', position: { x: 800, y: 600 }, data: { label: 'NH-48 Gurgaon (In)' }, className: inflowNodeStyle, draggable: false, selectable: false },
        { id: 'igi-vk', position: { x: 500, y: 700 }, data: { label: 'Vasant Kunj (In)' }, className: inflowNodeStyle, draggable: false, selectable: false },
        { id: 'igi-rtr', position: { x: 500, y: 150 }, data: { label: 'RTR Flyover' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'igi-mahipalpur', position: { x: 500, y: 450 }, data: { label: 'Mahipalpur Junction' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'igi-tunnel', position: { x: 300, y: 250 }, data: { label: 'Airport Express Tunnel' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'igi-aerocity', position: { x: 300, y: 450 }, data: { label: 'Aerocity Hub' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'igi-t1', position: { x: 50, y: 150 }, data: { label: 'Terminal 1 (Out)' }, className: outflowNodeStyle, draggable: false, selectable: false },
        { id: 'igi-t3', position: { x: 50, y: 450 }, data: { label: 'Terminal 3 (Out)' }, className: outflowNodeStyle, draggable: false, selectable: false },
      ]);
      setEdges([
        { id: 'e-dk-rtr', source: 'igi-dk', target: 'igi-rtr', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-dk-mahi', source: 'igi-dk', target: 'igi-mahipalpur', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-nh8-mahi', source: 'igi-nh8', target: 'igi-mahipalpur', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-vk-mahi', source: 'igi-vk', target: 'igi-mahipalpur', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-rtr-tunnel', source: 'igi-rtr', target: 'igi-tunnel', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-rtr-t1', source: 'igi-rtr', target: 'igi-t1', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-mahi-aero', source: 'igi-mahipalpur', target: 'igi-aerocity', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-tunnel-t3', source: 'igi-tunnel', target: 'igi-t3', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-aero-t3', source: 'igi-aerocity', target: 'igi-t3', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-aero-t1', source: 'igi-aerocity', target: 'igi-t1', animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
      ]);
    }
    else {
      setActivePresetName("Custom Network");
      setIsLocked(false);
      const unlockedNodes = customInitialNodes.map(node => ({ ...node, draggable: true, selectable: true }));
      setNodes(unlockedNodes);
      setEdges(customInitialEdges);
    }
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
    
    if (activePresetName.includes("Connaught Place")) {
      const inNode = nodes.findIndex(n => n.id === 'cp-in');
      const outNode = nodes.findIndex(n => n.id === 'cp-out');
      if (inNode !== -1) inflows[inNode] = inflowA;
      if (outNode !== -1) inflows[outNode] = -outflowD;
    } else if (activePresetName.includes("DU North Campus")) {
      const inNode = nodes.findIndex(n => n.id === 'du-metro');
      const outNode = nodes.findIndex(n => n.id === 'du-malka');
      if (inNode !== -1) inflows[inNode] = inflowA;
      if (outNode !== -1) inflows[outNode] = -outflowD;
    } else if (activePresetName.includes("IGI Airport Connector")) {
      const inNodes = ['igi-dk', 'igi-nh8', 'igi-vk'];
      const outNodes = ['igi-t1', 'igi-t3'];
      
      inNodes.forEach(id => {
        const idx = nodes.findIndex(n => n.id === id);
        if (idx !== -1) inflows[idx] = inflowA / inNodes.length; 
      });
      outNodes.forEach(id => {
        const idx = nodes.findIndex(n => n.id === id);
        if (idx !== -1) inflows[idx] = -outflowD / outNodes.length;
      });
    } else {
      inflows[0] = inflowA;
      inflows[nodes.length - 1] = -outflowD;
    }

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
        
        const getNodeLabel = (id: string) => nodes.find(n => n.id === id)?.data.label || id;

        sessionStorage.setItem('liveMathData', JSON.stringify({
          matrix: matrix,
          bVector: inflows,
          xVector: data.optimized_flows,
          nodeLabels: nodes.map(n => n.data.label),
          edgeLabels: edges.map(e => `${getNodeLabel(e.source)} → ${getNodeLabel(e.target)}`),
          nodes: nodes,
          edges: updatedEdges 
        }));
      }
    } catch (error) {
      setStatus("Error: Connection Failed");
    }
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
          
          <div className="bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 flex items-center justify-between">
             <span className="text-xs font-semibold text-slate-500 uppercase">Topology</span>
             <span className="text-xs font-bold text-slate-800">{activePresetName}</span>
          </div>

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
              Network Library
            </h3>
            <Link 
              href="/presets"
              className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white font-medium text-sm py-2.5 px-4 rounded-md hover:bg-slate-900 transition-colors shadow-sm"
            >
              Browse Topologies &rarr;
            </Link>
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
            <Link 
              href="/the-math"
              className="w-full block text-center bg-slate-800 text-white font-medium text-sm py-2.5 px-4 rounded-md hover:bg-slate-900 transition-colors shadow-sm"
            >
              View Live Math Breakdown &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}