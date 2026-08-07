"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface MathState {
  matrix: number[][];
  bVector: number[];
  xVector: number[];
  nodeLabels: string[];
  edgeLabels: string[];
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
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-800 text-white">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Live Matrix Analysis</h1>
            <Link href="/" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
              &larr; Back to Dashboard
            </Link>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
            This demonstrates the exact principles of vector spaces and least-squares optimization from David C. Lay's Linear Algebra textbooks. Below is the live breakdown of the specific network topography and volumes you just submitted.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-12">
          
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">1. The Incidence Matrix (A)</h2>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              Based on your custom network, the backend mapped {data.nodeLabels.length} intersections and {data.edgeLabels.length} connecting roads. Rows represent your intersections (Nodes), and columns represent your roads (Edges).
            </p>
            
            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
              <table className="w-full text-sm text-center border-collapse bg-white">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3 border-r border-slate-200 text-left">Nodes \ Edges</th>
                    {data.edgeLabels.map((label, idx) => (
                      <th key={idx} className="p-3 min-w-[100px] border-r border-slate-200">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.matrix.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="p-3 border-r border-slate-200 font-bold text-slate-700 text-left bg-slate-50">
                        {data.nodeLabels[rIdx]}
                      </td>
                      {row.map((val, cIdx) => (
                        <td key={cIdx} className={`p-3 border-r border-slate-100 font-mono ${val === 1 ? 'text-blue-600 bg-blue-50/30' : val === -1 ? 'text-rose-600 bg-rose-50/30' : 'text-slate-400'}`}>
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
              The engine takes your External Boundary Vector <strong>(b)</strong> containing your inflows and outflows, and computes the pseudo-inverse to find the optimized flow vector <strong>(x)</strong> for every single road to maintain mass conservation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Vector b */}
              <div>
                <h3 className="text-sm font-bold text-rose-800 bg-rose-50 border border-rose-200 px-4 py-2 rounded-t-lg">
                  Vector b (Inflows/Outflows)
                </h3>
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
                  Vector x (Optimized Flow per Road)
                </h3>
                <div className="border border-t-0 border-emerald-200 rounded-b-lg overflow-hidden">
                  <table className="w-full text-sm text-center border-collapse">
                    <tbody>
                      {data.xVector.map((val, idx) => (
                        <tr key={idx} className="border-b border-emerald-100 last:border-0">
                          <td className="p-3 border-r border-emerald-100 bg-slate-50 w-1/2 text-left font-medium text-slate-600">{data.edgeLabels[idx]}</td>
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