import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Download, Loader, ArrowLeft, AlertCircle } from 'lucide-react'
import ScoreCard from '../components/ScoreCard'
import { interviewService } from '../services/api'

function Result() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const interviewId = searchParams.get('id')

  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!interviewId) {
      navigate('/dashboard')
      return
    }
    fetchResult()
  }, [interviewId])

  const fetchResult = async () => {
    try {
      const response = await interviewService.get(interviewId)
      if (response.data.success) {
        setInterview(response.data.interview)
      } else {
        setError('Result not found')
      }
    } catch (err) {
      setError('Failed to load result')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = () => {
    if (!interview) return
    const report = {
      role: interview.role,
      experience: interview.experience,
      type: interview.type,
      date: new Date(interview.createdAt).toLocaleDateString(),
      overallScore: interview.overallScore,
      technicalScore: interview.overallTechnicalScore,
      communicationScore: interview.overallCommunicationScore,
      problemSolvingScore: interview.overallProblemSolvingScore,
      confidenceScore: interview.overallConfidenceScore,
      questions: interview.questions.map((q) => ({
        question: q.question,
        answer: q.answer,
        feedback: q.feedback,
        score: q.score,
      })),
      summaryReport: interview.summaryReport,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview-report-${interview.role}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader className="size-8 animate-spin text-indigo-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="size-12 text-red-400" />
        <p className="text-lg text-red-300">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-400"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const scoreCategories = [
    ['Overall', interview?.overallScore || 0, 'bg-gradient-to-br from-indigo-500 to-violet-400'],
    ['Technical', interview?.overallTechnicalScore || 0, 'bg-emerald-500'],
    ['Communication', interview?.overallCommunicationScore || 0, 'bg-amber-500'],
    ['Problem Solving', interview?.overallProblemSolvingScore || 0, 'bg-violet-500'],
    ['Confidence', interview?.overallConfidenceScore || 0, 'bg-cyan-500'],
  ]

  const summary = interview?.summaryReport

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="size-4" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="glass rounded-lg p-6">
        <p className="text-sm font-semibold text-emerald-300">Interview Completed</p>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Overall Score: {interview?.overallScore || 0}%
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {interview?.role} · {interview?.experience} · {interview?.type}
            </p>
            {summary?.overallFeedback && (
              <p className="mt-2 text-slate-300">{summary.overallFeedback}</p>
            )}
          </div>
          <button
            onClick={handleDownloadReport}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 font-semibold text-white hover:bg-indigo-400"
          >
            <Download className="size-5" /> Download Report
          </button>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {scoreCategories.map(([label, value, color]) => (
          <ScoreCard key={label} label={label} value={value} color={color} />
        ))}
      </div>

      {/* Summary Report */}
      {summary && (
        <section className="grid gap-4 lg:grid-cols-3">
          {summary.strengths?.length > 0 && (
            <div className="glass rounded-lg p-5">
              <h2 className="font-semibold text-emerald-300">✓ Strengths</h2>
              <ul className="mt-3 space-y-2">
                {summary.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-slate-400">• {s}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.weaknesses?.length > 0 && (
            <div className="glass rounded-lg p-5">
              <h2 className="font-semibold text-amber-300">⚠ Areas to Improve</h2>
              <ul className="mt-3 space-y-2">
                {summary.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-slate-400">• {w}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.improvementSuggestions?.length > 0 && (
            <div className="glass rounded-lg p-5">
              <h2 className="font-semibold text-indigo-300">★ Suggestions</h2>
              <ul className="mt-3 space-y-2">
                {summary.improvementSuggestions.map((s, i) => (
                  <li key={i} className="text-sm text-slate-400">• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Learning Roadmap */}
      {summary?.learningRoadmap?.length > 0 && (
        <section className="glass rounded-lg p-5">
          <h2 className="text-lg font-semibold text-white">
            Personalised Learning Roadmap
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Career Readiness: <span className="font-semibold text-indigo-300">{summary.careerReadiness}</span>
          </p>
          <div className="mt-4 space-y-3">
            {summary.learningRoadmap.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-300">
                  {index + 1}
                </div>
                <p className="mt-1.5 text-sm text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Question-wise Analysis */}
      <section className="glass rounded-lg p-5">
        <h2 className="text-lg font-semibold text-white">Question-wise Analysis</h2>
        <div className="mt-4 space-y-3">
          {interview?.questions?.map((q, index) => (
            <div key={index} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">Q{index + 1}.</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      q.difficulty === 'hard' ? 'bg-red-500/10 text-red-300' :
                      q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-300' :
                      'bg-amber-500/10 text-amber-300'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-200">{q.question}</p>
                  {q.answer && (
                    <div className="mt-2 rounded-lg bg-slate-900/50 p-3">
                      <p className="text-xs text-slate-500">Your answer:</p>
                      <p className="mt-1 text-sm text-slate-300">{q.answer}</p>
                    </div>
                  )}
                  {q.feedback && (
                    <p className="mt-2 text-sm text-slate-400 italic">{q.feedback}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${
                    q.score >= 70 ? 'bg-emerald-500/10 text-emerald-300' :
                    q.score >= 40 ? 'bg-amber-500/10 text-amber-300' :
                    'bg-red-500/10 text-red-300'
                  }`}>
                    {q.score}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Result