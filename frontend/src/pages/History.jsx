import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Eye, RotateCcw, Search, Trash2, Loader } from 'lucide-react'
import { interviewService } from '../services/api'

function History() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter

      const response = await interviewService.list(params)
      if (response.data.success) {
        setInterviews(response.data.interviews)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this interview?')) return
    try {
      await interviewService.delete(id)
      setInterviews((prev) => prev.filter((i) => i._id !== id))
    } catch (error) {
      console.error('Failed to delete interview:', error)
    }
  }

  const handleSearch = (value) => {
    setSearch(value)
    setTimeout(fetchInterviews, 300)
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader className="size-8 animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-indigo-300">Archive</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Interview History</h1>
      </div>

      <section className="glass rounded-lg p-5">
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_14rem]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              placeholder="Search by role"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </label>
          <select
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setTimeout(fetchInterviews, 300)
            }}
          >
            <option value="">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {interviews.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            No interviews found. Start your first interview!
          </div>
        ) : (
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <th className="py-3 font-medium">Date</th>
                  <th className="py-3 font-medium">Role</th>
                  <th className="py-3 font-medium">Type</th>
                  <th className="py-3 font-medium">Score</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((interview) => (
                  <tr key={interview._id} className="border-b border-slate-900 text-slate-200">
                    <td className="py-4">
                      {new Date(interview.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 font-semibold text-white">{interview.role}</td>
                    <td className="py-4">
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                        {interview.type || 'Mixed'}
                      </span>
                    </td>
                    <td className="py-4">
                      {interview.status === 'completed' ? (
                        <span className={`font-semibold ${
                          interview.overallScore >= 70 ? 'text-emerald-300' :
                          interview.overallScore >= 40 ? 'text-amber-300' : 'text-red-300'
                        }`}>
                          {interview.overallScore}%
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        interview.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-300'
                          : 'bg-amber-500/10 text-amber-300'
                      }`}>
                        {interview.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        {interview.status === 'completed' ? (
                          <Link
                            to={`/result?id=${interview._id}`}
                            className="grid size-9 place-items-center rounded-lg border border-slate-700 text-slate-300 hover:border-indigo-400 hover:text-indigo-200"
                            aria-label="View"
                          >
                            <Eye className="size-4" />
                          </Link>
                        ) : (
                          <Link
                            to={`/interview?id=${interview._id}`}
                            className="grid size-9 place-items-center rounded-lg border border-slate-700 text-slate-300 hover:border-indigo-400 hover:text-indigo-200"
                            aria-label="Continue"
                          >
                            <Eye className="size-4" />
                          </Link>
                        )}
                        <Link
                          to="/create-interview"
                          className="grid size-9 place-items-center rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500"
                          aria-label="Retake"
                        >
                          <RotateCcw className="size-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(interview._id)}
                          className="grid size-9 place-items-center rounded-lg border border-slate-700 text-slate-300 hover:border-red-400 hover:text-red-200"
                          aria-label="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default History