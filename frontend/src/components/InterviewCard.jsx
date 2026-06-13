import { ArrowRight, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

function InterviewCard({ role, date, score, status = 'Completed' }) {
  return (
    <article className="glass rounded-lg p-5 transition hover:-translate-y-0.5 hover:border-indigo-400/40">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">{role}</h3>
          <p className="mt-1 text-sm text-slate-400">{date}</p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">{status}</span>
      </div>
      <div className="mb-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-slate-400">Score</span>
          <span className="font-semibold text-white">{score}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800">
          <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${score}%` }} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="/result" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400">
          View Report
          <ArrowRight className="size-4" />
        </Link>
        <Link to="/interview" className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500">
          <RotateCcw className="size-4" />
          Retake
        </Link>
      </div>
    </article>
  )
}

export default InterviewCard
