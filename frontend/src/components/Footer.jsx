import { BrainCircuit } from 'lucide-react'

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_2fr] lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-indigo-500">
              <BrainCircuit className="size-5" />
            </span>
            <span className="font-semibold text-white">InterviewAI</span>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-400">
            Structured interview practice, feedback, and progress tracking for technical and professional growth.
          </p>
        </div>
        <div className="grid gap-6 text-sm text-slate-400 sm:grid-cols-3">
          <div>
            <p className="mb-3 font-semibold text-slate-100">Platform</p>
            <p>Mock Interviews</p>
            <p>Resume Analysis</p>
            <p>Skill Reports</p>
          </div>
          <div>
            <p className="mb-3 font-semibold text-slate-100">Company</p>
            <p>About</p>
            <p>Careers</p>
            <p>Contact</p>
          </div>
          <div>
            <p className="mb-3 font-semibold text-slate-100">Legal</p>
            <p>Privacy</p>
            <p>Terms</p>
            <p>Security</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
