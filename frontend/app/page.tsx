"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactFlow, { Background, Controls, addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

const defaultNodeStyle = 'bg-white border-2 border-slate-200 rounded-full shadow-sm text-slate-700 font-bold px-5 py-2.5 text-[11px] uppercase tracking-wider transition-all hover:shadow-md hover:border-blue-400';
const inflowNodeStyle = 'bg-slate-900 border-2 border-emerald-400 rounded-full shadow-md text-emerald-50 font-bold px-5 py-2.5 text-[11px] uppercase tracking-wider ring-4 ring-emerald-400/20';
const outflowNodeStyle = 'bg-slate-900 border-2 border-rose-400 rounded-full shadow-md text-rose-50 font-bold px-5 py-2.5 text-[11px] uppercase tracking-wider ring-4 ring-rose-400/20';

const customInitialNodes: Node[] = [
  { id: 'A', position: { x: 150, y: 100 }, data: { label: 'Node A (Inflow)' }, className: inflowNodeStyle },
  { id: 'B', position: { x: 450, y: 100 }, data: { label: 'Node B' }, className: defaultNodeStyle },
  { id: 'C', position: { x: 150, y: 300 }, data: { label: 'Node C' }, className: defaultNodeStyle },
  { id: 'D', position: { x: 450, y: 300 }, data: { label: 'Node D (Outflow)' }, className: outflowNodeStyle },
];

const customInitialEdges: Edge[] = [
  { id: 'eA-B', source: 'A', target: 'B', animated: true, data: { blocked: false }, label: '---', style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'eA-C', source: 'A', target: 'C', animated: true, data: { blocked: false }, label: '---', style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'eB-D', source: 'B', target: 'D', animated: true, data: { blocked: false }, label: '---', style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'eC-D', source: 'C', target: 'D', animated: true, data: { blocked: false }, label: '---', style: { stroke: '#94a3b8', strokeWidth: 2 } },
];

