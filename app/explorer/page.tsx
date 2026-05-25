"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import {
  Search, UploadCloud, Info, Sparkles, RotateCcw,
  AlertCircle, RefreshCw, Eye, Image as ImageIcon, FileText
} from "lucide-react";

declare global {
  interface Window {
    jsmeOnLoad?: () => void;
    jsmeApplet?: any;
    JSApplet?: any;
    Tesseract?: any;
    SmilesDrawer?: any;
    $3Dmol?: any;
    $?: any;
  }
}

// Helper: Parse IUPAC Name and generate nomenclature rules
function generateNomenclatureSteps(name: string): string[] {
  const steps: string[] = [];
  const cleanName = name.trim().toLowerCase();

  if (!cleanName) {
    return ["IUPAC Rules: Identify the longest carbon chain containing the highest-priority functional group, and number it to give that group the lowest possible locant."];
  }

  // 1. Stereochemistry
  const stereoMatches = [];
  if (name.includes("(E)")) stereoMatches.push("The '(E)' descriptor indicates the highest priority groups on the double bond are on opposite sides.");
  if (name.includes("(Z)")) stereoMatches.push("The '(Z)' descriptor indicates the highest priority groups on the double bond are on the same side.");
  if (name.includes("(R)")) stereoMatches.push("The '(R)' descriptor indicates a clockwise configuration around a chiral center.");
  if (name.includes("(S)")) stereoMatches.push("The '(S)' descriptor indicates a counter-clockwise configuration around a chiral center.");
  if (cleanName.includes("cis-")) stereoMatches.push("The 'cis-' prefix indicates two similar groups are on the same side.");
  if (cleanName.includes("trans-")) stereoMatches.push("The 'trans-' prefix indicates two similar groups are on opposite sides.");
  if (stereoMatches.length > 0) {
    steps.push(`Stereochemistry: ${stereoMatches.join(" ")}`);
  }

  // 2. Root Chain
  const prefixes = [
    { key: "meth", val: 1 }, { key: "eth", val: 2 }, { key: "prop", val: 3 },
    { key: "but", val: 4 }, { key: "pent", val: 5 }, { key: "hex", val: 6 },
    { key: "hept", val: 7 }, { key: "oct", val: 8 }, { key: "non", val: 9 },
    { key: "dec", val: 10 }
  ];
  for (let p of prefixes) {
    if (cleanName.includes(p.key)) {
      steps.push(`Parent Chain: The '${p.key}' root indicates the longest continuous carbon chain contains ${p.val} atoms.`);
      break;
    }
  }

  // 3. Saturation
  const saturationMatches = [];
  if (cleanName.includes("ane")) saturationMatches.push("The '-ane' suffix indicates single bonds.");
  if (cleanName.includes("ene")) saturationMatches.push("The '-ene' suffix indicates the presence of a double bond.");
  if (cleanName.includes("yne")) saturationMatches.push("The '-yne' suffix indicates the presence of a triple bond.");
  if (saturationMatches.length > 0) {
    steps.push(`Saturation: ${saturationMatches.join(" ")}`);
  }

  // 4. Principal Functional Group
  if (cleanName.includes("oic acid")) {
    steps.push("Principal Group: The '-oic acid' suffix indicates a carboxylic acid. The chain is numbered to give this group the lowest possible number.");
  } else if (cleanName.includes("al")) {
    steps.push("Principal Group: The '-al' suffix indicates an aldehyde. The chain is numbered to give this group the lowest possible number.");
  } else if (cleanName.includes("one")) {
    steps.push("Principal Group: The '-one' suffix indicates a ketone. The chain is numbered to give this group the lowest possible number.");
  } else if (cleanName.includes("ol")) {
    steps.push("Principal Group: The '-ol' suffix indicates an alcohol. The chain is numbered to give this group the lowest possible number.");
  } else if (cleanName.includes("amine")) {
    steps.push("Principal Group: The '-amine' suffix indicates an amine. The chain is numbered to give this group the lowest possible number.");
  }

  // 5. Substituents
  const subList = ["fluoro", "chloro", "bromo", "iodo", "methyl", "ethyl"];
  const foundSubs = subList.filter(sub => cleanName.includes(sub));
  if (foundSubs.length > 0) {
    let formattedSubs = "";
    if (foundSubs.length === 1) {
      formattedSubs = `'${foundSubs[0]}'`;
    } else if (foundSubs.length === 2) {
      formattedSubs = `'${foundSubs[0]}' and '${foundSubs[1]}'`;
    } else {
      formattedSubs = foundSubs.slice(0, -1).map(s => `'${s}'`).join(", ") + `, and '${foundSubs[foundSubs.length - 1]}'`;
    }
    steps.push(`Substituents: Includes ${formattedSubs} groups, which are listed alphabetically in the nomenclature.`);
  }

  if (steps.length === 0) {
    return ["IUPAC Rules: Identify the longest carbon chain containing the highest-priority functional group, and number it to give that group the lowest possible locant."];
  }

  return steps;
}

