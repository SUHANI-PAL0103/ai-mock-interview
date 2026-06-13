import { useState, useEffect } from 'react'
import { Award, BarChart3, Edit3, Medal, Trophy, Loader, Save, X } from 'lucide-react'
import ProgressCard from '../components/ProgressCard'
import { useAuth } from '../context/useAuth'
import { interviewService, authService } from '../services/api'

function Profile() {
  const { user, setUser } = useAuth()
  const [stats, setStats] = useState(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await interviewService.stats()
      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setName(user?.name || '')
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await authService.updateProfile({ name })
      if (response.data.success) {
        setUser(response.data.user)
        setEditing(false)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const getAchievements = () => {
    const achievements = []
    if (stats?.completedInterviews >= 1) achievements.push('First Interview Complete')
    if (stats?.completedInterviews >= 5) achievements.push('Quick Learner')
    if (stats?.completedInterviews >= 10) achievements.push('Interview Pro')
    if (stats?.highestScore >= 90) achievements.push('Top Performer')
    if (stats?.averageScore >= 80) achievements.push('Consistent Achiever')
    if (stats?.completedInterviews >= 20) achievements.push('Interview Master')
    return achievements
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
      <section className="glass rounded-lg p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-20 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl font-bold text-white ring-2 ring-indigo-400/50">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-400 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-emerald-500 p-2 text-white hover:bg-emerald-400 disabled:opacity-50"
                  >
                    <Save className="size-4" />
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-slate-500"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <h1 className="text-3xl font-bold text-white">{user?.name || 'User'}</h1>
              )}
              <p className="mt-1 text-slate-400">{user?.email || 'user@example.com'}</p>
              <p className="mt-1 text-xs text-slate-500">
                {user?.isVerified ? '✓ Verified' : '○ Not Verified'}
              </p>
            </div>
          </div>
          <button
            onClick={handleEdit}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 font-semibold text-white hover:bg-indigo-400"
          >
            <Edit3 className="size-5" /> Edit Profile
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <ProgressCard label="Interviews Completed" value={stats?.completedInterviews || 0} icon={Trophy} />
        <ProgressCard label="Average Score" value={`${stats?.averageScore || 0}%`} icon={BarChart3} tone="emerald" />
        <ProgressCard label="Highest Score" value={`${stats?.highestScore || 0}%`} icon={Award} tone="amber" />
      </div>

      <section className="glass rounded-lg p-5">
        <h2 className="text-lg font-semibold text-white">Achievements</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {getAchievements().length > 0 ? (
            getAchievements().map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                <Medal className="size-5 text-amber-300" />
                <span className="font-semibold text-slate-100">{item}</span>
              </div>
            ))
          ) : (
            <p className="col-span-full py-4 text-center text-sm text-slate-400">
              Complete interviews to unlock achievements!
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

export default Profile