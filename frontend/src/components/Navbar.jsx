import { Link, NavLink } from 'react-router-dom'
import { BrainCircuit, LogOut, Menu, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/useAuth'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'History', to: '/history' },
  { label: 'Profile', to: '/profile' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/60 bg-slate-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/30">
            <BrainCircuit className="size-5" />
          </span>
          <span className="text-base font-semibold text-slate-50">InterviewAI</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-slate-300">{user.name}</span>
              <button
                type="button"
                onClick={logout}
                className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-red-400/50 hover:text-red-200"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="focus-ring inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400"
            >
              <Sparkles className="size-4" />
              Start Interview
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="focus-ring grid size-10 place-items-center rounded-lg border border-slate-700 text-slate-200 md:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-800 px-4 pb-4 md:hidden">
          <div className="grid gap-2 pt-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
