export default function DashboardPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-sidebar-text">Welcome back! Continue your organic chemistry journey.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg hover:border-brand/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center mb-4">
              <div className="w-5 h-5 bg-brand rounded-full" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Recent Module {i}</h3>
            <p className="text-sm text-sidebar-text mb-4">Review the fundamentals of stereochemistry and chiral centers.</p>
            <div className="w-full bg-sidebar-item-active rounded-full h-2">
              <div className="bg-brand h-2 rounded-full" style={{ width: `${i * 25}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
