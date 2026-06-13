import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { WandSparkles, Loader } from 'lucide-react'
import { interviewService } from '../services/api'

const roles = [
  'Java Developer', 'Frontend Developer', 'Backend Engineer',
  'AWS Engineer', 'DevOps Engineer', 'Full Stack Developer',
  'Data Engineer', 'ML Engineer', 'Python Developer', 'React Developer'
]
const levels = ['Beginner', 'Intermediate', 'Advanced']
const counts = [5, 10, 15]
const types = ['Technical', 'HR', 'Behavioral', 'Mixed', 'Coding']

function CreateInterview() {
  const navigate = useNavigate()
  const [role, setRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [experience, setExperience] = useState('Intermediate')
  const [questionCount, setQuestionCount] = useState(10)
  const [type, setType] = useState('Mixed')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const selectedRole = role === 'Other' ? customRole : role
      if (!selectedRole) {
        setError('Please select or enter a job role')
        setLoading(false)
        return
      }

      const response = await interviewService.create({
        role: selectedRole,
        experience,
        type,
        questionCount,
        techStack: [],
      })

      if (response.data.success) {
        navigate(`/interview?id=${response.data.interview._id}`)
      } else {
        setError(response.data.message || 'Failed to create interview')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="text-sm font-semibold text-indigo-300">Interview Builder</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Create Interview</h1>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-lg p-6">
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-300">
            Job Role
            <select
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              {roles.map((r) => <option key={r}>{r}</option>)}
              <option value="Other">Other</option>
            </select>
            {role === 'Other' && (
              <input
                type="text"
                placeholder="Enter custom role"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                required
              />
            )}
          </label>
          <label className="text-sm font-medium text-slate-300">
            Experience Level
            <select
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              {levels.map((level) => <option key={level}>{level}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-slate-300">Number of Questions</legend>
            <div className="grid grid-cols-3 gap-3">
              {counts.map((count) => (
                <label
                  key={count}
                  className={`cursor-pointer rounded-lg border p-3 text-center text-sm font-semibold transition ${
                    questionCount === count
                      ? 'border-indigo-400 bg-indigo-500/15 text-indigo-200'
                      : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="questionCount"
                    checked={questionCount === count}
                    onChange={() => setQuestionCount(count)}
                  />
                  {count}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-slate-300">Interview Type</legend>
            <div className="grid grid-cols-2 gap-3">
              {types.map((t) => (
                <label
                  key={t}
                  className={`cursor-pointer rounded-lg border p-3 text-center text-sm font-semibold transition ${
                    type === t
                      ? 'border-indigo-400 bg-indigo-500/15 text-indigo-200'
                      : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="type"
                    checked={type === t}
                    onChange={() => setType(t)}
                  />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="focus-ring mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 sm:w-auto"
        >
          {loading ? (
            <Loader className="size-5 animate-spin" />
          ) : (
            <WandSparkles className="size-5" />
          )}
          {loading ? 'Generating with AI...' : 'Generate Interview'}
        </button>
      </form>
    </div>
  )
}

export default CreateInterview