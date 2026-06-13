import { Inbox } from 'lucide-react'

function EmptyState({ title = 'Nothing here yet', description = 'Create your first interview to see progress here.', action }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
      <span className="mb-4 grid size-12 place-items-center rounded-lg bg-slate-800 text-slate-300">
        <Inbox className="size-6" />
      </span>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export default EmptyState
