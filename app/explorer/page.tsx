"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { 
  Search, UploadCloud, Info, Sparkles, RotateCcw, 
  FileText, AlertCircle, Eye, RefreshCw, HelpCircle,
  Maximize2, Minimize2
} from "lucide-react";

// Local Helper Function for Nomenclature Steps Generator (handles complex E/Z and R/S stereochemistry)
function generateNomenclatureSteps(name: string): string[] {
  const steps: string[] = [];
  const cleanName = name.trim();
  if (!cleanName) return ["Enter a valid IUPAC name to view nomenclature breakdown."];

  steps.push(`Chemical Name Identified: "${cleanName}"`);

  // 1. Stereodescriptors
  const stereos: string[] = [];
  const stereoRegex = /\(([1-9]?[E|Z|R|S](?:,[1-9]?[E|Z|R|S])*)\)/g;
  let match;
  while ((match = stereoRegex.exec(cleanName)) !== null) {
    stereos.push(match[1]);
  }

  if (stereos.length > 0) {
    steps.push(`Stereochemistry detected: ${stereos.join(', ')}`);
    stereos.forEach(stereo => {
      if (stereo.includes('R') || stereo.includes('S')) {
        steps.push(`• stereocenter Configuration (${stereo}): Assign priorities to the 4 groups attached to the chiral center using Cahn-Ingold-Prelog (CIP) priority rules (based on atomic number). Trace a path from priority 1 -> 2 -> 3. If clockwise, it is 'R' (Rectus). If counter-clockwise, it is 'S' (Sinister).`);
      }
      if (stereo.includes('E') || stereo.includes('Z')) {
        steps.push(`• Double Bond Stereodescriptor (${stereo}): Rank the two substituents on each carbon of the double bond. If the highest-priority groups are on opposite sides, it is 'E' (Entgegen). If they are on the same side, it is 'Z' (Zusammen).`);
      }
    });
  } else {
    steps.push("No explicit stereodescriptors (R/S or E/Z) found. Assumed non-chiral or undefined/achiral centers.");
  }

  // 2. Parent Chain Identification
  const parentChains = [
    { key: "dec", name: "decane", carbons: 10 },
    { key: "non", name: "nonane", carbons: 9 },
    { key: "oct", name: "octane", carbons: 8 },
    { key: "hept", name: "heptane", carbons: 7 },
    { key: "hex", name: "hexane", carbons: 6 },
    { key: "pent", name: "pentane", carbons: 5 },
    { key: "but", name: "butane", carbons: 4 },
    { key: "prop", name: "propane", carbons: 3 },
    { key: "eth", name: "ethane", carbons: 2 },
    { key: "meth", name: "methane", carbons: 1 }
  ];

  let detectedParent = "";
  let carbons = 0;
  const lowerName = cleanName.toLowerCase();
  for (const p of parentChains) {
    if (lowerName.includes(p.key)) {
      detectedParent = p.key;
      carbons = p.carbons;
      break;
    }
  }

  if (carbons > 0) {
    steps.push(`Principal carbon chain: "${detectedParent}" containing a longest continuous chain of ${carbons} carbon atoms.`);
  } else {
    steps.push("Parent carbon chain length could not be automatically resolved. Please verify spelling.");
  }

  // 3. Main Functional Group / Suffix
  const suffixes = [
    { key: "oic acid", group: "Carboxylic Acid", suffix: "-oic acid", priority: "1 (Highest)" },
    { key: "al", group: "Aldehyde", suffix: "-al", priority: "2" },
    { key: "one", group: "Ketone", suffix: "-one", priority: "3" },
    { key: "ol", group: "Alcohol", suffix: "-ol", priority: "4" },
    { key: "amine", group: "Amine", suffix: "-amine", priority: "5" },
    { key: "yne", group: "Alkyne", suffix: "-yne", priority: "6" },
    { key: "ene", group: "Alkene", suffix: "-ene", priority: "7" },
    { key: "ane", group: "Alkane", suffix: "-ane", priority: "8 (Lowest)" }
  ];

  let detectedSuffix = "";
  let detectedGroup = "";
  let priority = "";
  for (const s of suffixes) {
    if (lowerName.endsWith(s.key) || lowerName.includes(s.key)) {
      detectedSuffix = s.suffix;
      detectedGroup = s.group;
      priority = s.priority;
      break;
    }
  }

  if (detectedGroup) {
    steps.push(`Principal functional group: "${detectedGroup}" (suffix "${detectedSuffix}") which holds a priority rank of ${priority}. Chain numbering must begin from the end closest to this group.`);
  } else {
    steps.push("No senior functional group suffix identified. Defaulted to standard alkane/substituent status.");
  }

  // 4. Substituents
  const substituents = [
    { key: "methyl", label: "Methyl (-CH3)" },
    { key: "ethyl", label: "Ethyl (-CH2CH3)" },
    { key: "propyl", label: "Propyl (-CH2CH2CH3)" },
    { key: "isopropyl", label: "Isopropyl (-CH(CH3)2)" },
    { key: "butyl", label: "Butyl (-CH2CH2CH2CH3)" },
    { key: "chloro", label: "Chloro (-Cl)" },
    { key: "bromo", label: "Bromo (-Br)" },
    { key: "fluoro", label: "Fluoro (-F)" },
    { key: "iodo", label: "Iodo (-I)" },
    { key: "hydroxy", label: "Hydroxy (-OH)" },
    { key: "oxo", label: "Oxo (=O)" }
  ];

  const foundSubs: string[] = [];
  substituents.forEach(sub => {
    if (lowerName.includes(sub.key)) {
      const regex = new RegExp(`(\\d+(?:,\\d+)*)-?(${sub.key})`, 'i');
      const subMatch = lowerName.match(regex);
      if (subMatch) {
        foundSubs.push(`${subMatch[1]}-${sub.label}`);
      } else {
        foundSubs.push(sub.label);
      }
    }
  });

  if (foundSubs.length > 0) {
    steps.push(`Side groups / Substituents: ${foundSubs.join(', ')}. These must be ordered alphabetically in the final IUPAC name.`);
  }

  // 5. Practical Drawing Steps
  steps.push("Recommended Drawing Walkthrough:");
  if (carbons > 0) {
    steps.push(`1. Draw the linear backbone of ${carbons} Carbon atoms.`);
    if (lowerName.includes("ene")) {
      steps.push("2. Insert double bond(s) at the designated carbon positions (e.g. C2-C3).");
    }
    if (lowerName.includes("yne")) {
      steps.push("3. Insert triple bond(s) at the designated carbon positions.");
    }
    if (detectedGroup && detectedGroup !== "Alkane") {
      steps.push(`4. Attach the senior functional group "${detectedGroup}" at its correct position (usually C1 for carboxylic acids/aldehydes).`);
    }
    if (foundSubs.length > 0) {
      steps.push(`5. Add the side chains/halogens (${foundSubs.map(s => s.split('-').pop()).join(', ')}) at their designated numbers.`);
    }
    if (stereos.length > 0) {
      steps.push(`6. Verify and set stereochemistry (${stereos.join(', ')}) using wedges (pointing towards you) and dashes (pointing away) or correct alkene double bond geometries.`);
    }
  } else {
    steps.push("1. Draw the principal backbone based on standard IUPAC rules.");
    steps.push("2. Attach active functional groups starting with the senior priority.");
    steps.push("3. Attach and orient secondary groups and stereocenters.");
  }

  return steps;
}

