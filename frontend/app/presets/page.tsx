"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PresetsLibrary() {
  const router = useRouter();

  const presets = [
    {
      id: 'cp',
      title: 'Connaught Place Grid',
      type: 'Radial Commercial Center',
      nodes: 11,
      edges: 20,
      description: "Models the highly complex concentric radial flow of Delhi's central business district. Features interdependent inner and outer circle loops with heavy cross-traffic stress points.",
      color: "blue"
    },
    {
      id: 'du-north',
      title: 'DU North Campus',
      type: 'High-Density Commute',
      nodes: 9,
      edges: 13,
      description: "Analyzes student and faculty commute flows from Vishwavidyalaya Metro Station navigating through the Arts Faculty, Ramjas, and the Bungalow Road bottleneck.",
      color: "emerald"
    },
    {
      id: 'igi-connector',
      title: 'IGI Airport Connector',
      type: 'Arterial Highway Interchange',
      nodes: 9,
      edges: 10,
      description: "Simulates the high-stakes arterial highways connecting Dhaula Kuan and NH-48 Gurgaon to the Aerocity hospitality hub and the Terminal 1/Terminal 3 departure gates.",
      color: "indigo"
    }
  ];

  const handleLoadPreset = (id: string) => {
    // Save the selection to session storage so the dashboard knows what to load on mount
    sessionStorage.setItem('pendingPreset', id);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 md:p-12 relative overflow-hidden">
      
      {/* Background Blueprint Grid Aesthetic */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm text-sm font-bold flex items-center gap-2">
                &larr; Back to Engine
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Network Library</h1>
            <p className="text-slate-500 mt-3 text-sm md:text-base max-w-2xl leading-relaxed">
              Select a pre-configured geographic topography to load into the FlowOptimizer solver. These templates map real-world intersections into strict mathematical $Ax = b$ vectors for simulation.
            </p>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {presets.map((preset) => (
            <div 
              key={preset.id} 
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative"
            >
              {/* Card Header Pattern */}
              <div className={`h-2 w-full bg-${preset.color}-500`}></div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-slate-800 leading-tight pr-4">
                    {preset.title}
                  </h2>
                  <span className={`bg-${preset.color}-50 text-${preset.color}-600 border border-${preset.color}-200 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md shrink-0`}>
                    Verified
                  </span>
                </div>
                
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  {preset.type}
                </p>
                
                <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1">
                  {preset.description}
                </p>

                {/* Matrix Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-2xl font-light text-slate-800">{preset.nodes}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nodes (m)</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-2xl font-light text-slate-800">{preset.edges}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Edges (n)</span>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => handleLoadPreset(preset.id)}
                  className={`w-full bg-slate-900 text-white font-bold text-sm py-3 px-4 rounded-xl hover:bg-${preset.color}-600 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2`}
                >
                  Load into Engine &rarr;
                </button>
              </div>
            </div>
          ))}

          {/* Custom Network Card (Empty State Placeholder) */}
          <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden flex flex-col items-center justify-center p-8 text-center opacity-80 hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <span className="text-2xl text-slate-400 font-light">+</span>
            </div>
            <h2 className="text-lg font-bold text-slate-700 mb-2">Blank Canvas</h2>
            <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed mb-6">
              Build your own custom topology node-by-node in the dashboard.
            </p>
            <button 
              onClick={() => handleLoadPreset('custom')}
              className="bg-white border border-slate-300 text-slate-700 font-bold text-sm py-2.5 px-6 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
            >
              Start Empty
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}