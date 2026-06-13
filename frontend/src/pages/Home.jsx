import { Link } from 'react-router-dom'
import { ArrowRight, BrainCircuit, CheckCircle2, FileText, LineChart, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react'

const features = [
  { icon: BrainCircuit, title: 'AI Question Generation', text: 'Role-specific technical, HR, behavioral, and mixed interviews.' },
  { icon: MessageSquareText, title: 'Detailed Feedback', text: 'Score answers on clarity, depth, confidence, and structure.' },
  { icon: LineChart, title: 'Progress Tracking', text: 'Monitor trends across skills, roles, and repeated attempts.' },
  { icon: FileText, title: 'Resume Analysis', text: 'Detect strengths, missing skills, and improvement opportunities.' },
]

function Home() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-200">
            <Sparkles className="size-4" />
            AI Mock Interview Ecosystem
          </div>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Practice Real Interviews With AI
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Generate role-specific interview questions, receive detailed feedback, and improve your skills with guided practice.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/create-interview" className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 font-semibold text-white shadow-xl shadow-indigo-500/25 transition hover:bg-indigo-400">
              Start Interview
              <ArrowRight className="size-5" />
            </Link>
            <a href="#features" className="focus-ring inline-flex items-center justify-center rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-100 transition hover:border-slate-500">
              Explore Features
            </a>
          </div>
        </div>
        <div className="glass rounded-lg p-5">
          <div className="rounded-lg border border-slate-700 bg-slate-950 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Live Interview</p>
                <p className="mt-1 font-semibold text-white">Frontend Developer</p>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">12:45</span>
            </div>
            <div className="mb-5 rounded-lg bg-slate-900 p-4">
              <p className="text-sm text-indigo-300">Question 4 of 10</p>
              <p className="mt-2 text-xl font-semibold text-white">How does React reconciliation improve rendering performance?</p>
            </div>
            <div className="h-40 rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">
              Explain virtual DOM diffing, stable keys, and how component updates are batched...
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {['Clarity 86%', 'Depth 91%', 'Pace 82%'].map((item) => (
                <div key={item} className="rounded-lg bg-slate-900 p-3 text-center text-sm font-semibold text-slate-200">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Features</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="glass rounded-lg p-5">
                  <Icon className="mb-4 size-6 text-indigo-300" />
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{feature.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        {['Choose role and level', 'Answer AI questions', 'Review score and feedback'].map((step, index) => (
          <div key={step} className="rounded-lg border border-slate-800 bg-slate-900/60 p-6">
            <span className="grid size-10 place-items-center rounded-lg bg-indigo-500 font-bold">{index + 1}</span>
            <h3 className="mt-5 text-lg font-semibold text-white">{step}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">A focused workflow designed to move from setup to measurable improvement quickly.</p>
          </div>
        ))}
      </section>

      <section className="border-t border-slate-800 bg-slate-900/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="glass rounded-lg p-6">
            <ShieldCheck className="mb-4 size-6 text-emerald-300" />
            <p className="text-lg leading-8 text-slate-200">The question quality feels close to real hiring loops, and the feedback makes every practice session actionable.</p>
            <p className="mt-4 text-sm font-semibold text-white">Aarav, Backend Engineer</p>
          </div>
          <div className="glass rounded-lg p-6">
            <CheckCircle2 className="mb-4 size-6 text-indigo-300" />
            <h2 className="text-2xl font-bold text-white">FAQ</h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-400">
              <p><span className="font-semibold text-slate-100">Can I retake interviews?</span> Yes, retakes are tracked against previous scores.</p>
              <p><span className="font-semibold text-slate-100">Does it support resumes?</span> Yes, upload a PDF to see skills and missing keywords.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
