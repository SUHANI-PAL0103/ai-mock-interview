import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Award, BarChart3, CheckCircle2, ClipboardList, Plus, Target, TrendingUp, Loader } from 'lucide-react'
import InterviewCard from '../components/InterviewCard'
import ProgressCard from '../components/ProgressCard'
import { useAuth } from '../context/useAuth'
import { interviewService } from '../services/api'

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentInterviews, setRecentInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const statsRes = await interviewService.stats()
      if (statsRes.data.success) {
        setStats(statsRes.data.stats)
      }

      const interviewsRes = await interviewService.list({ status: 'completed' })
      if (interviewsRes.data.success) {
        setRecentInterviews(interviewsRes.data.interviews.slice(-3).reverse())
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader className="size-8 animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-indigo-300">
            Welcome Back {user?.name?.split(' ')[0] || 'User'}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">Interview Dashboard</h1>
        </div>
        <Link
          to="/create-interview"
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 font-semibold text-white hover:bg-indigo-400"
        >
          <Plus className="size-5" /> Create Interview
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ProgressCard label="Total Interviews" value={stats?.totalInterviews || 0} icon={ClipboardList} />
        <ProgressCard label="Average Score" value={`${stats?.averageScore || 0}%`} icon={BarChart3} tone="emerald" />
        <ProgressCard label="Highest Score" value={`${stats?.highestScore || 0}%`} icon={Award} tone="amber" />
        <ProgressCard label="Completed" value={stats?.completedInterviews || 0} icon={CheckCircle2} tone="violet" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {recentInterviews.length > 0 ? (
          recentInterviews.map((interview) => (
            <InterviewCard
              key={interview._id}
              role={interview.role}
              date={new Date(interview.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
              })}
              score={interview.overallScore}
            />
          ))
        ) : (
          <div className="glass col-span-full flex flex-col items-center justify-center rounded-lg p-10 text-center">
            <TrendingUp className="mb-3 size-10 text-slate-500" />
            <p className="text-slate-400">No interviews yet. Start your first interview!</p>
            <Link to="/create-interview" className="mt-4 text-sm font-semibold text-indigo-300">
              Create Interview
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass rounded-lg p-5">
          <h2 className="text-lg font-semibold text-white">Performance Trend</h2>
          <div className="mt-6 flex h-56 items-end gap-3">
            {[54, 66, 71, 78, 84, 88, 92].map((height, index) => (
              <div key={height} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-violet-400"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-slate-500">S{index + 1}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="glass rounded-lg p-5">
          <h2 className="text-lg font-semibold text-white">Skill Progress</h2>
          <div className="mt-6 space-y-5">
            {[
              ['Communication', stats?.averageScore || 0],
              ['Technical Skills', stats?.averageScore ? Math.min(stats.averageScore + 10, 100) : 0],
              ['Confidence', stats?.averageScore ? Math.max(stats.averageScore - 5, 0) : 0],
              ['Problem Solving', stats?.averageScore ? Math.min(stats.averageScore + 5, 100) : 0],
            ].map(([skill, value]) => (
              <div key={skill}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-300">{skill}</span>
                  <span className="text-white">{value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="glass flex flex-col gap-4 rounded-lg p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Target className="size-5 text-indigo-300" />
          <p className="text-sm text-slate-300">
            {stats?.highestScore >= 90
              ? 'Excellent work! Keep challenging yourself with harder interviews.'
              : 'Next goal: reach a 90% average in mixed technical interviews.'}
          </p>
        </div>
        <Link to="/create-interview" className="text-sm font-semibold text-indigo-300">
          Start Practice
        </Link>
      </div>
    </div>
  )
}

export default Dashboard