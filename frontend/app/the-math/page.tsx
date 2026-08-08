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
            <Link href="/" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
              &larr; Back to Dashboard
            </Link>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
            This tool does not rely on simple heuristics. It treats the city grid as a vector space, translating intersections into systems of linear equations to calculate perfect flow conservation. Here is the mathematical breakdown of your specific network.
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
              This is the visual graph you built. To a computer, this is just a collection of connected nodes. We must translate this visual topology into mathematical matrices.
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
              First, the backend mathematically flattens your map into an <strong>Incidence Matrix (A)</strong>. Every row is an intersection, and every column is a road (edge). This matrix purely describes <em>direction</em> and <em>connectivity</em>.
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <li><strong className="text-blue-600">1</strong>: The road <strong>originates</strong> here (traffic leaves the node).</li>
              <li><strong className="text-rose-600">-1</strong>: The road <strong>terminates</strong> here (traffic enters the node).</li>
              <li><strong className="text-slate-400">0</strong>: The road and intersection are not connected.</li>
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
              We now introduce the <strong>Boundary Vector (b)</strong>. This represents the external constraints—how many cars are entering the grid from outside, and how many are leaving. By appending this vector to our Incidence Matrix, we create an <strong>Augmented Matrix</strong> representing the linear system <strong>Ax = b</strong>.
            </p>
            <div className="bg-indigo-50 border border-indigo-100 text-indigo-900 text-sm p-4 rounded-lg mb-6">
              <strong>The Goal:</strong> To conserve mass, the sum of all internal traffic flows entering and leaving an intersection must perfectly equal the external boundary condition for that intersection.
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
              <table className="w-full text-xs text-center border-collapse bg-white whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3 border-r border-slate-200 text-left sticky left-0 bg-slate-50 z-10">Intersections</th>
                    <th colSpan={data.edgeLabels.length} className="p-3 border-r-2 border-slate-800 bg-slate-100 uppercase tracking-wide">Matrix A (Internal Roads)</th>
                    <th className="p-3 bg-rose-50 text-rose-800 uppercase tracking-wide">Vector b (External Flow)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.matrix.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="p-3 border-r border-slate-200 font-bold text-slate-700 text-left sticky left-0 bg-white z-10">
                        {data.nodeLabels[rIdx]}
                      </td>
                      {row.map((val, cIdx) => (
                        <td key={cIdx} className={`p-3 border-r border-slate-100 font-mono ${val !== 0 ? 'font-bold text-slate-800' : 'text-slate-300'}`}>
                          {val}
                        </td>
                      ))}
                      {/* Appended b Vector Column */}
                      <td className="p-3 border-l-2 border-slate-800 bg-rose-50 font-mono font-bold text-rose-700">
                        {data.bVector[rIdx]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Step 3: Math Engine & Solution */}
          <section>
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-2">
              <span className="bg-emerald-600 text-white font-bold h-8 w-8 flex items-center justify-center rounded-full text-sm">3</span>
              <h2 className="text-xl font-bold text-slate-900">Solving the Normal Equations (Least Squares)</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
              <div>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                  In a simple math problem, we would just row-reduce the Augmented Matrix to find the flow (x). However, real-world traffic networks (like yours) are often <strong>overdetermined</strong> or contain loops. This means they have free variables (a non-trivial null space), and a standard matrix inversion will fail.
                </p>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                  To solve this, our backend calculates the <strong>Moore-Penrose Pseudo-inverse</strong> using Singular Value Decomposition (SVD). This relies on the normal equations:
                </p>
                <div className="bg-slate-800 text-white font-mono p-4 rounded-lg text-center text-lg shadow-inner mb-4">
                  A<sup>T</sup> A x = A<sup>T</sup> b
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  This finds the vector <strong>(x)</strong> that perfectly minimizes the Euclidean norm ||Ax - b||. It calculates the mathematically optimal distribution of vehicles that prevents bottlenecks while perfectly conserving flow.
                </p>
              </div>

              {/* Final Output Table */}
              <div className="border border-emerald-200 rounded-lg overflow-hidden flex flex-col h-full">
                <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-emerald-800">Final Flow Vector (x)</h3>
                  <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded font-semibold">Solution</span>
                </div>
                <div className="bg-white p-3 border-b border-emerald-100 text-xs text-slate-500">
                  The computed traffic volume strictly required on each edge to maintain stability.
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