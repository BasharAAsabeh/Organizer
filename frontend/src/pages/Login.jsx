import { useState } from 'react'
import { CheckSquare, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ErrorState } from '../components/Status'

export function Login() {
  const { login, register, authError } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', password_confirmation: '' })
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    const ok = mode === 'login' ? await login(form) : await register(form)
    setBusy(false)
    return ok
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <section className="panel grid w-full max-w-5xl overflow-hidden md:grid-cols-[0.92fr_1.08fr]">
        <div className="border-b border-slate-200 bg-white p-6 md:border-b-0 md:border-r md:p-8">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-lg font-black text-white">O</div>
            <span className="text-lg font-black">Organizer</span>
          </div>
          <h1 className="max-w-sm text-3xl font-black leading-tight text-slate-900">Your daily plan, goals, and calendar in one focused workspace.</h1>
          <div className="mt-8 space-y-3 text-sm font-bold text-slate-600">
            <div className="flex items-center gap-3"><CheckSquare className="text-blue-600" size={18} /> Group tasks by target or keep them public.</div>
            <div className="flex items-center gap-3"><CheckSquare className="text-blue-600" size={18} /> See overdue work and task deadlines on the calendar.</div>
            <div className="flex items-center gap-3"><CheckSquare className="text-blue-600" size={18} /> Add notes and resources only when a task needs details.</div>
          </div>
        </div>

        <form onSubmit={submit} className="bg-slate-50 p-6 md:p-8">
          <div className="mb-6 grid grid-cols-2 rounded-xl border border-slate-200 bg-white p-1">
            <button type="button" onClick={() => setMode('login')} className={`rounded-lg px-4 py-2 text-sm font-black ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Login</button>
            <button type="button" onClick={() => setMode('register')} className={`rounded-lg px-4 py-2 text-sm font-black ${mode === 'register' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Register</button>
          </div>

          <h2 className="text-2xl font-black">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">Use the seeded demo after setup: bashar@example.com / password123.</p>
          <div className="mt-5"><ErrorState message={authError} /></div>

          <div className="space-y-4">
            <input className="field" type="email" required placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <input className="field" type="password" required placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            {mode === 'register' && (
              <input className="field" type="password" required placeholder="Confirm password" value={form.password_confirmation} onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })} />
            )}
          </div>

          <button type="submit" disabled={busy} className="btn btn-primary mt-6 w-full">
            {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
            {busy ? 'Working...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      </section>
    </main>
  )
}
