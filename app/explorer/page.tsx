"use client";

import { useState } from "react";
import { 
  Search, 
  UploadCloud, 
  Box, 
  TestTubes, 
  ListOrdered, 
  Activity, 
  Loader2,
  Atom
} from "lucide-react";

export default function ExplorerPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setShowResults(false);

    // Simulate network/processing delay
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold mb-2">Structure & Naming Explorer</h1>
        <p className="text-sidebar-text text-sm">
          Analyze complex organic structures, calculate properties, and visualize in 2D & 3D.
        </p>
      </header>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IUPAC Name Input */}
        <section className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm flex flex-col justify-center">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-brand" />
            Enter IUPAC Name
          </h2>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g., (2R,3S)-2-bromo-3-chlorobutane"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sidebar-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 transition-shadow"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-3 bg-brand text-white font-medium rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze"}
            </button>
          </form>
        </section>

        {/* Dummy File Upload */}
        <section className="p-6 rounded-2xl border-2 border-dashed border-sidebar-border bg-sidebar-bg/50 hover:bg-sidebar-bg hover:border-brand/50 transition-colors shadow-sm cursor-pointer flex flex-col items-center justify-center text-center group">
          <div className="w-12 h-12 bg-sidebar-item-active rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6 text-brand" />
          </div>
          <h3 className="font-semibold mb-1">Upload Structure Image</h3>
          <p className="text-xs text-sidebar-text">
            Drag & drop a drawing (PNG, JPG) or click to browse
          </p>
        </section>
      </div>

      {/* Results Section */}
      {showResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-700 fade-in">
          
          {/* Panel A: 2D Viewer */}
          <div className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm flex flex-col">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 border-b border-sidebar-border pb-3">
              <Atom className="w-5 h-5 text-brand" />
              2D Structure
            </h3>
            <div className="flex-1 min-h-[250px] bg-background rounded-xl border border-sidebar-border flex items-center justify-center">
              <div className="text-center text-sidebar-text">
                <Atom className="w-16 h-16 mx-auto mb-3 opacity-20" />
                <p className="font-medium">2D Rendering Canvas</p>
                <p className="text-xs opacity-70">Skeletal structure visualizer</p>
              </div>
            </div>
          </div>

          {/* Panel B: 3D Viewer */}
          <div className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm flex flex-col">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 border-b border-sidebar-border pb-3">
              <Box className="w-5 h-5 text-brand" />
              3D Model
            </h3>
            <div className="flex-1 min-h-[250px] bg-background rounded-xl border border-sidebar-border flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent"></div>
              <div className="text-center text-sidebar-text relative z-10">
                <Box className="w-16 h-16 mx-auto mb-3 opacity-20" />
                <p className="font-medium">3D Viewer</p>
                <p className="text-xs opacity-70">3Dmol.js canvas placeholder</p>
              </div>
            </div>
          </div>

          {/* Panel C: Algorithm Logic */}
          <div className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 border-b border-sidebar-border pb-3">
              <ListOrdered className="w-5 h-5 text-brand" />
              Nomenclature Logic
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div className="w-px h-full bg-sidebar-border mt-2"></div>
                </div>
                <div className="pb-4">
                  <h4 className="font-medium text-sm">Identify the principal functional group</h4>
                  <p className="text-xs text-sidebar-text mt-1">Determines the suffix of the parent name.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <div className="w-px h-full bg-sidebar-border mt-2"></div>
                </div>
                <div className="pb-4">
                  <h4 className="font-medium text-sm">Find the longest carbon chain</h4>
                  <p className="text-xs text-sidebar-text mt-1">Must contain the principal functional group.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Number the chain and identify substituents</h4>
                  <p className="text-xs text-sidebar-text mt-1">Lowest possible locants assigned to substituents.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel D: Isomerism & Specs */}
          <div className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 border-b border-sidebar-border pb-3">
              <Activity className="w-5 h-5 text-brand" />
              Properties & Isomerism
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background border border-sidebar-border">
                <p className="text-xs text-sidebar-text mb-1 uppercase font-semibold tracking-wider">Formula</p>
                <p className="text-xl font-mono">C₄H₈BrCl</p>
              </div>
              <div className="p-4 rounded-xl bg-background border border-sidebar-border">
                <p className="text-xs text-sidebar-text mb-1 uppercase font-semibold tracking-wider">Weight</p>
                <p className="text-xl font-mono">171.46 <span className="text-sm">g/mol</span></p>
              </div>
              <div className="p-4 rounded-xl bg-background border border-sidebar-border col-span-2 flex justify-between items-center">
                <div>
                  <p className="text-xs text-sidebar-text mb-1 uppercase font-semibold tracking-wider">Stereocenters</p>
                  <p className="text-lg font-medium">2 Chiral Centers</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm">R</span>
                  <span className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm">S</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-background border border-sidebar-border col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">E/Z Configuration</span>
                  <span className="text-xs text-sidebar-text">Not applicable</span>
                </div>
                <div className="w-full bg-sidebar-border h-1.5 rounded-full overflow-hidden opacity-50"></div>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
