export default function GlossaryPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Glossary</h1>
        <p className="text-sidebar-text">Comprehensive dictionary of organic chemistry terms.</p>
      </header>
      
      <div className="space-y-4">
        {['A', 'B', 'C'].map(letter => (
          <div key={letter} className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg">
            <h2 className="text-2xl font-bold mb-4 text-brand">{letter}</h2>
            <div className="space-y-4">
              <div className="border-b border-sidebar-border pb-4 last:border-0 last:pb-0">
                <h4 className="font-semibold text-lg">Acetal</h4>
                <p className="text-sidebar-text mt-1">A functional group consisting of a carbon atom bonded to two alkoxy groups (OR) and two substituents (R or H).</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
