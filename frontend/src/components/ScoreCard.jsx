function ScoreCard({ label, value, color = 'bg-indigo-500' }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-3 flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-white">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default ScoreCard