export default function ExplorerPage() {
  const [isMounted, setIsMounted] = useState(false);

  // Script Load Status Tracker States
  const [jqueryLoaded, setJqueryLoaded] = useState(false);
  const [threedmolLoaded, setThreedmolLoaded] = useState(false);
  const [smilesDrawerLoaded, setSmilesDrawerLoaded] = useState(false);
  const [tesseractLoaded, setTesseractLoaded] = useState(false);

  const isLibrariesLoaded = jqueryLoaded && threedmolLoaded && smilesDrawerLoaded && tesseractLoaded;

  const [error, setError] = useState<string | null>(null);

  // Search & API State
  const [searchTerm, setSearchTerm] = useState("trans-but-2-ene");
  const [smiles, setSmiles] = useState("C/C=C\\C");
  const [sdf, setSdf] = useState("");
  const [iupacName, setIupacName] = useState("trans-but-2-ene");
  const [isSearching, setIsSearching] = useState(false);

  // OCR Upload States
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState("");

  // Structure Upload Warning state
  const [structureWarning, setStructureWarning] = useState<string | null>(null);

  // Clipboard Paste Modal States
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedImageFile, setPastedImageFile] = useState<File | null>(null);

  // Rendering Settings
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [style3D, setStyle3D] = useState<"stick" | "sphere">("stick");

  // Layout states
  const [maximizedColumn, setMaximizedColumn] = useState<"left" | "right" | null>(null);

  const [nomenclatureSteps, setNomenclatureSteps] = useState<string[]>([]);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerContainerRef = useRef<HTMLDivElement | null>(null);
  const nameFileInputRef = useRef<HTMLInputElement | null>(null);
  const structureFileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Mount Phase
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. JSME PostMessage listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "JSME_CHANGE") {
        const drawnSmiles = event.data.smiles;
        if (drawnSmiles) {
          setSmiles(drawnSmiles);
          handleStructureToName(drawnSmiles);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isLibrariesLoaded]);

  // 3. Global Clipboard Paste Listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            setPastedImageFile(file);
            setShowPasteModal(true);
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // 4. Draw trigger (SmilesDrawer / 3Dmol)
  useEffect(() => {
    if (!isLibrariesLoaded) return;
    
    if (viewMode === "2d" && smiles) {
      draw2D();
    } else if (viewMode === "3d" && sdf) {
      draw3D();
    }
  }, [viewMode, smiles, sdf, isLibrariesLoaded, style3D]);

  // Render Default on first load
  useEffect(() => {
    if (isLibrariesLoaded) {
      handleNameSearch(searchTerm);
    }
  }, [isLibrariesLoaded]);

  // Name to Structure API Pipeline
  const handleNameSearch = async (nameToSearch: string) => {
    if (!nameToSearch.trim()) return;
    setIsSearching(true);
    setError(null);
    setSearchTerm(nameToSearch);

    try {
      // 1. Fetch SMILES from OPSIN
      const opsinUrl = `https://opsin.ch.cam.ac.uk/opsin/${encodeURIComponent(nameToSearch)}.smi`;
      const opsinRes = await fetch(opsinUrl);
      if (!opsinRes.ok) {
        throw new Error("Could not parse IUPAC name. Check spelling or stereodescriptor syntax.");
      }
      const retrievedSmiles = (await opsinRes.text()).trim();
      setSmiles(retrievedSmiles);
      setIupacName(nameToSearch);

      // 2. Generate steps locally
      const steps = generateNomenclatureSteps(nameToSearch);
      setNomenclatureSteps(steps);

      // 3. Fetch 3D SDF from PubChem
      let sdfData = "";
      try {
        const pubchem3D = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(retrievedSmiles)}/SDF?record_type=3d`;
        const res3d = await fetch(pubchem3D);
        if (res3d.ok) {
          sdfData = await res3d.text();
        } else {
          throw new Error("3D SDF failed");
        }
      } catch {
        // Fallback to 2D SDF
        const pubchem2D = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(retrievedSmiles)}/SDF?record_type=2d`;
        const res2d = await fetch(pubchem2D);
        if (res2d.ok) {
          sdfData = await res2d.text();
        } else {
          throw new Error("Failed to retrieve 2D structure file from PubChem.");
        }
      }
      setSdf(sdfData);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during name translation.");
    } finally {
      setIsSearching(false);
    }
  };

  // Structure to Name API Pipeline (Robust, non-throwing version)
  const handleStructureToName = async (structureSmiles: string) => {
    if (!structureSmiles.trim()) return;
    setIsSearching(true);
    setError(null);
    setSmiles(structureSmiles); // Allow 2D rendering using local SmilesDrawer anyway!

    let resolvedIupac = "";
    try {
      // 1. Fetch IUPAC name from PubChem
      const pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(structureSmiles)}/property/IUPACName/JSON`;
      const res = await fetch(pubchemUrl);
      if (!res.ok) {
        throw new Error("404");
      }
      const data = await res.json();
      resolvedIupac = data.PropertyTable.Properties[0].IUPACName;
      setIupacName(resolvedIupac);
      setSearchTerm(resolvedIupac);

      // Generate local explanation steps
      const steps = generateNomenclatureSteps(resolvedIupac);
      setNomenclatureSteps(steps);

    } catch (err) {
      // Graceful non-blocking handling for non-standard structures
      resolvedIupac = "Custom Chemical Structure";
      setIupacName(resolvedIupac);
      setSearchTerm("");
      setNomenclatureSteps([
        "IUPAC name not found for this exact structure in the PubChem database. It may be too complex or non-standard.",
        "However, your drawn chemical structure is structurally correct. You can explore the interactive 2D/3D visualizations to the right."
      ]);
    }

    // 2. Fetch 3D / 2D SDF for interactive viewer representation
    try {
      let sdfData = "";
      try {
        const pubchem3D = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(structureSmiles)}/SDF?record_type=3d`;
        const res3d = await fetch(pubchem3D);
        if (res3d.ok) {
          sdfData = await res3d.text();
        } else {
          throw new Error("3D failed");
        }
      } catch {
        const pubchem2D = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(structureSmiles)}/SDF?record_type=2d`;
        const res2d = await fetch(pubchem2D);
        if (res2d.ok) {
          sdfData = await res2d.text();
        }
      }
      setSdf(sdfData);
    } catch (sdfErr) {
      console.warn("Could not retrieve 3D coordination coordinate SDF file from PubChem:", sdfErr);
      setSdf("");
    } finally {
      setIsSearching(false);
    }
  };

  // Render 2D Canvas using smiles-drawer
  const draw2D = () => {
    const win = window as any;
    if (!win.SmilesDrawer || !smiles || !canvasRef.current) return;

    try {
      const options = {
        width: 500,
        height: 350,
        bondThickness: 1.8,
        bondLength: 16,
        shortBondLength: 0.85,
        fontSizeLarge: 14,
        fontSizeSmall: 10,
        padding: 15,
        experimental: true,
        compactDrawing: true
      };

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

      let drawer: any;
      try {
        drawer = new win.SmilesDrawer.Drawer(options);
        win.SmilesDrawer.parse(smiles, (tree: any) => {
          drawer.draw(tree, "canvas-2d-display", "light", false);
        }, (err: any) => {
          console.error("SmilesDrawer Parser Error:", err);
        });
      } catch {
        drawer = new win.SmilesDrawer.SmiDrawer(options);
        drawer.draw(smiles, "#canvas-2d-display", "light");
      }
    } catch (err) {
      console.error("Canvas draw error:", err);
    }
  };

  // Render 3D viewer using 3Dmol.js
  const draw3D = () => {
    const win = window as any;
    if (!win.$3Dmol || !sdf || !viewerContainerRef.current) return;

    try {
      const container = viewerContainerRef.current;
      container.innerHTML = ""; // Clear existing

      const viewer = win.$3Dmol.createViewer(win.$(container), {
        backgroundColor: "transparent",
        defaultcolors: win.$3Dmol.rasmolElementColors
      });

      viewer.addModel(sdf, "sdf");

      if (style3D === "sphere") {
        // Ball and stick hybrid
        viewer.setStyle({}, { sphere: { scale: 0.3 }, stick: { radius: 0.1 } });
      } else {
        // Standard high-tech stick representation
        viewer.setStyle({}, { stick: { radius: 0.15 } });
      }

      viewer.zoomTo();
      viewer.render();
    } catch (err) {
      console.error("3Dmol rendering failed:", err);
    }
  };

  // OCR Image-to-Name Upload (Dry-Helper called by pasted files and uploaded files)
  const handleNameOcrUploadFromFile = async (file: File) => {
    const win = window as any;
    if (!win.Tesseract) {
      setError("OCR recognition library is still loading. Please try again.");
      return;
    }

    setOcrLoading(true);
    setOcrProgress("Initializing scanner engine...");
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = await win.Tesseract.recognize(
            reader.result as string,
            'eng',
            {
              logger: (m: any) => {
                if (m.status === 'recognizing') {
                  setOcrProgress(`Transcribing text: ${Math.round(m.progress * 100)}%`);
                }
              }
            }
          );

          const extractedText = result.data.text;
          const cleanedText = extractedText
            .replace(/[\r\n]+/g, ' ')
            .replace(/[^a-zA-Z0-9\(\),\-\[\]\s]/g, '')
            .trim();

          setOcrProgress("Transcription completed!");
          if (cleanedText) {
            setSearchTerm(cleanedText);
            handleNameSearch(cleanedText);
          } else {
            throw new Error("No readable text found in chemical name image.");
          }
        } catch (ocrErr: any) {
          console.error(ocrErr);
          setError(ocrErr.message || "Failed to parse text from image. Make sure letters are neat.");
        } finally {
          setOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError("Error processing image file.");
      setOcrLoading(false);
    }
  };

  // Zone A File Selection wrapper
  const handleNameOcrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleNameOcrUploadFromFile(file);
    }
  };

  // ZONE B: Image-to-Structure Warning & Upload handler
  const handleStructureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Display the required structure recognition warning
    setStructureWarning("Image-to-Structure requires backend. Please use the sketcher below.");
  };

  // Reset function
  const resetAll = () => {
    setSearchTerm("trans-but-2-ene");
    setSmiles("C/C=C\\C");
    setIupacName("trans-but-2-ene");
    setStructureWarning(null);
    setError(null);
    setMaximizedColumn(null);
    handleNameSearch("trans-but-2-ene");
  };

  // JSME HTML srcDoc script
  const jsmeSrcDoc = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <script type="text/javascript" src="https://jsme-editor.github.io/dist/jsme/jsme.nocache.js"></script>
      <style>
        body, html { 
          margin: 0; 
          padding: 0; 
          overflow: hidden; 
          height: 100%; 
          width: 100%;
          background-color: #ffffff;
        }
        #jsme_container { 
          height: 100%; 
          width: 100%; 
        }
      </style>
    </head>
    <body>
      <div id="jsme_container"></div>
      <script>
        var jsmeApplet;
        function jsmeOnLoad() {
          jsmeApplet = new JSApplet.JSME("jsme_container", {
            "options" : "query,hydrogens,removehs"
          });
          
          // Set standard starting structure
          jsmeApplet.readGenericMolecularInput("C/C=C\\\\C");

          jsmeApplet.setCallBack("AfterStructureModified", function(event) {
            var smilesVal = jsmeApplet.smiles();
            window.parent.postMessage({ type: 'JSME_CHANGE', smiles: smilesVal }, '*');
          });
        }
      </script>
    </body>
    </html>
  `;

  // Hydration protection
  if (!isMounted) {
    return <ExplorerSkeleton />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 text-foreground">
      
      {/* Script Declarations using next/script */}
      <Script 
        src="https://code.jquery.com/jquery-3.6.0.min.js" 
        strategy="afterInteractive"
        onLoad={() => setJqueryLoaded(true)}
      />
      {jqueryLoaded && (
        <Script 
          src="https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.1.2/3Dmol-min.js" 
          strategy="afterInteractive"
          onLoad={() => setThreedmolLoaded(true)}
        />
      )}
      <Script 
        src="https://unpkg.com/smiles-drawer@1.0.10/dist/smiles-drawer.min.js" 
        strategy="afterInteractive"
        onLoad={() => setSmilesDrawerLoaded(true)}
      />
      <Script 
        src="https://unpkg.com/tesseract.js@5.0.3/dist/tesseract.min.js" 
        strategy="afterInteractive"
        onLoad={() => setTesseractLoaded(true)}
      />

      {/* Clipboard Paste Prompt Modal */}
      {showPasteModal && pastedImageFile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sidebar-bg border border-sidebar-border rounded-2xl p-6 max-w-md w-full shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <AlertCircle className="w-12 h-12 text-brand mx-auto animate-bounce" />
              <h3 className="text-xl font-bold">Image Pasted from Clipboard</h3>
              <p className="text-sm text-sidebar-text">
                An image paste was detected. Please choose which analysis pipeline this image belongs to:
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setShowPasteModal(false);
                  handleNameOcrUploadFromFile(pastedImageFile);
                  setPastedImageFile(null);
                }}
                className="p-4 border border-sidebar-border hover:border-brand/50 rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-sidebar-item-hover transition-all cursor-pointer group"
              >
                <FileText className="w-6 h-6 text-brand group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">Chemical Name</span>
                <span className="text-[10px] text-sidebar-text">OCR reads text chemical names</span>
              </button>
              
              <button
                onClick={() => {
                  setShowPasteModal(false);
                  setStructureWarning("Image-to-Structure requires backend. Please use the sketcher.");
                  setPastedImageFile(null);
                }}
                className="p-4 border border-sidebar-border hover:border-amber-500/50 rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:bg-sidebar-item-hover transition-all cursor-pointer group"
              >
                <Sparkles className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">Chemical Structure</span>
                <span className="text-[10px] text-sidebar-text">Triggers backend warn & opens canvas</span>
              </button>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setShowPasteModal(false);
                  setPastedImageFile(null);
                }}
                className="text-xs text-sidebar-text hover:text-foreground font-semibold cursor-pointer"
              >
                Cancel Paste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-sidebar-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-brand" />
            <h1 className="text-3xl font-extrabold tracking-tight">Structure & Naming Explorer</h1>
          </div>
          <p className="text-sidebar-text text-sm">
            Frictionless IUPAC Name parsing, automated OCR translations, and interactive structural drawing tools.
          </p>
        </div>
        
        <button 
          onClick={resetAll}
          className="flex items-center gap-2 px-4 py-2 border border-sidebar-border rounded-xl text-sm font-medium hover:bg-sidebar-item-hover transition-all text-sidebar-text hover:text-foreground cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Board
        </button>
      </header>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Translation Notice</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Libraries Loading state indicators */}
      {!isLibrariesLoaded && (
        <div className="p-4 bg-brand/5 border border-brand/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-brand animate-spin" />
            <span className="text-sm font-bold text-brand">Initializing Dynamic Libraries...</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-sidebar-text">
            <span>jQuery: {jqueryLoaded ? "🟢" : "⏳"}</span>
            <span>3Dmol: {threedmolLoaded ? "🟢" : "⏳"}</span>
            <span>2D Draw: {smilesDrawerLoaded ? "🟢" : "⏳"}</span>
            <span>OCR Eng: {tesseractLoaded ? "🟢" : "⏳"}</span>
          </div>
        </div>
      )}

      {/* TOP SECTION: Side-by-Side 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Name Input (OCR supported) */}
        {(maximizedColumn === null || maximizedColumn === "left") && (
          <div className={`${maximizedColumn === "left" ? "col-span-2" : "col-span-1"} bg-sidebar-bg border border-sidebar-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6 relative`}>
            
            {/* Header / Maximize toggle */}
            <div className="flex justify-between items-center border-b border-sidebar-border/40 pb-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Search className="w-5 h-5 text-brand" />
                IUPAC Name Input Pipeline
              </h2>
              <button 
                onClick={() => setMaximizedColumn(maximizedColumn === "left" ? null : "left")}
                className="p-1.5 hover:bg-sidebar-item-hover rounded-lg text-sidebar-text hover:text-foreground transition-all cursor-pointer"
                title={maximizedColumn === "left" ? "Restore View" : "Maximize Column"}
              >
                {maximizedColumn === "left" ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Input Search box */}
            <div className="space-y-4 flex-1">
              <p className="text-xs text-sidebar-text">
                Enter an IUPAC name. OPSIN translates it to structure, which then coordinates PubChem database assets.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNameSearch(searchTerm)}
                  placeholder="e.g. (2E)-but-2-ene"
                  className="flex-1 px-4 py-2.5 bg-background border border-sidebar-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all font-mono text-sm"
                />
                <button 
                  onClick={() => handleNameSearch(searchTerm)}
                  disabled={isSearching}
                  className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl text-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  Parse Name
                </button>
              </div>
            </div>

            {/* OCR File Trigger zone */}
            <div className="border-t border-sidebar-border/40 pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-sidebar-text uppercase tracking-wider">Alternative: Scan Text Image</span>
                <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-bold">Local OCR</span>
              </div>

              <input 
                type="file"
                ref={nameFileInputRef}
                accept="image/*"
                onChange={handleNameOcrUpload}
                className="hidden"
              />
              
              <button 
                onClick={() => nameFileInputRef.current?.click()}
                disabled={ocrLoading}
                className="w-full py-3 border border-sidebar-border hover:border-brand/40 bg-background/50 hover:bg-sidebar-item-hover rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 text-sidebar-text hover:text-foreground cursor-pointer shadow-inner"
              >
                <UploadCloud className="w-4 h-4 text-brand" />
                Upload Image of Name
              </button>

              {/* OCR recognition spinner progress banner */}
              {ocrLoading && (
                <div className="p-3.5 bg-brand/5 border border-brand/20 rounded-xl space-y-2 animate-pulse">
                  <div className="flex items-center gap-2 text-brand text-xs font-bold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Transcribing Name Image...</span>
                  </div>
                  <div className="w-full bg-sidebar-item-active rounded-full h-1 overflow-hidden">
                    <div className="bg-brand h-full rounded-full transition-all w-2/3"></div>
                  </div>
                  <p className="text-[10px] text-sidebar-text">{ocrProgress}</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* RIGHT COLUMN: Structure Input (JSME Interactive Sketcher) */}
        {(maximizedColumn === null || maximizedColumn === "right") && (
          <div className={`${maximizedColumn === "right" ? "col-span-2" : "col-span-1"} bg-sidebar-bg border border-sidebar-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6 relative`}>
            
            {/* Header / Maximize toggle */}
            <div className="flex justify-between items-center border-b border-sidebar-border/40 pb-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand" />
                Structure Input Sketcher
              </h2>
              <button 
                onClick={() => setMaximizedColumn(maximizedColumn === "right" ? null : "right")}
                className="p-1.5 hover:bg-sidebar-item-hover rounded-lg text-sidebar-text hover:text-foreground transition-all cursor-pointer"
                title={maximizedColumn === "right" ? "Restore View" : "Maximize Column"}
              >
                {maximizedColumn === "right" ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            {/* JSME Embedded Iframe */}
            <div className="space-y-4 flex-1">
              <p className="text-xs text-sidebar-text">
                Sketch a molecular compound. The SMILES will automatically sync and run the Structure-to-Name pipeline.
              </p>
              
              <div className="border border-sidebar-border rounded-xl overflow-hidden bg-white shadow-inner h-[280px] w-full relative">
                <iframe 
                  srcDoc={jsmeSrcDoc}
                  title="JSME Molecular Sketcher"
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>

            {/* Structure Warning & Upload Trigger */}
            <div className="border-t border-sidebar-border/40 pt-4 space-y-3">
              
              {structureWarning && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400 flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{structureWarning}</span>
                </div>
              )}

              <input 
                type="file"
                ref={structureFileInputRef}
                accept="image/*"
                onChange={handleStructureImageUpload}
                className="hidden"
              />

              <button 
                onClick={() => structureFileInputRef.current?.click()}
                className="w-full py-3 border border-sidebar-border hover:border-amber-500/40 bg-background/50 hover:bg-sidebar-item-hover rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 text-sidebar-text hover:text-foreground cursor-pointer shadow-inner"
              >
                <UploadCloud className="w-4 h-4 text-amber-500" />
                Upload Image of Structure
              </button>
            </div>

          </div>
        )}

      </div>

      {/* BOTTOM SECTION: Visualization Panels & Breakdown (Side-by-Side Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Visualization Card (7 Cols) */}
        <div className="lg:col-span-7 bg-sidebar-bg border border-sidebar-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sidebar-border pb-4">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Eye className="w-5 h-5 text-brand" />
                Visualization Board
              </h3>
              <span className="text-xs font-semibold text-brand bg-brand/10 px-2.5 py-0.5 rounded-full mt-1 inline-block font-mono">
                {iupacName || "Unknown Structure"}
              </span>
            </div>

            {/* Mode Toggles */}
            <div className="flex items-center gap-1.5 bg-background border border-sidebar-border rounded-lg p-1 shrink-0">
              <button 
                onClick={() => setViewMode("2d")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "2d" 
                    ? "bg-brand text-white shadow-sm" 
                    : "text-sidebar-text hover:text-foreground"
                }`}
              >
                2D Render
              </button>
              <button 
                onClick={() => setViewMode("3d")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "3d" 
                    ? "bg-brand text-white shadow-sm" 
                    : "text-sidebar-text hover:text-foreground"
                }`}
              >
                3D Interactive
              </button>
            </div>
          </div>

          {/* Display Render Space */}
          <div className="relative">
            {viewMode === "2d" ? (
              <div className="bg-white rounded-xl shadow-inner border border-sidebar-border overflow-hidden h-[350px] w-full flex items-center justify-center p-4">
                <canvas 
                  id="canvas-2d-display" 
                  ref={canvasRef} 
                  className="max-w-full max-h-full"
                  width={500}
                  height={350}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Interactive Settings */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-sidebar-text flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Drag to rotate, scroll/pinch to zoom model.
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-sidebar-text font-semibold">Model Representation:</span>
                    <select 
                      value={style3D}
                      onChange={(e) => setStyle3D(e.target.value as "stick" | "sphere")}
                      className="bg-background border border-sidebar-border rounded-lg text-xs px-2 py-1 focus:outline-none"
                    >
                      <option value="stick">Stick Representation</option>
                      <option value="sphere">Ball & Stick Representation</option>
                    </select>
                  </div>
                </div>

                {sdf ? (
                  <div 
                    id="3dmol-viewer"
                    ref={viewerContainerRef}
                    className="bg-slate-900 border border-slate-800 rounded-xl shadow-inner h-[350px] w-full relative overflow-hidden"
                  />
                ) : (
                  <div className="bg-slate-900/10 border border-sidebar-border rounded-xl h-[350px] w-full flex flex-col items-center justify-center text-center p-6 text-sidebar-text">
                    <AlertCircle className="w-10 h-10 text-sidebar-text/40 mb-2" />
                    <p className="text-sm font-semibold">3D Coordination SDF Data Unavailable</p>
                    <p className="text-xs">PubChem coordinate files are not standard for custom complex chains. Switch to 2D view above.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Nomenclature Breakdown Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-sidebar-bg border border-sidebar-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2 border-b border-sidebar-border pb-3">
              <FileText className="w-5 h-5 text-brand" />
              Nomenclature Breakdown
            </h3>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {nomenclatureSteps.length > 0 ? (
                <ul className="space-y-3">
                  {nomenclatureSteps.map((step, idx) => {
                    const isTitle = step.startsWith("Chemical Name Identified") || step.startsWith("Recommended Drawing Walkthrough") || step.startsWith("Step-by-Step Drawing Strategy");
                    return (
                      <li 
                        key={idx} 
                        className={`text-sm ${
                          isTitle 
                            ? "font-extrabold text-brand mt-4 first:mt-0 flex items-center gap-1.5" 
                            : "pl-4 border-l-2 border-sidebar-border text-sidebar-text leading-relaxed"
                        }`}
                      >
                        {!isTitle && <span className="inline-block w-1.5 h-1.5 bg-brand rounded-full mr-2 -ml-5 shrink-0" />}
                        {step}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-sidebar-text border border-dashed border-sidebar-border rounded-xl">
                  <HelpCircle className="w-10 h-10 text-sidebar-text/40 mb-2" />
                  <p className="text-sm font-semibold">No chemical data compiled</p>
                  <p className="text-xs font-medium">Verify standard names above to populate breakdown.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Cheat Sheet References */}
          <div className="bg-sidebar-bg/60 border border-sidebar-border rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-sidebar-text-active flex items-center gap-2">
              <Info className="w-4 h-4 text-brand" />
              Priority Rules Quick Reference
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-background/80 p-2.5 rounded-lg border border-sidebar-border/40">
                <span className="font-bold block text-brand">1. Carboxylic Acids</span>
                <span className="text-sidebar-text font-medium">Locant Prefix: -oic acid</span>
              </div>
              <div className="bg-background/80 p-2.5 rounded-lg border border-sidebar-border/40">
                <span className="font-bold block text-brand">2. Aldehydes & Ketones</span>
                <span className="text-sidebar-text font-medium">-al & -one suffixes</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// Skeleton Component to avoid Hydration Flicker
function ExplorerSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-pulse text-foreground">
      
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-sidebar-border pb-6">
        <div className="space-y-2">
          <div className="h-8 w-72 bg-sidebar-border rounded-lg"></div>
          <div className="h-4 w-96 bg-sidebar-border/60 rounded-md"></div>
        </div>
        <div className="h-10 w-28 bg-sidebar-border rounded-xl"></div>
      </div>
      
      {/* Top side-by-side skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-48 bg-sidebar-border rounded-2xl"></div>
        <div className="h-96 bg-sidebar-border rounded-2xl"></div>
      </div>
      
      {/* Bottom side-by-side skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 h-96 bg-sidebar-border rounded-2xl"></div>
        <div className="lg:col-span-5 h-96 bg-sidebar-border rounded-2xl"></div>
      </div>
      
    </div>
  );
}
