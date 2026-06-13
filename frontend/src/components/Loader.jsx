function Loader({ label = 'Loading' }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-4 text-slate-300">
      <span className="size-10 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export default Loader