export default function TrafficDashboard() {
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>(customInitialNodes);
  const [edges, setEdges] = useState<Edge[]>(customInitialEdges);
  const [status, setStatus] = useState("System Standby");
  
  // DYNAMIC OD MATRIX STATE
  const [inflowVolumes, setInflowVolumes] = useState<Record<string, string | number>>({ 'A': 1000 });
  const [outflowVolumes, setOutflowVolumes] = useState<Record<string, string | number>>({ 'D': 1000 });
  
  const [capacityThreshold, setCapacityThreshold] = useState(80);
  const [isLocked, setIsLocked] = useState(false);
  const [activePresetName, setActivePresetName] = useState("Custom Network");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [metrics, setMetrics] = useState({ totalFlow: 0, maxFlow: 0, bottleneckCount: 0 });

  // CALCULATE LIVE TOTALS
  const totalInflow = Object.values(inflowVolumes).reduce((sum, val) => sum + (Number(val) || 0), 0) as number;
  const totalOutflow = Object.values(outflowVolumes).reduce((sum, val) => sum + (Number(val) || 0), 0) as number;
  const isBalanced = totalInflow === totalOutflow && totalInflow > 0;

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  
  const onConnect = useCallback((params: Connection) => {
    const newEdge = { ...params, id: `e${params.source}-${params.target}`, animated: true, data: { blocked: false }, label: '---', style: { stroke: '#94a3b8', strokeWidth: 2 } };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setEdges((eds) => eds.map((e) => {
      if (e.id === edge.id) {
        const isBlocked = !e.data?.blocked;
        return {
          ...e,
          data: { ...e.data, blocked: isBlocked },
          label: isBlocked ? 'BLOCKED 🚧' : '---',
          animated: !isBlocked,
          labelStyle: isBlocked ? { fill: '#ef4444', fontWeight: 700 } : { fill: '#334155', fontWeight: 600 },
          style: isBlocked 
            ? { stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '5,5', opacity: 0.5 }
            : { stroke: '#94a3b8', strokeWidth: 2 }
        };
      }
      return e;
    }));
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
    
    let n: Node[] = [];
    let e: Edge[] = [];

    if (presetId === 'cp') {
      setActivePresetName("Connaught Place (Locked)");
      setIsLocked(true);
      n = [
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
      ];
      e = [
        { id: 'e-in-nw', source: 'cp-in', target: 'cp-oc-nw', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-nw-sw', source: 'cp-oc-nw', target: 'cp-oc-sw', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-sw-out', source: 'cp-oc-sw', target: 'cp-out', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-out-se', source: 'cp-out', target: 'cp-oc-se', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-se-ne', source: 'cp-oc-se', target: 'cp-oc-ne', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-ne-in', source: 'cp-oc-ne', target: 'cp-in', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-ic-n-e', source: 'cp-ic-n', target: 'cp-ic-e', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-ic-e-s', source: 'cp-ic-e', target: 'cp-ic-s', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-ic-s-w', source: 'cp-ic-s', target: 'cp-ic-w', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-ic-w-n', source: 'cp-ic-w', target: 'cp-ic-n', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-r-in', source: 'cp-in', target: 'cp-ic-n', animated: true, data: { blocked: false }, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-r-ne', source: 'cp-oc-ne', target: 'cp-ic-e', animated: true, data: { blocked: false }, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-r-out', source: 'cp-ic-s', target: 'cp-out', animated: true, data: { blocked: false }, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-r-sw', source: 'cp-oc-sw', target: 'cp-ic-w', animated: true, data: { blocked: false }, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-r-nw', source: 'cp-ic-w', target: 'cp-oc-nw', animated: true, data: { blocked: false }, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-r-se', source: 'cp-ic-e', target: 'cp-oc-se', animated: true, data: { blocked: false }, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-c-n', source: 'cp-ic-n', target: 'cp-center', animated: true, data: { blocked: false }, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-c-s', source: 'cp-center', target: 'cp-ic-s', animated: true, data: { blocked: false }, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-c-w', source: 'cp-ic-w', target: 'cp-center', animated: true, data: { blocked: false }, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-c-e', source: 'cp-center', target: 'cp-ic-e', animated: true, data: { blocked: false }, style: { stroke: '#94a3b8', strokeWidth: 2 } },
      ];
    } 
    else if (presetId === 'du-north') {
      setActivePresetName("DU North Campus (Locked)");
      setIsLocked(true);
      n = [
        { id: 'du-metro', position: { x: 500, y: 50 }, data: { label: 'Vishwavidyalaya Metro (In)' }, className: inflowNodeStyle, draggable: false, selectable: false },
        { id: 'du-khalsa', position: { x: 300, y: 150 }, data: { label: 'GTB Rd / SGTB Khalsa' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'du-arts', position: { x: 700, y: 150 }, data: { label: 'Chatra Marg / Arts Faculty' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'du-patel', position: { x: 200, y: 300 }, data: { label: 'Patel Chest / SRCC' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'du-stephens', position: { x: 600, y: 300 }, data: { label: 'St. Stephen\'s / Hindu' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'du-cic', position: { x: 900, y: 300 }, data: { label: 'Cluster Innovation Centre' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'du-ramjas', position: { x: 400, y: 450 }, data: { label: 'Sudhir Bose Marg / Ramjas' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'du-kamla', position: { x: 800, y: 450 }, data: { label: 'Bungalow Rd / Kamla Nagar' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'du-malka', position: { x: 500, y: 600 }, data: { label: 'Malka Ganj Chowk (Out)' }, className: outflowNodeStyle, draggable: false, selectable: false },
      ];
      e = [
        { id: 'e-m-k', source: 'du-metro', target: 'du-khalsa', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-m-a', source: 'du-metro', target: 'du-arts', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-k-a', source: 'du-khalsa', target: 'du-arts', animated: true, data: { blocked: false }, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-k-p', source: 'du-khalsa', target: 'du-patel', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-a-s', source: 'du-arts', target: 'du-stephens', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-a-c', source: 'du-arts', target: 'du-cic', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-p-r', source: 'du-patel', target: 'du-ramjas', animated: true, data: { blocked: false }, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-p-m', source: 'du-patel', target: 'du-malka', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-s-r', source: 'du-stephens', target: 'du-ramjas', animated: true, data: { blocked: false }, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-s-k', source: 'du-stephens', target: 'du-kamla', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-c-k', source: 'du-cic', target: 'du-kamla', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-r-m', source: 'du-ramjas', target: 'du-malka', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-k-m', source: 'du-kamla', target: 'du-malka', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
      ];
    }
    else if (presetId === 'igi-connector') {
      setActivePresetName("IGI Airport Connector (Locked)");
      setIsLocked(true);
      n = [
        { id: 'igi-dk', position: { x: 800, y: 100 }, data: { label: 'Dhaula Kuan (In)' }, className: inflowNodeStyle, draggable: false, selectable: false },
        { id: 'igi-nh8', position: { x: 800, y: 600 }, data: { label: 'NH-48 Gurgaon (In)' }, className: inflowNodeStyle, draggable: false, selectable: false },
        { id: 'igi-vk', position: { x: 500, y: 700 }, data: { label: 'Vasant Kunj (In)' }, className: inflowNodeStyle, draggable: false, selectable: false },
        { id: 'igi-rtr', position: { x: 500, y: 150 }, data: { label: 'RTR Flyover' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'igi-mahipalpur', position: { x: 500, y: 450 }, data: { label: 'Mahipalpur Junction' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'igi-tunnel', position: { x: 300, y: 250 }, data: { label: 'Airport Express Tunnel' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'igi-aerocity', position: { x: 300, y: 450 }, data: { label: 'Aerocity Hub' }, className: defaultNodeStyle, draggable: false, selectable: false },
        { id: 'igi-t1', position: { x: 50, y: 150 }, data: { label: 'Terminal 1 (Out)' }, className: outflowNodeStyle, draggable: false, selectable: false },
        { id: 'igi-t3', position: { x: 50, y: 450 }, data: { label: 'Terminal 3 (Out)' }, className: outflowNodeStyle, draggable: false, selectable: false },
      ];
      e = [
        { id: 'e-dk-rtr', source: 'igi-dk', target: 'igi-rtr', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-dk-mahi', source: 'igi-dk', target: 'igi-mahipalpur', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-nh8-mahi', source: 'igi-nh8', target: 'igi-mahipalpur', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-vk-mahi', source: 'igi-vk', target: 'igi-mahipalpur', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-rtr-tunnel', source: 'igi-rtr', target: 'igi-tunnel', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-rtr-t1', source: 'igi-rtr', target: 'igi-t1', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-mahi-aero', source: 'igi-mahipalpur', target: 'igi-aerocity', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-tunnel-t3', source: 'igi-tunnel', target: 'igi-t3', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-aero-t3', source: 'igi-aerocity', target: 'igi-t3', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e-aero-t1', source: 'igi-aerocity', target: 'igi-t1', animated: true, data: { blocked: false }, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
      ];
    }
    else {
      setActivePresetName("Custom Network");
      setIsLocked(false);
      n = customInitialNodes.map(node => ({ ...node, draggable: true, selectable: true }));
      e = customInitialEdges;
    }

    setNodes(n);
    setEdges(e);

    // AUTO-DISTRIBUTE EXACTLY 1000 UNITS ACROSS ACTIVE NODES
    const initialIn: Record<string, number> = {};
    const initialOut: Record<string, number> = {};
    const ins = n.filter(node => node.className === inflowNodeStyle);
    const outs = n.filter(node => node.className === outflowNodeStyle);
    
    let inSum = 0;
    ins.forEach((node, i) => {
      if (i === ins.length - 1) initialIn[node.id] = 1000 - inSum;
      else {
        const val = Math.floor(1000 / ins.length);
        initialIn[node.id] = val;
        inSum += val;
      }
    });

    let outSum = 0;
    outs.forEach((node, i) => {
      if (i === outs.length - 1) initialOut[node.id] = 1000 - outSum;
      else {
        const val = Math.floor(1000 / outs.length);
        initialOut[node.id] = val;
        outSum += val;
      }
    });

    setInflowVolumes(initialIn);
    setOutflowVolumes(initialOut);
  };

  const handleOptimize = async () => {
    const activeEdges = edges.filter(e => !e.data?.blocked);
    if (activeEdges.length === 0) return setStatus("Error: No active roads available");
    
    // BUILD THE DYNAMIC BOUNDARY VECTOR (b)
    const inflows = Array(nodes.length).fill(0);
    for (let i = 0; i < nodes.length; i++) {
      const nodeId = nodes[i].id;
      if (inflowVolumes[nodeId] !== undefined) {
        inflows[i] = Number(inflowVolumes[nodeId]) || 0;
      }
      if (outflowVolumes[nodeId] !== undefined) {
        inflows[i] = -(Number(outflowVolumes[nodeId]) || 0); // Outflow mathematically requires negative sign
      }
    }

    // PRE-FLIGHT TOPOLOGY CHECK
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const isBoundaryInflow = inflows[i] > 0;
      const isBoundaryOutflow = inflows[i] < 0;
      
      const hasIncoming = activeEdges.some(e => e.target === node.id);
      const hasOutgoing = activeEdges.some(e => e.source === node.id);

      if (!isBoundaryOutflow && hasIncoming && !hasOutgoing) {
        setStatus(`Warning: Traffic trapped at ${node.data.label}! Need outflow path.`);
        return;
      }
      if (!isBoundaryInflow && hasOutgoing && !hasIncoming) {
        setStatus(`Warning: Vacuum at ${node.data.label}! Needs inflow path.`);
        return;
      }
      if (isBoundaryInflow && !hasOutgoing) {
        setStatus(`Warning: Inflow completely blocked at ${node.data.label}!`);
        return;
      }
    }

    setStatus("Computing Matrix...");

    const matrix: number[][] = Array(nodes.length).fill(0).map(() => Array(activeEdges.length).fill(0));
    
    activeEdges.forEach((edge, edgeIndex) => {
      const sourceIndex = nodes.findIndex(n => n.id === edge.source);
      const targetIndex = nodes.findIndex(n => n.id === edge.target);
      if (sourceIndex !== -1) matrix[sourceIndex][edgeIndex] = 1;
      if (targetIndex !== -1) matrix[targetIndex][edgeIndex] = -1;
    });

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
        let activeIdx = 0;
        
        const updatedEdges = edges.map((edge) => {
          if (edge.data?.blocked) {
            return {
              ...edge,
              label: 'BLOCKED 🚧',
              animated: false,
              labelStyle: { fill: '#ef4444', fontWeight: 700 },
              labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
              style: { stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '5,5', opacity: 0.5 }
            };
          }

          const flow = Math.abs(data.optimized_flows[activeIdx] || 0); 
          activeIdx++;

          const isBottleneck = flow >= capacityThreshold;
          total += flow;
          if (flow > max) max = flow;
          if (isBottleneck) bCount++;

          const animDuration = Math.max(0.3, 3 - (flow / capacityThreshold) * 2.5);
          let edgeColor = '#cbd5e1'; 
          if (isBottleneck) edgeColor = '#ef4444'; 
          else if (flow > 0) edgeColor = '#3b82f6'; 

          return {
            ...edge,
            label: `${flow} units/hr`,
            animated: flow > 0,
            labelStyle: { fill: '#334155', fontWeight: 700 },
            labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
            style: { 
              stroke: edgeColor,
              strokeWidth: isBottleneck ? 4 : (flow > 0 ? 3 : 2),
              animationDuration: `${animDuration}s` 
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
          edgeLabels: activeEdges.map(e => `${getNodeLabel(e.source)} → ${getNodeLabel(e.target)}`),
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
      
      <div className="w-[340px] bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              FlowOptimizer
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">Math Engine Dashboard</p>
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col gap-5 overflow-y-auto">
          
          <div className="bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 flex items-center justify-between">
             <span className="text-xs font-semibold text-slate-500 uppercase">Topology</span>
             <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]" title={activePresetName}>{activePresetName}</span>
          </div>

          {/* DYNAMIC OD MATRIX INPUTS */}
          <div className="flex flex-col gap-3">
            
            {/* Inflows */}
            {Object.keys(inflowVolumes).length > 0 && (
              <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-100/50">
                <h3 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Origin Entries (Inflow)
                </h3>
                <div className="space-y-2">
                  {Object.keys(inflowVolumes).map(nodeId => {
                    const label = nodes.find(n => n.id === nodeId)?.data.label || nodeId;
                    return (
                      <div key={nodeId} className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-emerald-900 font-medium truncate w-40" title={label}>{label}</span>
                        <input 
                          type="number" 
                          value={inflowVolumes[nodeId]} 
                          onChange={(e) => setInflowVolumes({...inflowVolumes, [nodeId]: e.target.value === '' ? '' : Number(e.target.value)})} 
                          className="w-20 bg-white border border-emerald-200 px-2 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 text-right font-mono" 
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Outflows */}
            {Object.keys(outflowVolumes).length > 0 && (
              <div className="bg-rose-50/40 p-3 rounded-lg border border-rose-100/50">
                <h3 className="text-[10px] font-bold text-rose-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Destination Exits (Outflow)
                </h3>
                <div className="space-y-2">
                  {Object.keys(outflowVolumes).map(nodeId => {
                    const label = nodes.find(n => n.id === nodeId)?.data.label || nodeId;
                    return (
                      <div key={nodeId} className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-rose-900 font-medium truncate w-40" title={label}>{label}</span>
                        <input 
                          type="number" 
                          value={outflowVolumes[nodeId]} 
                          onChange={(e) => setOutflowVolumes({...outflowVolumes, [nodeId]: e.target.value === '' ? '' : Number(e.target.value)})} 
                          className="w-20 bg-white border border-rose-200 px-2 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800 text-right font-mono" 
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Live Balance Tracker */}
            <div className={`p-3 rounded-lg border shadow-sm transition-colors ${isBalanced ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wide mb-1">
                <span className={isBalanced ? 'text-blue-800' : 'text-red-800'}>Mass Conservation</span>
                <span className={isBalanced ? 'text-blue-600' : 'text-red-600'}>
                  {isBalanced ? 'BALANCED ✓' : 'MISMATCH ✕'}
                </span>
              </div>
              <div className="flex justify-between text-xs font-mono font-medium text-slate-700">
                <span>IN: {totalInflow}</span>
                <span>OUT: {totalOutflow}</span>
              </div>
            </div>

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

          {/* Engine Button locks mathematically if mass is not conserved */}
          <button 
            onClick={handleOptimize} 
            disabled={!isBalanced}
            className={`w-full px-4 py-3 rounded-md transition-all font-bold text-sm shadow-sm mt-1 ${isBalanced ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {isBalanced ? 'Run Math Engine' : 'Engine Locked (Unbalanced)'}
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
            <span className={status.includes('Error') || status.includes('Warning') ? 'text-red-600' : 'text-blue-600'}>{status}</span>
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
          onEdgeClick={onEdgeClick}
          nodesDraggable={!isLocked}
          nodesConnectable={!isLocked}
          elementsSelectable={true}
          fitView
          className="bg-slate-50 cursor-pointer"
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