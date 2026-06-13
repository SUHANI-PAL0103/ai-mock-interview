function QuestionCard({ index, total, question, category, difficulty }) {
  const difficultyColor =
    difficulty === 'hard'
      ? 'bg-red-500/10 text-red-300'
      : difficulty === 'easy'
      ? 'bg-emerald-500/10 text-emerald-300'
      : 'bg-amber-500/10 text-amber-300'

  return (
    <div className="glass rounded-lg border-l-4 border-l-indigo-500 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
          Question {index} of {total}
        </span>
        {category && (
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 uppercase">
            {category}
          </span>
        )}
        {difficulty && (
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyColor}`}>
            {difficulty}
          </span>
        )}
      </div>
      <p className="mt-4 text-lg font-semibold leading-7 text-white">{question}</p>
    </div>
  )
}

export default QuestionCard