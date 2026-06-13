import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Mic, Send, Timer, Loader, AlertCircle, CheckCircle2 } from 'lucide-react'
import QuestionCard from '../components/QuestionCard'
import CameraCheck from '../components/CameraCheck'
import { interviewService } from '../services/api'

const QUESTION_TIME = 120 // 2 minutes per question

function Interview() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const interviewId = searchParams.get('id')

  const [interview, setInterview] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [evaluations, setEvaluations] = useState({})
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showCameraCheck, setShowCameraCheck] = useState(true)
  const [feedback, setFeedback] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [followUps, setFollowUps] = useState([])
  const timerRef = useRef(null)

  useEffect(() => {
    if (!interviewId) {
      navigate('/create-interview')
      return
    }
    fetchInterview()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [interviewId])

  useEffect(() => {
    if (interview && !showCameraCheck) {
      startTimer()
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentIndex, interview, showCameraCheck])

  const fetchInterview = async () => {
    try {
      const response = await interviewService.get(interviewId)
      if (response.data.success) {
        setInterview(response.data.interview)
        setAnswers({})
        setEvaluations({})
        setTimeLeft(QUESTION_TIME)
        setFeedback(null)
        setShowFeedback(false)
      } else {
        setError('Interview not found')
      }
    } catch (err) {
      setError('Failed to load interview')
    } finally {
      setLoading(false)
    }
  }

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeLeft(QUESTION_TIME)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleAutoSubmit = () => {
    const currentAnswer = answers[currentIndex] || ''
    if (currentAnswer.trim()) {
      submitCurrentAnswer(currentAnswer)
    }
  }

  const submitCurrentAnswer = async (answer) => {
    if (evaluating || !interview || !interview.questions[currentIndex]) return
    setEvaluating(true)

    try {
      const response = await interviewService.submitAnswer(interviewId, {
        questionIndex: currentIndex,
        answer,
      })

      if (response.data.success) {
        const { evaluation, followUp } = response.data
        setEvaluations((prev) => ({ ...prev, [currentIndex]: evaluation }))
        setFeedback(evaluation)
        setShowFeedback(true)

        if (followUp) {
          setFollowUps((prev) => [...prev, followUp])
        }
      }
    } catch (err) {
      console.error('Submit answer error:', err)
    } finally {
      setEvaluating(false)
    }
  }

  const handleNext = async () => {
    const currentAnswer = answers[currentIndex] || ''

    if (currentAnswer.trim() && !evaluations[currentIndex]) {
      await submitCurrentAnswer(currentAnswer)
    }

    // Check if there are follow-ups to insert
    const allQuestions = [...(interview?.questions || []), ...followUps]
    const nextIndex = currentIndex + 1

    if (nextIndex < allQuestions.length) {
      setCurrentIndex(nextIndex)
      setShowFeedback(false)
      setFeedback(null)
      setTimeLeft(QUESTION_TIME)
    } else {
      // All questions done
      handleSubmitInterview()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setShowFeedback(false)
      setFeedback(null)
      setTimeLeft(QUESTION_TIME)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const handleSubmitInterview = async () => {
    setSubmitting(true)
    try {
      // Submit any remaining unanswered questions
      for (let i = 0; i < (interview?.questions?.length || 0); i++) {
        if (answers[i]?.trim() && !evaluations[i]) {
          await interviewService.submitAnswer(interviewId, {
            questionIndex: i,
            answer: answers[i],
          })
        }
      }

      const response = await interviewService.submit(interviewId)
      if (response.data.success) {
        navigate(`/result?id=${interviewId}`)
      } else {
        setError('Failed to submit interview')
      }
    } catch (err) {
      setError('Failed to submit interview')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAnswerChange = (value) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: value }))
  }

  const handleCameraComplete = () => {
    setShowCameraCheck(false)
  }

  const handleCameraSkip = () => {
    setShowCameraCheck(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
          onClick={() => navigate('/create-interview')}
          className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-400"
        >
          Create New Interview
        </button>
      </div>
    )
  }

  if (showCameraCheck) {
    return <CameraCheck onComplete={handleCameraComplete} onSkip={handleCameraSkip} />
  }

  const allQuestions = [...(interview?.questions || []), ...followUps]
  const currentQuestion = allQuestions[currentIndex]
  const totalQuestions = allQuestions.length
  const progress = ((currentIndex + 1) / totalQuestions) * 100
  const isLastQuestion = currentIndex >= totalQuestions - 1

  if (!currentQuestion) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader className="size-8 animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-indigo-300">{interview?.type || 'Mixed'} Interview</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{interview?.role} Practice</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-200">
            <span className="text-xs text-slate-400">Q {currentIndex + 1}/{totalQuestions}</span>
          </div>
          <div
            className={`inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2 font-semibold ${
              timeLeft <= 10
                ? 'border border-red-400/30 bg-red-500/10 text-red-200'
                : 'border border-amber-400/30 bg-amber-500/10 text-amber-200'
            }`}
          >
            <Timer className="size-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-slate-800">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <QuestionCard
        index={currentIndex + 1}
        total={totalQuestions}
        question={currentQuestion.question}
        category={currentQuestion.category}
        difficulty={currentQuestion.difficulty}
      />

      {/* Feedback Banner */}
      {showFeedback && feedback && (
        <div
          className={`rounded-lg border p-4 ${
            feedback.score >= 70
              ? 'border-emerald-500/30 bg-emerald-500/10'
              : feedback.score >= 40
              ? 'border-amber-500/30 bg-amber-500/10'
              : 'border-red-500/30 bg-red-500/10'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {feedback.score >= 70 ? (
                <CheckCircle2 className="size-5 text-emerald-400" />
              ) : (
                <AlertCircle className="size-5 text-amber-400" />
              )}
              <span className="font-semibold text-white">Score: {feedback.score}/100</span>
            </div>
            <button
              onClick={() => setShowFeedback(false)}
              className="text-sm text-slate-400 hover:text-white"
            >
              Hide
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-400">{feedback.feedback}</p>
          {feedback.strengths?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {feedback.strengths.map((s, i) => (
                <span key={i} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Answer Section */}
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <section className="glass rounded-lg p-5">
          <label className="text-sm font-medium text-slate-300">
            Your Answer
            <textarea
              className="mt-3 min-h-80 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-4 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              placeholder="Type your answer here..."
              value={answers[currentIndex] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              disabled={evaluating}
            />
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-3 font-semibold text-slate-200 hover:border-slate-500 disabled:opacity-30"
            >
              <ChevronLeft className="size-5" /> Previous
            </button>

            <button
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-3 font-semibold text-slate-200 hover:border-slate-500"
              title="Voice input (coming soon)"
            >
              <Mic className="size-5" /> Microphone
            </button>

            {evaluating ? (
              <button
                disabled
                className="focus-ring inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 font-semibold text-white opacity-50"
              >
                <Loader className="size-5 animate-spin" /> Evaluating...
              </button>
            ) : isLastQuestion ? (
              <button
                onClick={handleSubmitInterview}
                disabled={submitting}
                className="focus-ring inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
              >
                <Send className="size-5" /> {submitting ? 'Submitting...' : 'Submit Interview'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="focus-ring inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 font-semibold text-white hover:bg-indigo-400"
              >
                Next Question <ChevronRight className="size-5" />
              </button>
            )}
          </div>
        </section>

        {/* Question Navigation */}
        <aside className="glass rounded-lg p-5">
          <h2 className="font-semibold text-white">Progress</h2>
          <div className="mt-4 grid grid-cols-5 gap-2 lg:grid-cols-3">
            {allQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setShowFeedback(false)
                  setFeedback(null)
                  setTimeLeft(QUESTION_TIME)
                  if (timerRef.current) clearInterval(timerRef.current)
                }}
                className={`grid size-10 place-items-center rounded-lg text-sm font-semibold transition ${
                  index === currentIndex
                    ? 'bg-indigo-500 text-white'
                    : evaluations[index]
                    ? evaluations[index].score >= 70
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                    : answers[index]?.trim()
                    ? 'bg-slate-700 text-slate-200'
                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Answered/Unanswered Legend */}
          <div className="mt-4 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-indigo-500" /> Current
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-emerald-500/50" /> Good (70+)
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-amber-500/50" /> Needs Work
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-slate-700" /> Answered
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-slate-800" /> Unanswered
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Interview