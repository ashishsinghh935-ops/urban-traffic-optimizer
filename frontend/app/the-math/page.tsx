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
            <h1 className="text-3xl font-bold tracking-tight">Live Matrix Analysis</h1>
            <Link href="/" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
              &larr; Back to Dashboard
            </Link>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
            Below is the mathematical breakdown of the specific network topography and volumes you just submitted. 
            The engine uses the principles of vector spaces and linear optimization to conserve traffic flow across the grid.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-12">
          
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Your Network Topography</h2>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              This is the network graph that was sent to the backend. The math engine must calculate the exact flow for every single connecting line (edge) to prevent gridlock.
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

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">1. The Incidence Matrix (A)</h2>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              To solve the network, the graph is mathematically flattened into an <strong>Incidence Matrix</strong>. 
              Rows represent your {data.nodeLabels?.length || 0} intersections, and columns represent your {data.edgeLabels?.length || 0} roads. 
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <li><strong className="text-blue-600">1</strong> means the road <strong>originates</strong> here (traffic leaves the intersection).</li>
              <li><strong className="text-rose-600">-1</strong> means the road <strong>terminates</strong> here (traffic enters the intersection).</li>
              <li><strong className="text-slate-400">0</strong> means the road and intersection are not connected.</li>
            </ul>
            
            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
              <table className="w-full text-xs text-center border-collapse bg-white whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3 border-r border-slate-200 text-left sticky left-0 bg-slate-50 z-10">Intersections \ Roads</th>
                    {data.edgeLabels.map((label, idx) => {
                      // Safe split handling in case label formatting drops
                      const parts = label ? label.split(' → ') : ['Unknown', 'Unknown'];
                      const source = parts[0] || 'Unknown';
                      const target = parts[1] || 'Unknown';
                      return (
                        <th key={idx} className="p-3 min-w-[120px] border-r border-slate-200">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-slate-400 uppercase">From:</span>
                            <span className="truncate max-w-[100px]" title={source}>{source}</span>
                            <span className="text-[10px] text-slate-400 uppercase mt-1">To:</span>
                            <span className="truncate max-w-[100px]" title={target}>{target}</span>
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

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">2. Solving Ax = b</h2>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              We now have a linear system defined as <strong>Ax = b</strong>. 
              The engine takes your <strong>Boundary Vector (b)</strong> (which dictates how many cars are entering or leaving the edges of your map) and computes the pseudo-inverse to find the optimized flow vector <strong>(x)</strong>. This guarantees that traffic volume is perfectly balanced without violating flow conservation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Vector b */}
              <div>
                <h3 className="text-sm font-bold text-rose-800 bg-rose-50 border border-rose-200 px-4 py-2 rounded-t-lg">
                  Vector b (Boundary Inflows/Outflows)
                </h3>
                <div className="bg-white p-3 border border-t-0 border-rose-200 border-b-0 text-xs text-slate-500">
                  Positive values = Traffic entering map. Negative values = Traffic exiting map. Zero = Internal intersection.
                </div>
                <div className="border border-t-0 border-rose-200 rounded-b-lg overflow-hidden">
                  <table className="w-full text-sm text-center border-collapse">
                    <tbody>
                      {data.bVector.map((val, idx) => (
                        <tr key={idx} className="border-b border-rose-100 last:border-0">
                          <td className="p-3 border-r border-rose-100 bg-slate-50 w-1/2 text-left font-medium text-slate-600">{data.nodeLabels[idx]}</td>
                          <td className="p-3 font-mono font-bold text-rose-700">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vector x */}
              <div>
                <h3 className="text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-t-lg">
                  Vector x (Optimized Flow Result)
                </h3>
                <div className="bg-white p-3 border border-t-0 border-emerald-200 border-b-0 text-xs text-slate-500">
                  The calculated traffic volume required on each road to prevent bottleneck failure.
                </div>
                <div className="border border-t-0 border-emerald-200 rounded-b-lg overflow-hidden">
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