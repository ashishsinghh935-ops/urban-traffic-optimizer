"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PresetGallery() {
  const router = useRouter();

  const handleSelectPreset = (presetId: string) => {
    sessionStorage.setItem('pendingPreset', presetId);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Network Preset Library</h1>
            <p className="text-slate-500 mt-2">Select a real-world urban topology to load into the Math Engine.</p>
          </div>
          <Link href="/" className="px-5 py-2.5 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors text-slate-700">
            &larr; Back to Editor
          </Link>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: North Campus */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="h-32 bg-blue-600 flex items-center justify-center p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
              <h2 className="text-xl font-bold text-white relative z-10 text-center">Delhi University<br/><span className="text-blue-200 text-sm font-medium">North Campus</span></h2>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-sm text-slate-600 mb-6 flex-1">
                Models the heavy student commute flow from Vishwavidyalaya Metro Station down to Arts Faculty, SGTB Khalsa, SRCC, and Hansraj College.
              </p>
              <button onClick={() => handleSelectPreset('du-north')} className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm">
                Load Topology
              </button>
            </div>
          </div>

          {/* Card 2: Connaught Place */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="h-32 bg-indigo-600 flex items-center justify-center p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
              <h2 className="text-xl font-bold text-white relative z-10 text-center">Connaught Place<br/><span className="text-indigo-200 text-sm font-medium">Inner & Outer Hub</span></h2>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-sm text-slate-600 mb-6 flex-1">
                The classic hub-and-spoke radial grid. Maps Rajiv Chowk as the central node with surrounding radials like Barakhamba and Janpath.
              </p>
              <button onClick={() => handleSelectPreset('cp')} className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm">
                Load Topology
              </button>
            </div>
          </div>

          {/* Card 3: IGI Connector */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="h-32 bg-emerald-600 flex items-center justify-center p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
              <h2 className="text-xl font-bold text-white relative z-10 text-center">IGI Airport<br/><span className="text-emerald-200 text-sm font-medium">Connector Grid</span></h2>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-sm text-slate-600 mb-6 flex-1">
                A high-complexity topology strictly mirroring the Dhaula Kuan-Aerocity interchange. It balances flow between NH-48 inputs, the RTR flyover, and the airport terminals.
              </p>
              <button onClick={() => handleSelectPreset('igi-connector')} className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm">
                Load Topology
              </button>
            </div>
          </div>

          {/* Card 4: Custom Sandbox */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow border-dashed">
            <div className="h-32 bg-slate-100 flex items-center justify-center p-6 border-b border-slate-200 border-dashed">
              <h2 className="text-xl font-bold text-slate-700 text-center">Custom Sandbox<br/><span className="text-slate-500 text-sm font-medium">Blank Canvas</span></h2>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-sm text-slate-600 mb-6 flex-1">
                Start from scratch. Drop your own intersection nodes, connect them with directional roads, and build a custom matrix.
              </p>
              <button onClick={() => handleSelectPreset('custom')} className="w-full bg-white border border-slate-300 text-slate-700 font-medium py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                Unlock & Reset
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}