import { NavLink } from 'react-router-dom'
import { BarChart3, BriefcaseBusiness, FileSearch, History, LayoutDashboard, Settings, User } from 'lucide-react'

const items = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Interviews', to: '/create-interview', icon: BriefcaseBusiness },
  { label: 'History', to: '/history', icon: History },
  { label: 'Resume Analysis', to: '/resume-analysis', icon: FileSearch },
  { label: 'Profile', to: '/profile', icon: User },
  { label: 'Settings', to: '/profile', icon: Settings },
]

function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-950/70 p-4 lg:block">
      <div className="mb-6 rounded-lg border border-indigo-400/20 bg-indigo-500/10 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-200">
          <BarChart3 className="size-4" />
          Interview Readiness
        </div>
        <div className="h-2 rounded-full bg-slate-800">
          <div className="h-2 w-[84%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
        </div>
        <p className="mt-3 text-xs text-slate-400">84% average across recent sessions</p>
      </div>
      <nav className="grid gap-1">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`
              }
            >
              <Icon className="size-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