export default function ExplorerPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [searchTerm, setSearchTerm] = useState("");
  const [smiles, setSmiles] = useState("");
  const [iupacName, setIupacName] = useState("");
  const [drawnName, setDrawnName] = useState("");
  const [sdfData, setSdfData] = useState("");
  const [nomenclatureSteps, setNomenclatureSteps] = useState<string[]>([]);

  // Loading states
  const [isSearching, setIsSearching] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  // Scripts loading state
  const [scriptsLoadedState, setScriptsLoadedState] = useState({
    jquery: false,
    threedmol: false,
    smilesdrawer: false,
    tesseract: false,
    jsme: false
  });

  const scriptsLoaded = scriptsLoadedState.jquery && scriptsLoadedState.threedmol && scriptsLoadedState.smilesdrawer && scriptsLoadedState.tesseract && scriptsLoadedState.jsme;

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  // 1. Hydration Safety
  useEffect(() => {
    setIsMounted(true);

    // JSME Callback
    window.jsmeOnLoad = () => {
      setScriptsLoadedState(prev => ({ ...prev, jsme: true }));
    };
  }, []);

  // Initialize JSME when scripts are ready
  useEffect(() => {
    if (scriptsLoaded && window.JSApplet && !window.jsmeApplet) {
      window.jsmeApplet = new window.JSApplet.JSME("jsme_container", "100%", "300px", {
        options: "query,hydrogens,removehs"
      });
    }
  }, [scriptsLoaded]);

  // Handle Global Paste for Name Image
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleOcrUploadFromFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Rendering logic whenever SMILES or SDF changes
  useEffect(() => {
    if (scriptsLoaded && smiles) {
      draw2D(smiles);
    }
    if (scriptsLoaded && sdfData) {
      draw3D(sdfData);
    }
  }, [smiles, sdfData, scriptsLoaded]);

  // Helper: Draw 2D
  const draw2D = (smilesStr: string) => {
    if (!window.SmilesDrawer || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      let options = {
        width: 400,
        height: 350,
        bondThickness: 1.5,
        fontSizeLarge: 14,
        compactDrawing: false,
        terminalCarbons: false
      };
      let drawer = new window.SmilesDrawer.Drawer(options);
      window.SmilesDrawer.parse(smilesStr, (tree: any) => {
        drawer.draw(tree, "canvas-2d", "light", false);
      });
    } catch (e) {
      console.warn("SmilesDrawer error", e);
    }
  };

  // Helper: Draw 3D
  const draw3D = (sdfStr: string) => {
    if (!window.$3Dmol || !viewerRef.current) return;
    const container = viewerRef.current;
    container.innerHTML = "";

    try {
      const viewer = window.$3Dmol.createViewer(window.$(container));
      viewer.addModel(sdfStr, "sdf");
      viewer.setStyle({}, { stick: { radius: 0.15 } });
      viewer.zoomTo();
      viewer.render();
    } catch (e) {
      console.warn("3Dmol error", e);
    }
  };

  // Pipeline: Name -> SMILES -> 3D SDF
  const analyzeName = async (name: string) => {
    if (!name.trim()) return;
    setIsSearching(true);
    setError(null);
    setSearchTerm(name);

    let retrievedSmiles = "";

    try {
      // 1. Name to SMILES (NIH CACTUS fallback -> PubChem)
      try {
        const cactusRes = await fetch(`https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(name)}/smiles`);
        if (cactusRes.ok) {
          retrievedSmiles = await cactusRes.text();
        } else {
          throw new Error("CACTUS failed");
        }
      } catch (err) {
        const pubchemRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/IsomericSMILES/JSON`);
        if (pubchemRes.ok) {
          const data = await pubchemRes.json();
          retrievedSmiles = data.PropertyTable.Properties[0].IsomericSMILES;
        } else {
          throw new Error("Molecule not found. Please check the spelling.");
        }
      }

      setSmiles(retrievedSmiles);
      setIupacName(name);
      setNomenclatureSteps(generateNomenclatureSteps(name));

      // 2. Fetch 3D SDF
      let sdfResult = "";
      try {
        const res3d = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(retrievedSmiles)}/SDF?record_type=3d`);
        if (res3d.ok) {
          sdfResult = await res3d.text();
        } else {
          // Fallback to 2D
          const res2d = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(retrievedSmiles)}/SDF?record_type=2d`);
          if (res2d.ok) {
            sdfResult = await res2d.text();
          }
        }
      } catch (e) {
        console.warn("SDF Fetch failed", e);
      }
      setSdfData(sdfResult);

    } catch (e: any) {
      setError(e.message || "Molecule not found. Please check the spelling.");
      setSmiles("");
      setSdfData("");
      setIupacName("");
      setNomenclatureSteps([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Pipeline: Structure -> SMILES -> Name
  const analyzeStructure = async () => {
    if (!window.jsmeApplet) return;
    setIsSearching(true);
    setError(null);
    setDrawnName("");

    const drawnSmiles = window.jsmeApplet.smiles();
    if (!drawnSmiles) {
      setError("Please draw a structure first.");
      setIsSearching(false);
      return;
    }

    setSmiles(drawnSmiles);

    try {
      // 1. Structure to Name (PubChem with Cactus Fallback)
      try {
        const pubchemRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(drawnSmiles)}/property/IUPACName/JSON`);
        if (pubchemRes.ok) {
          const data = await pubchemRes.json();
          const iupac = data.PropertyTable.Properties[0].IUPACName;
          setIupacName(iupac);
          setDrawnName(iupac);
          setSearchTerm(iupac);
          setNomenclatureSteps(generateNomenclatureSteps(iupac));
        } else {
          throw new Error("PubChem 404");
        }
      } catch (pubchemErr) {
        // Fallback to Cactus
        const cactusRes = await fetch(`https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(drawnSmiles)}/iupac_name`);
        if (cactusRes.ok) {
          const iupac = await cactusRes.text();
          setIupacName(iupac);
          setDrawnName(iupac);
          setSearchTerm(iupac);
          setNomenclatureSteps(generateNomenclatureSteps(iupac));
        } else {
          throw new Error("Cactus 404");
        }
      }
    } catch (e) {
      setDrawnName("Name not available: This specific structure could not be algorithmically named by the standard public databases.");
      setIupacName("Unknown Structure");
      setNomenclatureSteps([]);
    }

    try {
      // 2. Fetch 3D SDF
      let sdfResult = "";
      const res3d = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(drawnSmiles)}/SDF?record_type=3d`);
      if (res3d.ok) {
        sdfResult = await res3d.text();
      } else {
        const res2d = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(drawnSmiles)}/SDF?record_type=2d`);
        if (res2d.ok) sdfResult = await res2d.text();
      }
      setSdfData(sdfResult);
    } catch (e) {
      console.warn("SDF Fetch failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  // OCR Logic
  const handleOcrUploadFromFile = async (file: File) => {
    if (!window.Tesseract) {
      setError("OCR library is not loaded yet.");
      return;
    }

    setOcrLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = await window.Tesseract.recognize(reader.result, 'eng');
        const text = result.data.text.replace(/[\r\n]+/g, ' ').replace(/[^a-zA-Z0-9\(\),\-\[\]\s]/g, '').trim();
        if (text) {
          setSearchTerm(text);
          analyzeName(text);
        } else {
          setError("No readable text found in the image.");
        }
      } catch (err) {
        setError("Error processing OCR image.");
      } finally {
        setOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOcrInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleOcrUploadFromFile(file);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen p-8 text-foreground bg-background">

      {/* Native Next.js Scripts */}
      <Script src="https://code.jquery.com/jquery-3.6.0.min.js" strategy="afterInteractive" onLoad={() => setScriptsLoadedState(p => ({ ...p, jquery: true }))} />
      {scriptsLoadedState.jquery && (
        <Script src="https://3Dmol.org/build/3Dmol-min.js" strategy="afterInteractive" onLoad={() => setScriptsLoadedState(p => ({ ...p, threedmol: true }))} />
      )}
      <Script src="https://unpkg.com/smiles-drawer@2.0.1/dist/smiles-drawer.min.js" strategy="afterInteractive" onLoad={() => setScriptsLoadedState(p => ({ ...p, smilesdrawer: true }))} />
      <Script src="https://unpkg.com/tesseract.js@v4.1.1/dist/tesseract.min.js" strategy="afterInteractive" onLoad={() => setScriptsLoadedState(p => ({ ...p, tesseract: true }))} />
      <Script src="https://jsme-editor.github.io/dist/jsme/jsme.nocache.js" strategy="afterInteractive" />

      <div className="max-w-6xl mx-auto space-y-8">

        <header className="border-b border-sidebar-border pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-brand" />
              Chemistry Explorer
            </h1>
            <p className="text-sm text-sidebar-text mt-1">Stable API Integration & Visualization Dashboard</p>
          </div>
          <button onClick={() => { setSearchTerm(""); setSmiles(""); setSdfData(""); setIupacName(""); setError(null); setNomenclatureSteps([]); }} className="flex items-center gap-2 text-sidebar-text hover:text-foreground text-sm font-semibold transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </header>

        {/* Global Loading & Error States */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold text-sm">{error}</span>
          </div>
        )}

        {(isSearching || ocrLoading) && (
          <div className="p-4 bg-brand/10 border border-brand/20 text-brand rounded-xl flex items-center gap-3 animate-pulse">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="font-semibold text-sm">
              {ocrLoading ? "Loading... Extracting Text via OCR." : "Loading... Fetching chemical APIs and rendering canvases."}
            </span>
          </div>
        )}

        {/* TOP GRID: Name vs Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT COLUMN: Name Explorer */}
          <div className="bg-sidebar-bg border border-sidebar-border rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Search className="w-5 h-5 text-brand" /> Name Explorer
            </h2>

            <div className="space-y-3">
              <p className="text-xs text-sidebar-text">Enter an IUPAC name to translate into a structural rendering.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && analyzeName(searchTerm)}
                  placeholder="Enter IUPAC Name (e.g., Aspirin, Hexane)"
                  className="flex-1 px-4 py-2.5 bg-background border border-sidebar-border rounded-lg focus:outline-none focus:border-brand transition-colors text-sm font-mono"
                />
                <button
                  onClick={() => analyzeName(searchTerm)}
                  disabled={isSearching}
                  className="px-5 py-2.5 bg-brand text-white font-semibold rounded-lg hover:bg-brand-hover disabled:opacity-50 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>

            <div className="border-t border-sidebar-border pt-4 space-y-3">
              <p className="text-xs font-semibold text-sidebar-text uppercase tracking-wider">Paste or Upload Name Image</p>

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleOcrInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-sidebar-border hover:border-brand/50 rounded-lg text-sm font-semibold transition-colors bg-background/50 hover:bg-sidebar-item-hover">
                  <ImageIcon className="w-4 h-4 text-brand" />
                  Upload Name Image
                </button>
              </div>
              <p className="text-[10px] text-sidebar-text text-center">You can also directly Ctrl+V / Cmd+V an image onto this page.</p>
            </div>
          </div>

          {/* RIGHT COLUMN: Structure Explorer */}
          <div className="bg-sidebar-bg border border-sidebar-border rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Eye className="w-5 h-5 text-brand" /> Structure Explorer
            </h2>

            <div className="space-y-3">
              <p className="text-xs text-sidebar-text">Draw a compound to derive its name and coordinates.</p>

              {!scriptsLoaded ? (
                <div className="w-full h-[300px] border border-sidebar-border rounded-lg flex items-center justify-center bg-sidebar-item-active text-sm text-sidebar-text font-semibold">
                  Loading JSME Editor...
                </div>
              ) : (
                <div className="border border-sidebar-border rounded-lg overflow-hidden shadow-inner h-[300px] w-full bg-white relative">
                  <div id="jsme_container" className="w-full h-full"></div>
                </div>
              )}

              <button
                onClick={analyzeStructure}
                disabled={isSearching || !scriptsLoaded}
                className="w-full px-5 py-2.5 bg-brand text-white font-semibold rounded-lg hover:bg-brand-hover disabled:opacity-50 transition-colors"
              >
                Analyze Drawn Structure
              </button>

              {drawnName && (
                <div className="mt-4 p-4 bg-background border border-sidebar-border rounded-xl shadow-sm">
                  <p className="text-xs text-sidebar-text font-bold uppercase tracking-wider mb-1">Identified Name</p>
                  <p className={`text-sm font-mono break-words ${drawnName.includes("Name not available") ? "text-amber-600 dark:text-amber-400" : "text-brand"}`}>
                    {drawnName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM GRID: Visualizations & Logic */}
        {(smiles || isSearching) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">

            {/* PANEL A: 2D Visualization */}
            <div className="bg-sidebar-bg border border-sidebar-border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-sidebar-border pb-3">
                <h2 className="text-lg font-bold">Panel A: 2D Visualization</h2>
                {iupacName && <span className="text-xs font-mono bg-brand/10 text-brand px-2 py-1 rounded-md">{iupacName}</span>}
              </div>

              <div className="w-full h-[350px] bg-white border border-sidebar-border rounded-lg flex items-center justify-center overflow-hidden relative shadow-inner">
                {scriptsLoaded ? (
                  <canvas id="canvas-2d" ref={canvasRef} width={400} height={350}></canvas>
                ) : (
                  <span className="text-sm text-sidebar-text font-semibold">Loading 2D Canvas...</span>
                )}
                {!smiles && isSearching && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>}
              </div>
            </div>

            {/* PANEL B: 3D Visualization */}
            <div className="bg-sidebar-bg border border-sidebar-border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-sidebar-border pb-3">
                <h2 className="text-lg font-bold">Panel B: 3D Visualization</h2>
                <span className="text-xs text-sidebar-text flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Drag to rotate
                </span>
              </div>

              <div className="w-full h-[350px] bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center overflow-hidden relative shadow-inner">
                {scriptsLoaded ? (
                  <div id="3dmol-viewer" ref={viewerRef} className="w-full h-full absolute inset-0"></div>
                ) : (
                  <span className="text-sm text-slate-400 font-semibold">Loading 3D Viewer...</span>
                )}
                {(!sdfData && !isSearching && smiles) && (
                  <div className="z-10 text-slate-400 text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> No 3D Data Available
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Nomenclature Logic Breakdown */}
        {nomenclatureSteps.length > 0 && (
          <div className="bg-sidebar-bg border border-sidebar-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-sidebar-border pb-2">
              <FileText className="w-5 h-5 text-brand" /> Nomenclature Rules & Steps
            </h3>
            <ul className="space-y-2">
              {nomenclatureSteps.map((step, i) => (
                <li key={i} className="text-sm text-sidebar-text flex items-start gap-2">
                  <span className="text-brand font-bold mt-0.5">•</span> {step}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
