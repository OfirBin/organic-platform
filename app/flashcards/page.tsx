"use client";

import { useState } from "react";
import { 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  BrainCircuit,
  Trophy,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

type Flashcard = {
  id: number;
  term: string;
  definition: string;
  category: string;
};

const mockCards: Flashcard[] = [
  { id: 1, term: "Methane", definition: "CH4 - Alkane with 1 carbon atom", category: "Alkanes" },
  { id: 2, term: "Ethane", definition: "C2H6 - Alkane with 2 carbon atoms", category: "Alkanes" },
  { id: 3, term: "Propane", definition: "C3H8 - Alkane with 3 carbon atoms", category: "Alkanes" },
  { id: 4, term: "Butane", definition: "C4H10 - Alkane with 4 carbon atoms", category: "Alkanes" },
  { id: 5, term: "Pentane", definition: "C5H12 - Alkane with 5 carbon atoms", category: "Alkanes" },
  { id: 6, term: "Hexane", definition: "C6H14 - Alkane with 6 carbon atoms", category: "Alkanes" },
  { id: 7, term: "Heptane", definition: "C7H16 - Alkane with 7 carbon atoms", category: "Alkanes" },
  { id: 8, term: "Octane", definition: "C8H18 - Alkane with 8 carbon atoms", category: "Alkanes" },
  { id: 9, term: "Nonane", definition: "C9H20 - Alkane with 9 carbon atoms", category: "Alkanes" },
  { id: 10, term: "Decane", definition: "C10H22 - Alkane with 10 carbon atoms", category: "Alkanes" },
  { id: 11, term: "Undecane", definition: "C11H24 - Alkane with 11 carbon atoms", category: "Alkanes" },
  { id: 12, term: "Dodecane", definition: "C12H26 - Alkane with 12 carbon atoms", category: "Alkanes" },
  { id: 13, term: "Hydroxyl", definition: "-OH group, characteristic of alcohols", category: "Functional Groups" },
  { id: 14, term: "Carbonyl", definition: "C=O group, found in ketones and aldehydes", category: "Functional Groups" },
  { id: 15, term: "Carboxyl", definition: "-COOH group, characteristic of carboxylic acids", category: "Functional Groups" },
];

export default function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const currentCard = mockCards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < mockCards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0); // Reset for demo purposes
      }
    }, 150); // slight delay to allow flip animation to reset invisibly
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }, 150);
  };

  const handleGotIt = () => {
    setMasteredCount(prev => prev + 1);
    handleNextCard();
  };

  const handleNeedsReview = () => {
    setReviewCount(prev => prev + 1);
    handleNextCard();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-4rem)] flex flex-col">
      <header className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Flashcards</h1>
          <p className="text-sidebar-text text-sm">
            Master IUPAC nomenclature and functional groups with active recall.
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-500 px-4 py-2 rounded-xl text-sm font-medium border border-green-500/20">
            <Trophy className="w-4 h-4" />
            Mastered: {masteredCount}
          </div>
          <div className="flex items-center gap-2 bg-orange-500/10 text-orange-600 dark:text-orange-500 px-4 py-2 rounded-xl text-sm font-medium border border-orange-500/20">
            <BrainCircuit className="w-4 h-4" />
            Review: {reviewCount}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-8">
        
        {/* Flashcard Container (3D perspective) */}
        <div className="w-full max-w-2xl aspect-[3/2] perspective-1000 mb-8">
          
          {/* Inner Card (animates transform) */}
          <div 
            className="w-full h-full relative transition-transform duration-700 cursor-pointer shadow-lg rounded-3xl"
            style={{ 
              transformStyle: 'preserve-3d', 
              WebkitTransformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
            onClick={handleFlip}
          >
            
            {/* Front of Card */}
            <div 
              className="absolute inset-0 bg-sidebar-bg border-2 border-sidebar-border rounded-3xl p-8 flex flex-col" 
              style={{ 
                backfaceVisibility: 'hidden', 
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)'
              }}
            >
              <div className="flex justify-between items-center text-sidebar-text text-sm font-medium mb-auto">
                <span className="uppercase tracking-wider text-brand">{currentCard.category}</span>
                <span>Card {currentIndex + 1} of {mockCards.length}</span>
              </div>
              
              <div className="text-center my-auto">
                <h2 className="text-5xl font-bold text-foreground mb-4">{currentCard.term}</h2>
                <p className="text-sidebar-text/70 text-sm">Click to flip</p>
              </div>
              
              <div className="mt-auto flex justify-center text-sidebar-text opacity-50">
                <RotateCcw className="w-6 h-6" />
              </div>
            </div>

            {/* Back of Card */}
            <div 
              className="absolute inset-0 bg-brand/5 border-2 border-brand/30 rounded-3xl p-8 flex flex-col" 
              style={{ 
                backfaceVisibility: 'hidden', 
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="flex justify-between items-center text-sidebar-text text-sm font-medium mb-auto">
                <span className="uppercase tracking-wider text-brand">Definition</span>
              </div>
              
              <div className="text-center my-auto">
                <p className="text-3xl font-medium text-foreground leading-relaxed">
                  {currentCard.definition}
                </p>
              </div>
              
              <div className="mt-auto flex justify-center text-brand opacity-80">
                <RotateCcw className="w-6 h-6" />
              </div>
            </div>

          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-2xl flex items-center justify-between gap-4">
          <button 
            onClick={handlePrevCard}
            disabled={currentIndex === 0}
            className="p-4 rounded-full bg-sidebar-bg border border-sidebar-border text-sidebar-text hover:text-foreground hover:bg-sidebar-item-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex gap-4">
            <button 
              onClick={handleNeedsReview}
              className="flex items-center gap-2 px-6 py-3 bg-sidebar-bg border-2 border-orange-500/50 text-orange-600 dark:text-orange-500 font-semibold rounded-xl hover:bg-orange-500/10 transition-colors shadow-sm"
            >
              <XCircle className="w-5 h-5" /> Needs Review
            </button>
            <button 
              onClick={handleGotIt}
              className="flex items-center gap-2 px-8 py-3 bg-brand text-white font-semibold rounded-xl hover:bg-brand-hover transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5" /> Got It
            </button>
          </div>

          <button 
            onClick={handleNextCard}
            className="p-4 rounded-full bg-sidebar-bg border border-sidebar-border text-sidebar-text hover:text-foreground hover:bg-sidebar-item-hover transition-colors shadow-sm"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
}
