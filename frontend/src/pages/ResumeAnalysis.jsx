import { useState } from 'react'
import { FileUp, UploadCloud, Loader, CheckCircle2, AlertTriangle } from 'lucide-react'
import { resumeService } from '../services/api'

function ResumeAnalysis() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError('')
    } else {
      setError('Please upload a PDF file')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await resumeService.analyze(formData)
      if (response.data.success) {
        setResult(response.data.data)
      } else {
        setError(response.data.message || 'Analysis failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError('')
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-indigo-300">Resume Intelligence</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Resume Analysis</h1>
      </div>

      {!result ? (
        <section className="glass rounded-lg p-6">
          <label className="grid cursor-pointer place-items-center rounded-lg border border-dashed border-slate-600 bg-slate-950/60 p-10 text-center hover:border-indigo-400">
            <UploadCloud className="mb-4 size-10 text-indigo-300" />
            <span className="font-semibold text-white">
              {file ? file.name : 'Drag & Drop Resume'}
            </span>
            <span className="mt-2 text-sm text-slate-400">Upload PDF</span>
            <input
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>

          {error && (
            <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {file && (
            <div className="mt-6 flex items-center justify-between rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4">
              <div className="flex items-center gap-3">
                <FileUp className="size-6 text-indigo-300" />
                <div>
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-sm text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
              >
                {uploading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader className="size-4 animate-spin" /> Analyzing...
                  </span>
                ) : (
                  'Analyze'
                )}
              </button>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Results */}
          <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
            <section className="glass rounded-lg p-5">
              <div className="flex items-center gap-3">
                <FileUp className="size-5 text-emerald-300" />
                <h2 className="font-semibold text-white">Resume Score</h2>
              </div>
              <div className="mt-5 flex items-center justify-center">
                <div className="relative">
                  <svg className="size-40 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="45" fill="none"
                      stroke={result.analysis.resumeScore >= 70 ? '#34d399' : result.analysis.resumeScore >= 40 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - result.analysis.resumeScore / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <p className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white">
                    {result.analysis.resumeScore}%
                  </p>
                </div>
              </div>
              <p className="mt-4 text-center text-sm text-slate-400">
                {result.analysis.improvementSummary}
              </p>
              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-center text-sm font-semibold text-indigo-300 hover:text-indigo-200"
                >
                  View Uploaded Resume →
                </a>
              )}
            </section>

            <section className="glass rounded-lg p-5">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-emerald-300">
                    <CheckCircle2 className="size-4" /> Strengths
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.analysis.strengths?.map((item) => (
                      <span key={item} className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-amber-300">
                    <AlertTriangle className="size-4" /> Missing Skills
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.analysis.missingSkills?.map((item) => (
                      <span key={item} className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-indigo-300">ATS Suggestions</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.analysis.atsSuggestions?.map((item) => (
                    <span key={item} className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {result.analysis.recommendedRoles?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-white">Recommended Roles</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.analysis.recommendedRoles.map((role) => (
                      <span key={role} className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
                        {role}
                        {result.analysis.roleMatchPercentages?.[role] && (
                          <span className="ml-1 text-xs opacity-75">
                            {result.analysis.roleMatchPercentages[role]}%
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="text-center">
            <button
              onClick={handleReset}
              className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-200 hover:border-slate-500"
            >
              Analyze Another Resume
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ResumeAnalysis