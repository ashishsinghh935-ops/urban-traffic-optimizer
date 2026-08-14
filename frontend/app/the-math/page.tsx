"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ReactFlow, { Background } from 'reactflow';
import 'reactflow/dist/style.css';

interface MathState {
  matrix: number[][];
  bVector: number[];
  xVector: number[];
  nodeLabels: string[];
  edgeLabels: string[];
  nodes: any[];
  edges: any[];
}

export default function TheMath() {
  const [data, setData] = useState<MathState | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('liveMathData');
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "URBAN TRAFFIC OPTIMIZER - SYSTEM EXPORT\n\n";

    csvContent += "AUGMENTED MATRIX [ A | b ]\n";
    const headers = ["Intersection", ...data.edgeLabels, "Boundary (b)"];
    csvContent += headers.map(h => `"${h}"`).join(",") + "\n";
    
    data.matrix.forEach((row, idx) => {
      const rowData = [
        `"${data.nodeLabels[idx]}"`,
        ...row,
        data.bVector[idx]
      ];
      csvContent += rowData.join(",") + "\n";
    });
    
    csvContent += "\n";
    
    csvContent += "OPTIMIZED FLOW VECTOR (x)\n";
    csvContent += "Edge,Calculated Flow Units\n";
    data.xVector.forEach((val, idx) => {
      csvContent += `"${data.edgeLabels[idx]}",${Math.abs(Math.round(val))}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "network_matrix_export.csv");
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">No Network Data Found</h1>
        <p className="text-slate-600 mb-6">You need to run the Math Engine on the dashboard first so we have data to analyze!</p>
        <Link href="/" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-8 md:p-16">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-800 text-white">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Step-by-Step Matrix Analysis</h1>
            <div className="flex gap-3">
              <button 
                onClick={handleExportCSV}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                Download .CSV 
              </button>
              <Link href="/" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors shadow-sm">
                &larr; Back to Dashboard
              </Link>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
            This tool computes urban traffic as a vector space. By translating physical intersections into a unified system of linear equations ($Ax = b$), we mathematically enforce mass conservation to determine the optimal flow configuration.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-16">
          
          {/* Step 0: Mini Map */}
          <section>
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-2">
              <span className="bg-slate-800 text-white font-bold h-8 w-8 flex items-center justify-center rounded-full text-sm">0</span>
              <h2 className="text-xl font-bold text-slate-900">Your Network Topography</h2>
            </div>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              This is the visual graph. To a computer, this is merely a collection of topological nodes and directed edges. The first step is translating this geometry into algebraic matrices.
            </p>
            <div className="h-72 w-full border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative shadow-inner">
              <ReactFlow 
                nodes={data.nodes} 
                edges={data.edges} 
                fitView 
                nodesDraggable={false} 
                nodesConnectable={false} 
                elementsSelectable={false}
              >
                <Background color="#cbd5e1" gap={20} size={1} />
              </ReactFlow>
            </div>
          </section>

          {/* Step 1: Incidence Matrix */}
          <section>
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-2">
              <span className="bg-blue-600 text-white font-bold h-8 w-8 flex items-center justify-center rounded-full text-sm">1</span>
              <h2 className="text-xl font-bold text-slate-900">Extracting the Incidence Matrix (A)</h2>
            </div>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              The graph is flattened into an <strong>Incidence Matrix (A)</strong>. Rows represent intersections; columns represent roads. This captures pure directional connectivity independently of traffic volume.
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <li><strong className="text-blue-600">1</strong>: Vector originates here (traffic leaves the node).</li>
              <li><strong className="text-rose-600">-1</strong>: Vector terminates here (traffic enters the node).</li>
              <li><strong className="text-slate-400">0</strong>: No structural connection exists.</li>
            </ul>
            
            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
              <table className="w-full text-xs text-center border-collapse bg-white whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3 border-r border-slate-200 text-left sticky left-0 bg-slate-50 z-10">Intersections \ Roads</th>
                    {data.edgeLabels.map((label, idx) => {
                      const parts = label ? label.split(' → ') : ['Unknown', 'Unknown'];
                      return (
                        <th key={idx} className="p-3 min-w-[120px] border-r border-slate-200">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-slate-400 uppercase">From:</span>
                            <span className="truncate max-w-[100px]" title={parts[0]}>{parts[0]}</span>
                            <span className="text-[10px] text-slate-400 uppercase mt-1">To:</span>
                            <span className="truncate max-w-[100px]" title={parts[1]}>{parts[1]}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {data.matrix.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="p-3 border-r border-slate-200 font-bold text-slate-700 text-left sticky left-0 bg-white z-10">
                        {data.nodeLabels[rIdx]}
                      </td>
                      {row.map((val, cIdx) => (
                        <td key={cIdx} className={`p-3 border-r border-slate-100 font-mono text-sm ${val === 1 ? 'text-blue-600 bg-blue-50/30 font-bold' : val === -1 ? 'text-rose-600 bg-rose-50/30 font-bold' : 'text-slate-300'}`}>
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Step 2: Formulating the Augmented Matrix */}
          <section>
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-2">
              <span className="bg-indigo-600 text-white font-bold h-8 w-8 flex items-center justify-center rounded-full text-sm">2</span>
              <h2 className="text-xl font-bold text-slate-900">Formulating the Augmented Matrix [ A | b ]</h2>
            </div>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              We now append the <strong>Unified Boundary Vector (b)</strong>. This mathematically enforces the physical laws of mass conservation across the grid. Every node is assigned a net boundary value constraint:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <li><strong className="text-emerald-600">+v (Source)</strong>: The intersection is generating net new traffic.</li>
              <li><strong className="text-rose-600">-v (Sink)</strong>: The intersection is absorbing net traffic.</li>
              <li><strong className="text-slate-500">0 (Pass-Through)</strong>: Strict conservation. Everything entering must leave.</li>
            </ul>

            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
              <table className="w-full text-xs text-center border-collapse bg-white whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3 border-r border-slate-200 text-left sticky left-0 bg-slate-50 z-10">Intersections</th>
                    <th colSpan={data.edgeLabels.length} className="p-3 border-r-2 border-slate-800 bg-slate-100 uppercase tracking-wide">Matrix A (Internal Roads)</th>
                    <th className="p-3 bg-indigo-50 text-indigo-800 uppercase tracking-wide">Vector b (Boundary)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.matrix.map((row, rIdx) => {
                    const bVal = data.bVector[rIdx];
                    let bClass = 'bg-slate-50 text-slate-400';
                    if (bVal > 0) bClass = 'bg-emerald-50 text-emerald-700 font-bold';
                    if (bVal < 0) bClass = 'bg-rose-50 text-rose-700 font-bold';

                    return (
                      <tr key={rIdx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="p-3 border-r border-slate-200 font-bold text-slate-700 text-left sticky left-0 bg-white z-10">
                          {data.nodeLabels[rIdx]}
                        </td>
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className={`p-3 border-r border-slate-100 font-mono ${val !== 0 ? 'font-bold text-slate-800' : 'text-slate-300'}`}>
                            {val}
                          </td>
                        ))}
                        {/* Appended Dynamic b Vector Column */}
                        <td className={`p-3 border-l-2 border-slate-800 font-mono ${bClass}`}>
                          {bVal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Step 3: Math Engine & Solution */}
          <section>
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-2">
              <span className="bg-emerald-600 text-white font-bold h-8 w-8 flex items-center justify-center rounded-full text-sm">3</span>
              <h2 className="text-xl font-bold text-slate-900">Solving via Singular Value Decomposition (SVD)</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
              <div>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                  Real-world urban grids are highly overdetermined and contain cyclic loops (a non-trivial null space), causing standard matrix inversion ($A^{-1}$) to fail.
                </p>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                  The backend utilizes the <strong>Moore-Penrose Pseudo-inverse</strong> to solve the normal equations:
                </p>
                <div className="bg-slate-800 text-white font-mono p-4 rounded-lg text-center text-lg shadow-inner mb-4">
                  A<sup>T</sup> A x = A<sup>T</sup> b
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  This computes the optimal vector <strong>(x)</strong> that perfectly minimizes the Euclidean norm $||Ax - b||^2$. It mathematically mimics Wardrop's first principle of traffic equilibrium, distributing load to minimize systemic network stress.
                </p>
              </div>

              {/* Final Output Table */}
              <div className="border border-emerald-200 rounded-lg overflow-hidden flex flex-col h-full">
                <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-emerald-800">Final Flow Vector (x)</h3>
                  <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded font-semibold">Solution</span>
                </div>
                <div className="bg-white p-3 border-b border-emerald-100 text-xs text-slate-500">
                  The computed traffic volume strictly required on each edge to satisfy $Ax=b$.
                </div>
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-sm text-center border-collapse">
                    <tbody>
                      {data.xVector.map((val, idx) => (
                        <tr key={idx} className="border-b border-emerald-100 last:border-0 hover:bg-emerald-50/20">
                          <td className="p-3 border-r border-emerald-100 bg-slate-50 w-2/3 text-left font-medium text-slate-600 truncate max-w-[200px]" title={data.edgeLabels[idx]}>
                            {data.edgeLabels[idx]}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700">{Math.abs(Math.round(val))} units</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}