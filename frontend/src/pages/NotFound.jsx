import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-center text-slate-100">
      <div>
        <p className="text-sm font-semibold text-indigo-300">404</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Page not found</h1>
        <p className="mt-3 text-slate-400">The route you opened does not exist.</p>
        <Link to="/" className="focus-ring mt-6 inline-flex rounded-lg bg-indigo-500 px-5 py-3 font-semibold text-white hover:bg-indigo-400">Go Home</Link>
      </div>
    </main>
  )
}

export default NotFound
