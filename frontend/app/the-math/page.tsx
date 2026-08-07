import React from 'react';
import Link from 'next/link';

export default function TheMath() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-8 md:p-16">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-800 text-white">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Traffic Flow Optimization Mathematics</h1>
            <Link href="/" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
              &larr; Back to Dashboard
            </Link>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            This engine does not rely on random simulations. It builds a rigorous mathematical model of urban infrastructure using applied linear algebra, translating intersections into matrices to solve for exact flow conservation.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-12">
          
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">1. The Incidence Matrix (A)</h2>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              When you connect nodes on the dashboard, the backend constructs an <strong>Incidence Matrix</strong>. This matrix maps the graphical topology into a format the solver can understand. Rows represent intersections (nodes) and columns represent roads (edges).
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <li><strong>1</strong> : The road originates at this intersection.</li>
              <li><strong>-1</strong> : The road terminates at this intersection.</li>
              <li><strong>0</strong> : The road is not connected to this intersection.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">2. Flow Conservation (Ax = b)</h2>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              The fundamental rule of our traffic model is conservation of mass: the total number of vehicles entering an intersection must equal the number leaving. This forms our core linear system: <strong>Ax = b</strong>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <span className="block font-bold text-blue-900 mb-1">A</span>
                <span className="text-blue-800">The Incidence Matrix defining the network structure.</span>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                <span className="block font-bold text-emerald-900 mb-1">x</span>
                <span className="text-emerald-800">The unknown traffic volume (flow) on each road.</span>
              </div>
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg">
                <span className="block font-bold text-rose-900 mb-1">b</span>
                <span className="text-rose-800">External boundary conditions (inflows and outflows).</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">3. The Least-Squares Solver</h2>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              In real-world networks with many interconnecting loops (like the Connaught Place radial network), the system is often overdetermined or has multiple free variables in its null space. A standard matrix inversion will fail.
            </p>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              To guarantee a balanced state, the FastAPI backend applies a <strong>Least-Squares Optimization</strong>—a core concept you will find in foundational academic texts like <em>Linear Algebra and Its Applications</em>. By calculating the pseudo-inverse, it finds the vector <em>x</em> that minimizes the Euclidean norm ||Ax - b||, producing the most balanced and mathematically optimal distribution of vehicles across the grid.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}