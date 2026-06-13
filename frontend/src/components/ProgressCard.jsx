function ProgressCard({ label, value, icon: Icon, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-500/15 text-indigo-200',
    emerald: 'bg-emerald-500/15 text-emerald-200',
    amber: 'bg-amber-500/15 text-amber-200',
    violet: 'bg-violet-500/15 text-violet-200',
  }

  return (
    <div className="glass rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        {Icon && (
          <span className={`grid size-9 place-items-center rounded-lg ${tones[tone]}`}>
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

export default ProgressCard
