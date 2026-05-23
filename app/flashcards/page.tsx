export default function FlashcardsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Flashcards</h1>
        <p className="text-sidebar-text">Spaced repetition for functional groups and reagents.</p>
      </header>
      
      <div className="flex justify-center mt-12">
        <div className="w-full max-w-lg aspect-[4/3] rounded-3xl border border-sidebar-border bg-sidebar-bg shadow-md flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
          <div className="text-center">
            <span className="text-5xl block mb-6">🧪</span>
            <h3 className="text-2xl font-bold">Grignard Reagent</h3>
            <p className="text-sm text-sidebar-text mt-4 opacity-0">Click to flip</p>
          </div>
        </div>
      </div>
    </div>
  );
}
