'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

export default function SmilesRenderer({ smiles, id = "smiles-canvas" }: { smiles: string, id?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if SmilesDrawer is already available globally
    if (typeof window !== 'undefined' && window.SmilesDrawer) {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady || !smiles || !canvasRef.current || !window.SmilesDrawer) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      let options = {
        width: 400,
        height: 250,
        bondThickness: 1.5,
        fontSizeLarge: 14,
        compactDrawing: false,
        terminalCarbons: false
      };
      let drawer = new window.SmilesDrawer.Drawer(options);
      window.SmilesDrawer.parse(smiles, (tree: any) => {
        drawer.draw(tree, id, "light", false);
      });
    } catch (e) {
      console.warn("SmilesDrawer error", e);
    }
  }, [smiles, isReady, id]);

  return (
    <div className="w-full flex justify-center items-center py-2">
      <Script 
        src="https://unpkg.com/smiles-drawer@2.0.1/dist/smiles-drawer.min.js" 
        strategy="afterInteractive" 
        onLoad={() => setIsReady(true)} 
      />
      <canvas id={id} ref={canvasRef} width={400} height={250}></canvas>
    </div>
  );
}
