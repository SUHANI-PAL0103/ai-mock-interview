import { useState } from 'react'
import { FileUp, UploadCloud, Loader, CheckCircle2, AlertTriangle, Briefcase } from 'lucide-react'
import { resumeService } from '../services/api'

function ResumeAnalysis() {
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
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
      if (jobDescription.trim()) {
        formData.append('jobDescription', jobDescription.trim())
      }

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
    setJobDescription('')
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
        <div className="space-y-6">
          {/* Upload Resume */}
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
          </section>

          {/* Job Description Input */}
          <section className="glass rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Briefcase className="size-5 text-indigo-300" />
              <h2 className="font-semibold text-white">Job Description (Optional)</h2>
            </div>
            <p className="mb-4 text-sm text-slate-400">
              Paste the job description here to get a targeted ATS score — how well your resume matches the specific role. If left empty, a general resume quality score will be provided.
            </p>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here for ATS keyword matching and role fit analysis..."
              rows={6}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-400 focus:outline-none resize-none"
            />
          </section>

          {file && (
            <div className="flex items-center justify-between rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4">
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
        </div>
      ) : (
        <>
          {/* Results Section */}
          <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
            {/* Left Sidebar - Scores */}
            <section className="glass rounded-lg p-5">
              <div className="flex items-center gap-3">
                <FileUp className="size-5 text-emerald-300" />
                <h2 className="font-semibold text-white">Scores</h2>
              </div>

              {/* Overall Resume Score */}
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

              {/* ATS Score - when JD is provided */}
              {result.analysis.atsScore !== undefined && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">ATS Score</span>
                    <span className={`font-semibold ${
                      result.analysis.atsScore >= 70 ? 'text-emerald-300' : result.analysis.atsScore >= 40 ? 'text-amber-300' : 'text-red-400'
                    }`}>
                      {result.analysis.atsScore}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-slate-700">
                    <div
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${result.analysis.atsScore}%`,
                        backgroundColor: result.analysis.atsScore >= 70 ? '#34d399' : result.analysis.atsScore >= 40 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Sub-scores */}
              <div className="mt-4 space-y-3">
                {result.analysis.keywordMatch !== undefined && (
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Keyword Match</span>
                      <span className={`font-semibold ${
                        result.analysis.keywordMatch >= 70 ? 'text-emerald-300' : result.analysis.keywordMatch >= 40 ? 'text-amber-300' : 'text-red-400'
                      }`}>
                        {result.analysis.keywordMatch}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-slate-700">
                      <div
                        className="h-1.5 rounded-full transition-all duration-1000"
                        style={{
                          width: `${result.analysis.keywordMatch}%`,
                          backgroundColor: result.analysis.keywordMatch >= 70 ? '#34d399' : result.analysis.keywordMatch >= 40 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                )}
                {result.analysis.formattingScore !== undefined && (
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Formatting</span>
                      <span className={`font-semibold ${
                        result.analysis.formattingScore >= 70 ? 'text-emerald-300' : result.analysis.formattingScore >= 40 ? 'text-amber-300' : 'text-red-400'
                      }`}>
                        {result.analysis.formattingScore}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-slate-700">
                      <div
                        className="h-1.5 rounded-full transition-all duration-1000"
                        style={{
                          width: `${result.analysis.formattingScore}%`,
                          backgroundColor: result.analysis.formattingScore >= 70 ? '#34d399' : result.analysis.formattingScore >= 40 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                )}
                {result.analysis.experienceRelevance !== undefined && (
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Experience Relevance</span>
                      <span className={`font-semibold ${
                        result.analysis.experienceRelevance >= 70 ? 'text-emerald-300' : result.analysis.experienceRelevance >= 40 ? 'text-amber-300' : 'text-red-400'
                      }`}>
                        {result.analysis.experienceRelevance}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-slate-700">
                      <div
                        className="h-1.5 rounded-full transition-all duration-1000"
                        style={{
                          width: `${result.analysis.experienceRelevance}%`,
                          backgroundColor: result.analysis.experienceRelevance >= 70 ? '#34d399' : result.analysis.experienceRelevance >= 40 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-4 text-center text-sm text-slate-400">
                {result.analysis.improvementSummary}
              </p>
            </section>

            {/* Right Side - Details */}
            <section className="glass rounded-lg p-5 space-y-6">
              {/* Strengths & Missing Skills */}
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

              {/* ATS Breakdown */}
              {result.analysis.atsBreakdown && (
                <div className="border-t border-slate-700/50 pt-6">
                  <h3 className="font-semibold text-indigo-300 mb-4">ATS Breakdown</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-300 mb-2">
                        Keywords Found
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.analysis.atsBreakdown.keywordsFound?.length > 0 ? (
                          result.analysis.atsBreakdown.keywordsFound.map((kw) => (
                            <span key={kw} className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No keywords matched</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-red-300 mb-2">
                        Keywords Missing
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.analysis.atsBreakdown.keywordsMissing?.length > 0 ? (
                          result.analysis.atsBreakdown.keywordsMissing.map((kw) => (
                            <span key={kw} className="rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-300">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No missing keywords</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div>
                      <h4 className="text-sm font-semibold text-amber-300 mb-2">
                        Formatting Issues
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.analysis.atsBreakdown.formattingIssues?.length > 0 ? (
                          result.analysis.atsBreakdown.formattingIssues.map((issue) => (
                            <span key={issue} className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-300">
                              {issue}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No formatting issues</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">
                        Content Gaps
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.analysis.atsBreakdown.contentGaps?.length > 0 ? (
                          result.analysis.atsBreakdown.contentGaps.map((gap) => (
                            <span key={gap} className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                              {gap}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No content gaps</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ATS Suggestions */}
              <div className="border-t border-slate-700/50 pt-6">
                <h3 className="font-semibold text-indigo-300 mb-3">ATS Suggestions</h3>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.atsSuggestions?.map((item) => (
                    <span key={item} className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Roles */}
              {result.analysis.recommendedRoles?.length > 0 && (
                <div className="border-t border-slate-700/50 pt-6">
                  <h3 className="font-semibold text-white mb-3">Recommended Roles</h3>
                  <div className="flex flex-wrap gap-2">
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