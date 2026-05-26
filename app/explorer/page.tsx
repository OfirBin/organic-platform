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
function generateNomenclatureSteps(name: string): { drawingSteps: string[], namingRules: string[] } {
  const namingRules: string[] = [];
  let workingName = name.trim().toLowerCase();

  const backbone = new Set<string>();
  const principal = new Set<string>();
  const bonds = new Set<string>();
  const substituents = new Set<string>();
  const stereochemistry = new Set<string>();

  if (!workingName) {
    namingRules.push("IUPAC Rules: Identify the longest carbon chain containing the highest-priority functional group, and number it to give that group the lowest possible locant.");
    return { drawingSteps: [], namingRules };
  }

  const extractLocants = (str: string) => {
    const match = str.match(/[\d,]+/);
    return match ? `carbon ${match[0]}` : "the appropriate carbon";
  };

  // 1. Stereochemistry
  const stereoRegex = /^\([ezrs\d,\-]+\)-?/i;
  const stereoMatch = workingName.match(stereoRegex);
  if (stereoMatch) {
    const stereoStr = stereoMatch[0];
    if (stereoStr.includes("e")) {
      stereochemistry.add("Adjust 3D geometry: Ensure the highest priority groups on the double bond are on opposite sides ((E) configuration).");
      namingRules.push("Stereodescriptors: (E)/(Z) descriptors are determined by Cahn-Ingold-Prelog (CIP) priority rules for non-identical groups.");
    }
    if (stereoStr.includes("z")) {
      stereochemistry.add("Adjust 3D geometry: Ensure the highest priority groups on the double bond are on the same side ((Z) configuration).");
      if (!namingRules.some(r => r.includes("(E)/(Z)"))) {
        namingRules.push("Stereodescriptors: (E)/(Z) descriptors are determined by Cahn-Ingold-Prelog (CIP) priority rules for non-identical groups.");
      }
    }
    if (stereoStr.includes("r")) {
      stereochemistry.add("Adjust 3D geometry: Ensure a clockwise (R) configuration around the chiral center.");
      namingRules.push("Stereodescriptors: (R)/(S) descriptors use CIP rules to indicate the absolute configuration of a chiral center.");
    }
    if (stereoStr.includes("s")) {
      stereochemistry.add("Adjust 3D geometry: Ensure a counter-clockwise (S) configuration around the chiral center.");
      if (!namingRules.some(r => r.includes("(R)/(S)"))) {
         namingRules.push("Stereodescriptors: (R)/(S) descriptors use CIP rules to indicate the absolute configuration of a chiral center.");
      }
    }
    workingName = workingName.replace(stereoRegex, "");
  }
  
  if (workingName.startsWith("cis-")) {
    stereochemistry.add("Adjust 3D geometry: Ensure the two similar groups are on the same side (cis).");
    namingRules.push("Stereodescriptors: cis/trans is strictly used when identical groups are on the double bond or ring.");
    workingName = workingName.replace(/^cis-/, "");
  } else if (workingName.startsWith("trans-")) {
    stereochemistry.add("Adjust 3D geometry: Ensure the two similar groups are on opposite sides (trans).");
    namingRules.push("Stereodescriptors: cis/trans is strictly used when identical groups are on the double bond or ring.");
    workingName = workingName.replace(/^trans-/, "");
  }

  // 2. Substituents
  const subList = ["fluoro", "chloro", "bromo", "iodo", "methyl", "ethyl", "propyl", "butyl"];
  let subsCount = 0;
  subList.forEach(sub => {
    const regex = new RegExp(`(?:[\\d,]+-)?(?:di|tri|tetra|penta)?${sub}`, 'g');
    let match;
    let foundMatches = [];
    while ((match = regex.exec(workingName)) !== null) {
      foundMatches.push(match[0]);
    }
    foundMatches.forEach(m => {
      subsCount++;
      substituents.add(`Attach the ${sub} group to ${extractLocants(m)}.`);
      workingName = workingName.replace(m, "");
    });
  });

  // 3. Principal Group
  let hasPrincipalGroup = false;
  const groups = [
    { name: "carboxylic acid", suffix: "oic acid" },
    { name: "aldehyde", suffix: "al" },
    { name: "ketone", suffix: "one" },
    { name: "alcohol", suffix: "ol" },
    { name: "amine", suffix: "amine" }
  ];
  
  groups.forEach(g => {
    const regex = new RegExp(`(?:[\\d,]+-)?(?:di|tri)?${g.suffix}(?:-|$)`, 'g');
    let match;
    let foundMatches = [];
    while ((match = regex.exec(workingName)) !== null) {
      foundMatches.push(match[0]);
    }
    foundMatches.forEach(m => {
      hasPrincipalGroup = true;
      const locs = (g.suffix === "oic acid" || g.suffix === "al") ? "carbon 1" : extractLocants(m);
      principal.add(`Add the principal functional group ${g.name} to ${locs}.`);
      if (!namingRules.some(r => r.includes("Numbering Priority: The chain is numbered to give the principal functional group"))) {
        namingRules.push("Numbering Priority: The chain is numbered to give the principal functional group the lowest possible locant.");
      }
      workingName = workingName.replace(m, "");
    });
  });

  // 4. Unsaturation
  let hasEne = false;
  let hasYne = false;
  
  const eneRegex = /(?:[\d,]+-)?(?:di|tri)?en(?:e|-|$)/g;
  let eneMatch;
  let eneMatches = [];
  while ((eneMatch = eneRegex.exec(workingName)) !== null) {
    eneMatches.push(eneMatch[0]);
  }
  eneMatches.forEach(m => {
    hasEne = true;
    bonds.add(`Place a double bond starting at ${extractLocants(m)}.`);
    workingName = workingName.replace(m, "");
  });

  const yneRegex = /(?:[\d,]+-)?(?:di|tri)?yn(?:e|-|$)/g;
  let yneMatch;
  let yneMatches = [];
  while ((yneMatch = yneRegex.exec(workingName)) !== null) {
    yneMatches.push(yneMatch[0]);
  }
  yneMatches.forEach(m => {
    hasYne = true;
    bonds.add(`Place a triple bond starting at ${extractLocants(m)}.`);
    workingName = workingName.replace(m, "");
  });

  if (hasEne && !hasPrincipalGroup) {
    namingRules.push("Numbering Priority: The chain is numbered to give the double bond the lowest possible locant.");
  } else if (hasYne && !hasPrincipalGroup && !hasEne) {
    namingRules.push("Numbering Priority: The chain is numbered to give the triple bond the lowest possible locant.");
  }

  if (subsCount > 1) {
    namingRules.push("Alphabetical Order: Multiple substituents are ordered alphabetically in the name, not numerically.");
  }
  if (subsCount > 0 && !hasPrincipalGroup && !hasEne && !hasYne) {
    namingRules.push("Numbering Priority: The chain is numbered to give substituents the lowest possible locant.");
  }

  // 5. Root Chain
  const prefixes = [
    { key: "dec", val: 10 }, { key: "non", val: 9 }, { key: "oct", val: 8 },
    { key: "hept", val: 7 }, { key: "hex", val: 6 }, { key: "pent", val: 5 },
    { key: "but", val: 4 }, { key: "prop", val: 3 }, { key: "eth", val: 2 },
    { key: "meth", val: 1 }
  ];
  for (let p of prefixes) {
    if (workingName.includes(p.key)) {
      backbone.add(`Start by drawing a continuous carbon chain of ${p.val} atoms.`);
      break;
    }
  }

  const orderedDrawingSteps = [
    ...Array.from(backbone),
    ...Array.from(principal),
    ...Array.from(bonds),
    ...Array.from(substituents),
    ...Array.from(stereochemistry)
  ];

  if (orderedDrawingSteps.length === 0 && namingRules.length === 0) {
    namingRules.push("IUPAC Rules: Identify the longest carbon chain containing the highest-priority functional group, and number it to give that group the lowest possible locant.");
  }

  return { drawingSteps: orderedDrawingSteps, namingRules };
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
  const [nomenclatureData, setNomenclatureData] = useState<{ drawingSteps: string[], namingRules: string[] }>({ drawingSteps: [], namingRules: [] });

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
      setNomenclatureData(generateNomenclatureSteps(name));

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
      setNomenclatureData({ drawingSteps: [], namingRules: [] });
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
          setNomenclatureData(generateNomenclatureSteps(iupac));
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
          setNomenclatureData(generateNomenclatureSteps(iupac));
        } else {
          throw new Error("Cactus 404");
        }
      }
    } catch (e) {
      setDrawnName("Name not available: This specific structure could not be algorithmically named by the standard public databases.");
      setIupacName("Unknown Structure");
      setNomenclatureData({ drawingSteps: [], namingRules: [] });
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
          <button onClick={() => { setSearchTerm(""); setSmiles(""); setSdfData(""); setIupacName(""); setError(null); setNomenclatureData({ drawingSteps: [], namingRules: [] }); }} className="flex items-center gap-2 text-sidebar-text hover:text-foreground text-sm font-semibold transition-colors">
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
        {(nomenclatureData.drawingSteps.length > 0 || nomenclatureData.namingRules.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
            {nomenclatureData.drawingSteps.length > 0 && (
              <div className="bg-sidebar-bg border border-sidebar-border rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b border-sidebar-border pb-2">
                  <FileText className="w-5 h-5 text-brand" /> How to Draw This Structure
                </h3>
                <ol className="list-decimal list-inside space-y-2">
                  {nomenclatureData.drawingSteps.map((step, i) => (
                    <li key={i} className="text-sm text-sidebar-text font-medium">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {nomenclatureData.namingRules.length > 0 && (
              <div className="bg-sidebar-bg border border-sidebar-border rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b border-sidebar-border pb-2">
                  <FileText className="w-5 h-5 text-brand" /> IUPAC Naming Rules Applied
                </h3>
                <ul className="space-y-2">
                  {nomenclatureData.namingRules.map((rule, i) => (
                    <li key={i} className="text-sm text-sidebar-text flex items-start gap-2">
                      <span className="text-brand font-bold mt-0.5">•</span> {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
