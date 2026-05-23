"use client";

import { useState } from "react";
import { Search, BookA, Info } from "lucide-react";

type GlossaryTerm = {
  term: string;
  definition: string;
  category: string;
};

const glossaryData: GlossaryTerm[] = [
  { term: "Nucleophile", definition: "An electron-rich species that donates a pair of electrons to an electrophile to form a chemical bond.", category: "Reactivity" },
  { term: "Electrophile", definition: "An electron-deficient species that accepts a pair of electrons from a nucleophile.", category: "Reactivity" },
  { term: "Isomer", definition: "Molecules with the same chemical formula but different structural arrangements or spatial orientations.", category: "Structure" },
  { term: "Enantiomer", definition: "Chiral molecules that are non-superimposable mirror images of each other.", category: "Stereochemistry" },
  { term: "Diastereomer", definition: "Stereoisomers that are not mirror images of each other.", category: "Stereochemistry" },
  { term: "Carbocation", definition: "A positively charged carbon atom with only three bonds, making it a strong electrophile.", category: "Intermediates" },
  { term: "Steric Hindrance", definition: "Prevention or retardation of a chemical reaction caused by the spatial arrangement of atoms.", category: "Reactivity" },
  { term: "Resonance", definition: "Delocalization of electrons across adjacent parallel p-orbitals, stabilizing the molecule.", category: "Structure" },
];

// Tooltip component for the interactive paragraph
const TermWithTooltip = ({ term, definition }: { term: string; definition: string }) => {
  return (
    <span className="relative inline-block group cursor-help border-b border-dashed border-brand text-brand hover:bg-brand/10 rounded transition-colors px-0.5">
      {term}
      {/* Tooltip */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-sidebar-bg border border-sidebar-border shadow-xl rounded-xl text-sm text-foreground opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
        <span className="font-bold block mb-1 text-brand">{term}</span>
        {definition}
        {/* Tooltip arrow */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-sidebar-bg border-t-sidebar-border" />
      </span>
    </span>
  );
};

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTerms = glossaryData.filter(item => 
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold mb-2">Glossary & Concepts</h1>
        <p className="text-sidebar-text text-sm">
          Search the definitive dictionary for organic chemistry terms.
        </p>
      </header>

      {/* Interactive Concept Area */}
      <section className="p-8 rounded-2xl border border-brand/20 bg-brand/5 shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-brand" /> Interactive Context
        </h2>
        <div className="text-sidebar-text leading-relaxed p-6 bg-background rounded-xl border border-sidebar-border">
          <p>
            In an SN2 reaction, a strong <TermWithTooltip term="Nucleophile" definition={glossaryData[0].definition} /> attacks 
            an <TermWithTooltip term="Electrophile" definition={glossaryData[1].definition} /> from the backside, leading to an inversion of configuration. 
            This mechanism is heavily affected by <TermWithTooltip term="Steric Hindrance" definition={glossaryData[6].definition} />, 
            which is why tertiary substrates do not undergo SN2. Often, we must consider whether the resulting product is a specific <TermWithTooltip term="Isomer" definition={glossaryData[2].definition} />, 
            such as an <TermWithTooltip term="Enantiomer" definition={glossaryData[3].definition} /> if a chiral center is inverted.
          </p>
        </div>
        <p className="text-xs text-sidebar-text/70 mt-3 flex items-center gap-1">
          <Info className="w-3 h-3" /> Hover over the highlighted terms to see their definitions dynamically.
        </p>
      </section>

      {/* Glossary Search & List */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookA className="w-5 h-5 text-brand" /> Dictionary
          </h2>
          
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-text" />
            <input
              type="text"
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sidebar-border bg-sidebar-bg focus:outline-none focus:ring-2 focus:ring-brand/50 transition-shadow text-sm"
            />
          </div>
        </div>

        <div className="bg-sidebar-bg border border-sidebar-border rounded-2xl overflow-hidden shadow-sm">
          {filteredTerms.length > 0 ? (
            <div className="divide-y divide-sidebar-border">
              {filteredTerms.map((item, idx) => (
                <div key={idx} className="p-6 hover:bg-sidebar-item-hover transition-colors">
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-2">
                    <h3 className="text-lg font-bold text-foreground">{item.term}</h3>
                    <span className="text-xs font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sidebar-text text-sm leading-relaxed max-w-3xl">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-sidebar-text">
              <BookA className="w-12 h-12 mx-auto opacity-20 mb-3" />
              <p>No terms found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
