export default function SimulatorPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Exam Simulator</h1>
        <p className="text-sidebar-text">Test your knowledge under timed conditions.</p>
      </header>
      <div className="max-w-2xl mx-auto mt-12 text-center p-12 border border-sidebar-border rounded-3xl bg-sidebar-bg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Ready to start?</h2>
        <p className="text-sidebar-text mb-8">This exam will cover Mechanisms, Synthesis, and Spectroscopy.</p>
        <button className="px-8 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand-hover transition-colors">
          Start Simulator
        </button>
      </div>
    </div>
  );
}
