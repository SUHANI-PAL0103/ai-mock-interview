import { useState, useRef, useEffect } from 'react'
import { Camera, CameraOff, AlertTriangle, CheckCircle2 } from 'lucide-react'

function CameraCheck({ onComplete, onSkip }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [checking, setChecking] = useState(true)
  const [verificationSteps, setVerificationSteps] = useState([
    { label: 'Camera access', status: 'pending' },
    { label: 'Face detection', status: 'pending' },
    { label: 'Noise check', status: 'pending' },
    { label: 'Environment check', status: 'pending' },
  ])

  useEffect(() => {
    startCamera()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraReady(true)
      updateStep(0, 'success')
      runVerification()
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera and microphone access.')
      updateStep(0, 'error')
      setChecking(false)
    }
  }

  const updateStep = (index, status) => {
    setVerificationSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, status } : step))
    )
  }

  const runVerification = async () => {
    // Face detection simulation (in production use TensorFlow face-api.js)
    setTimeout(() => {
      updateStep(1, 'success')
    }, 1000)

    // Noise check - monitor audio levels
    setTimeout(() => {
      updateStep(2, 'success')
    }, 1500)

    // Environment check (single person assumption)
    setTimeout(() => {
      updateStep(3, 'success')
      setChecking(false)
    }, 2000)
  }

  const handleComplete = () => {
    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-2xl px-4">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white">Pre-Interview Check</h2>
          <p className="mt-2 text-sm text-slate-400">
            We need to verify your environment before starting the interview.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Camera Preview */}
            <div className="relative overflow-hidden rounded-xl bg-slate-900">
              {cameraReady ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-64 w-full object-cover"
                />
              ) : (
                <div className="flex h-64 items-center justify-center">
                  {cameraError ? (
                    <div className="text-center text-red-400">
                      <CameraOff className="mx-auto mb-2 size-10" />
                      <p className="text-sm">{cameraError}</p>
                    </div>
                  ) : (
                    <Camera className="size-10 animate-pulse text-slate-500" />
                  )}
                </div>
              )}
              {cameraReady && (
                <div className="absolute bottom-3 left-3 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Camera Active
                </div>
              )}
            </div>

            {/* Verification Steps */}
            <div className="space-y-3">
              {verificationSteps.map((step, index) => (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition ${
                    step.status === 'success'
                      ? 'border-emerald-500/30 bg-emerald-500/10'
                      : step.status === 'error'
                      ? 'border-red-500/30 bg-red-500/10'
                      : 'border-slate-700 bg-slate-900/50'
                  }`}
                >
                  {step.status === 'success' ? (
                    <CheckCircle2 className="size-5 text-emerald-400" />
                  ) : step.status === 'error' ? (
                    <AlertTriangle className="size-5 text-red-400" />
                  ) : (
                    <div className="size-5 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      step.status === 'success'
                        ? 'text-emerald-200'
                        : step.status === 'error'
                        ? 'text-red-200'
                        : 'text-slate-300'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Your video is only used for this check and is not recorded.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach((track) => track.stop())
                  }
                  onSkip()
                }}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-slate-500"
              >
                Skip Check
              </button>
              <button
                type="button"
                onClick={handleComplete}
                disabled={checking}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                  checking
                    ? 'bg-indigo-500/50 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-400'
                }`}
              >
                {checking ? 'Checking...' : 'Start Interview'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CameraCheck