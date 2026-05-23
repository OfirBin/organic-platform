"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { useTheme } from "next-themes";
import { 
  Search, 
  UploadCloud, 
  Box, 
  ListOrdered, 
  Activity, 
  Loader2,
  Atom,
  AlertCircle,
  X
} from "lucide-react";

function generateNomenclatureSteps(name: string) {
  const steps = [];
  const lowerName = name.toLowerCase();

  let parentChain = "carbon chain";
  if (lowerName.includes("meth")) parentChain = "1-carbon chain (meth-)";
  else if (lowerName.includes("eth")) parentChain = "2-carbon chain (eth-)";
  else if (lowerName.includes("prop")) parentChain = "3-carbon chain (prop-)";
  else if (lowerName.includes("but")) parentChain = "4-carbon chain (but-)";
  else if (lowerName.includes("pent")) parentChain = "5-carbon chain (pent-)";
  else if (lowerName.includes("hex")) parentChain = "6-carbon chain (hex-)";
  else if (lowerName.includes("hept")) parentChain = "7-carbon chain (hept-)";
  else if (lowerName.includes("oct")) parentChain = "8-carbon chain (oct-)";

  let suffix = "alkane (-ane)";
  if (lowerName.includes("yne")) suffix = "alkyne (-yne) with a triple bond";
  else if (lowerName.includes("ene")) suffix = "alkene (-ene) with a double bond";
  else if (lowerName.includes("ol")) suffix = "alcohol (-ol) functional group";
  else if (lowerName.includes("oic acid")) suffix = "carboxylic acid (-oic acid)";
  
  steps.push({
    title: "Identify the parent chain and principal group",
    desc: `The name indicates a ${parentChain} ending in an ${suffix}.`
  });

  const substituents = [];
  if (lowerName.includes("bromo")) substituents.push("bromine (bromo-)");
  if (lowerName.includes("chloro")) substituents.push("chlorine (chloro-)");
  if (lowerName.includes("fluoro")) substituents.push("fluorine (fluoro-)");
  if (lowerName.includes("iodo")) substituents.push("iodine (iodo-)");
  if (lowerName.includes("methyl") && !lowerName.match(/^methyl/)) substituents.push("methyl group");
  
  if (substituents.length > 0) {
    steps.push({
      title: "Identify substituents",
      desc: `Found substituents: ${substituents.join(", ")}.`
    });
  }

  if (lowerName.includes("(e)") || lowerName.includes("(z)") || lowerName.includes("e-") || lowerName.includes("z-")) {
    steps.push({
      title: "E/Z Stereochemistry",
      desc: "The (E) or (Z) prefix denotes the stereochemistry of a double bond with non-identical groups based on Cahn-Ingold-Prelog priorities."
    });
  } else if (lowerName.includes("(r)") || lowerName.includes("(s)") || lowerName.includes("r-") || lowerName.includes("s-")) {
    steps.push({
      title: "R/S Stereochemistry",
      desc: "The (R) or (S) prefix indicates the absolute configuration of chiral centers."
    });
  } else {
     steps.push({
      title: "Number the chain",
      desc: "Numbering gives the lowest possible locants to the principal functional group and substituents."
    });
  }

  return steps;
}

