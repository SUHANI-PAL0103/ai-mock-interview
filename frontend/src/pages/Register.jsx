import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../services/api'

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('register') // register | verify
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/register', { name, email, password })

      if (response.data.success) {
        setStep('verify')
        setLoading(false)
        startResendTimer()
      } else {
        setError(response.data.message || 'Registration failed')
        setLoading(false)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleOTPSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/verify-otp', { email, otp })
      if (response.data.success) {
        // Redirect to login after successful verification
        navigate('/login', { state: { verified: true } })
      } else {
        setError(response.data.message || 'Invalid OTP')
        setLoading(false)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed')
      setLoading(false)
    }
  }

  const startResendTimer = () => {
    setResendTimer(30)
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleResendOTP = async () => {
    setLoading(true)
    try {
      await api.post('/auth/send-otp', { email })
      setResendTimer(30)
      startResendTimer()
    } catch (err) {
      setError('Failed to resend OTP')
    }
    setLoading(false)
  }

  if (step === 'verify') {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center px-4 py-12">
        <form onSubmit={handleOTPSubmit} className="glass w-full rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white">Verify Email</h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter the 6-digit code sent to <strong className="text-indigo-300">{email}</strong>
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm text-slate-300">
              OTP Code
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white focus:border-indigo-400 focus:outline-none"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="focus-ring mt-6 w-full rounded-lg bg-indigo-500 px-4 py-3 font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className="mt-4 text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-slate-400">Resend OTP in {resendTimer}s</p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm font-semibold text-indigo-300 hover:text-indigo-200 disabled:opacity-50"
              >
                Resend OTP
              </button>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already verified? <Link to="/login" className="font-semibold text-indigo-300">Login</Link>
          </p>
        </form>
      </section>
    )
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center px-4 py-12">
      <form onSubmit={handleSubmit} className="glass w-full rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white">Create Account</h1>
        <p className="mt-2 text-sm text-slate-400">Set up your interview training workspace.</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <label className="block text-sm text-slate-300">
            Name
            <input
              type="text"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm text-slate-300">
            Email
            <input
              type="email"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm text-slate-300">
            Password
            <input
              type="password"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm text-slate-300">
            Confirm Password
            <input
              type="password"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="focus-ring mt-6 w-full rounded-lg bg-indigo-500 px-4 py-3 font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already registered? <Link to="/login" className="font-semibold text-indigo-300">Login</Link>
        </p>
      </form>
    </section>
  )
}

export default Register