export default function ExplorerPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analyzedQuery, setAnalyzedQuery] = useState("");
  
  // API & Visualization State
  const [error, setError] = useState<string | null>(null);
  const [smilesData, setSmilesData] = useState<string | null>(null);
  const [sdfData, setSdfData] = useState<string | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState({ smiles: false, d3mol: false });
  
  const [isMounted, setIsMounted] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { resolvedTheme } = useTheme();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            setImageFile(blob);
            setPreviewUrl(URL.createObjectURL(blob));
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setShowResults(false);
    setError(null);
    setSmilesData(null);
    setSdfData(null);

    try {
      // 1. Fetch SMILES from NIH CACTUS
      const smilesRes = await fetch(`https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(query.trim())}/smiles`);
      
      if (!smilesRes.ok) {
        throw new Error("Molecule not found. Please check the spelling or try another IUPAC name.");
      }
      
      const smilesStr = await smilesRes.text();
      setSmilesData(smilesStr);
      setAnalyzedQuery(query.trim());

      // 2. Fetch 3D SDF from PubChem (Graceful fallback if fails)
      try {
        const sdfRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smilesStr)}/SDF?record_type=3d`);
        if (sdfRes.ok) {
          const sdfStr = await sdfRes.text();
          setSdfData(sdfStr);
        } else {
          console.warn("3D SDF data not found for this molecule.");
          setSdfData(null); // Explicitly null if not found
        }
      } catch (sdfErr) {
        console.warn("Failed to fetch 3D SDF data:", sdfErr);
        setSdfData(null);
      }

      setShowResults(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to render 2D Molecule
  useEffect(() => {
    if (!showResults || !smilesData || !canvasRef.current || !scriptsLoaded.smiles) return;
    
    // @ts-expect-error - SmilesDrawer is attached to window by the CDN script
    if (typeof window.SmilesDrawer !== "undefined") {
      try {
        // @ts-expect-error
        const drawer = new window.SmilesDrawer.Drawer({
          width: 500,
          height: 300,
          compactDrawing: false
        });

        const currentTheme = resolvedTheme === "dark" ? "dark" : "light";
        
        // @ts-expect-error
        window.SmilesDrawer.parse(smilesData, (tree: any) => {
          drawer.draw(tree, canvasRef.current, currentTheme, false);
        }, async (err: any) => {
          console.warn("SmilesDrawer failed on Isomeric SMILES, fetching Canonical fallback...");
          try {
            const res = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(analyzedQuery)}/property/CanonicalSMILES/JSON`);
            if (res.ok) {
              const data = await res.json();
              const canonSmiles = data.PropertyTable.Properties[0].CanonicalSMILES;
              // @ts-expect-error
              window.SmilesDrawer.parse(canonSmiles, (tree: any) => {
                drawer.draw(tree, canvasRef.current, currentTheme, false);
              }, (err2: any) => console.error("Canonical fallback also failed", err2));
            }
          } catch (e) {
             console.error("Fallback fetch failed", e);
          }
        });
      } catch (e) {
        console.error("Error rendering 2D structure:", e);
      }
    }
  }, [showResults, smilesData, resolvedTheme, scriptsLoaded.smiles, analyzedQuery]);

  // Effect to render 3D Molecule
  useEffect(() => {
    if (!showResults || !viewerRef.current || !scriptsLoaded.d3mol) return;
    
    // Clear previous viewer if it exists
    viewerRef.current.innerHTML = "";

    // @ts-expect-error - $3Dmol is attached to window by the CDN script
    if (typeof window.$3Dmol !== "undefined") {
      if (sdfData) {
        try {
          // @ts-expect-error
          const viewer = window.$3Dmol.createViewer(viewerRef.current, { backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#ffffff' });
          viewer.addModel(sdfData, "sdf");
          viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { radius: 0.5 } }); // ball and stick
          viewer.zoomTo();
          viewer.render();
        } catch (e) {
          console.error("Error rendering 3D structure:", e);
          viewerRef.current.innerHTML = `<div class="w-full h-full flex items-center justify-center text-sidebar-text">Failed to render 3D model</div>`;
        }
      } else {
        viewerRef.current.innerHTML = `<div class="w-full h-full flex items-center justify-center text-sidebar-text">3D model data unavailable</div>`;
      }
    }
  }, [showResults, sdfData, scriptsLoaded.d3mol]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Load External Scripts */}
      <Script 
        src="https://unpkg.com/smiles-drawer@2.0.1/dist/smiles-drawer.min.js" 
        strategy="lazyOnload"
        onLoad={() => setScriptsLoaded(prev => ({ ...prev, smiles: true }))}
      />
      <Script 
        src="https://3Dmol.org/build/3Dmol-min.js" 
        strategy="lazyOnload"
        onLoad={() => setScriptsLoaded(prev => ({ ...prev, d3mol: true }))}
      />

      <header>
        <h1 className="text-3xl font-bold mb-2">Structure & Naming Explorer</h1>
        <p className="text-sidebar-text text-sm">
          Analyze complex organic structures, calculate properties, and visualize in 2D & 3D.
        </p>
      </header>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm flex flex-col justify-center">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-brand" />
            Enter IUPAC Name
          </h2>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g., aspirin or benzene"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sidebar-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 transition-shadow"
              />
            </div>
            <button
              type="submit"
              disabled={!isMounted || isLoading || !query.trim()}
              className="px-6 py-3 bg-brand text-white font-medium rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze"}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg flex items-start gap-2 text-sm animate-in fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </section>

        <section 
          className="p-6 rounded-2xl border-2 border-dashed border-sidebar-border bg-sidebar-bg/50 hover:bg-sidebar-bg hover:border-brand/50 transition-colors shadow-sm cursor-pointer flex flex-col items-center justify-center text-center group relative overflow-hidden"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              const file = e.dataTransfer.files[0];
              if (file.type.startsWith('image/')) {
                setImageFile(file);
                setPreviewUrl(URL.createObjectURL(file));
              }
            }
          }}
        >
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImageFile(e.target.files[0]);
                setPreviewUrl(URL.createObjectURL(e.target.files[0]));
              }
            }}
          />
          {previewUrl ? (
            <div className="absolute inset-0 p-2 bg-sidebar-bg flex flex-col items-center justify-center animate-in fade-in duration-300">
               <img src={previewUrl} alt="Uploaded" className="max-h-full object-contain rounded-lg shadow-sm border border-sidebar-border" />
               <button 
                 onClick={(e) => { e.stopPropagation(); setImageFile(null); setPreviewUrl(null); }}
                 className="absolute top-3 right-3 p-1.5 bg-background/80 hover:bg-red-500 hover:text-white rounded-full transition-colors shadow-sm border border-sidebar-border"
               >
                 <X className="w-4 h-4" />
               </button>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-sidebar-item-active rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-brand" />
              </div>
              <h3 className="font-semibold mb-1">Upload Structure Image</h3>
              <p className="text-xs text-sidebar-text">
                Drag & drop, click, or Ctrl+V to paste
              </p>
            </>
          )}
        </section>
      </div>

      {/* Results Section */}
      {showResults && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-700 fade-in">
          
          {/* Panel A: 2D Viewer */}
          <div className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm flex flex-col">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 border-b border-sidebar-border pb-3">
              <Atom className="w-5 h-5 text-brand" />
              2D Structure
            </h3>
            <div className="flex-1 min-h-[300px] bg-background rounded-xl border border-sidebar-border flex items-center justify-center overflow-hidden">
              <canvas 
                ref={canvasRef} 
                id="molecule-canvas"
                className="max-w-full"
              />
            </div>
          </div>

          {/* Panel B: 3D Viewer */}
          <div className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm flex flex-col">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 border-b border-sidebar-border pb-3">
              <Box className="w-5 h-5 text-brand" />
              3D Model
            </h3>
            <div className="flex-1 min-h-[300px] bg-background rounded-xl border border-sidebar-border overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent pointer-events-none z-0"></div>
              
              <div 
                ref={viewerRef} 
                className="w-full h-full relative z-10 cursor-move"
                style={{ position: 'relative' }}
              />
              
              <div className="absolute bottom-2 right-2 z-20 text-[10px] text-sidebar-text bg-background/80 px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Scroll to zoom, drag to rotate
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
              {generateNomenclatureSteps(analyzedQuery).map((step, index, arr) => (
                <div className="flex gap-4" key={index}>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold shrink-0">{index + 1}</div>
                    {index < arr.length - 1 && (
                      <div className="w-px h-full bg-sidebar-border mt-2"></div>
                    )}
                  </div>
                  <div className="pb-4">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    <p className="text-xs text-sidebar-text mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel D: Isomerism & Specs */}
          <div className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 border-b border-sidebar-border pb-3">
              <Activity className="w-5 h-5 text-brand" />
              Properties & Isomerism
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background border border-sidebar-border col-span-2">
                <p className="text-xs text-sidebar-text mb-1 uppercase font-semibold tracking-wider">SMILES Notation</p>
                <p className="text-sm font-mono break-all text-brand">{smilesData}</p>
              </div>
              <div className="p-4 rounded-xl bg-background border border-sidebar-border col-span-2">
                 <p className="text-xs text-sidebar-text mb-1 uppercase font-semibold tracking-wider">3D Data Source</p>
                 <p className="text-sm font-medium">{sdfData ? 'PubChem SDF Loaded' : 'No 3D Model Available'}</p>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
