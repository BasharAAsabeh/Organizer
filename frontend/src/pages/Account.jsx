import { useState } from 'react'
import { LogOut, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { ErrorState } from '../components/Status'
import { apiError } from '../lib/api'
import { useAuth } from '../context/useAuth'

export function Account() {
  const { user, updateAccount, logout } = useAuth()
  const navigate = useNavigate()
  const [emailForm, setEmailForm] = useState({ email: user.email, current_password: '' })
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  async function updateEmail(event) {
    event.preventDefault()
    await submit(emailForm)
    setEmailForm({ email: emailForm.email, current_password: '' })
  }

  async function updatePassword(event) {
    event.preventDefault()
    await submit(passwordForm)
    setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
  }

  async function submit(payload) {
    setError('')
    setSaved('')
    try {
      await updateAccount(payload)
      setSaved('Account updated')
    } catch (err) {
      setError(apiError(err))
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      <PageHeader
        title="Account"
        subtitle="Manage login details and session."
        action={<button type="button" onClick={handleLogout} className="btn btn-ghost"><LogOut size={18} /> Logout</button>}
      />
      <ErrorState message={error} />
      {saved && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{saved}</div>}

      <section className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={updateEmail} className="panel p-5">
          <h2 className="mb-5 text-sm font-black text-slate-500">Change Email</h2>
          <div className="space-y-4">
            <input className="field" type="email" required placeholder="New email" value={emailForm.email} onChange={(event) => setEmailForm({ ...emailForm, email: event.target.value })} />
            <input className="field" type="password" required placeholder="Current password" value={emailForm.current_password} onChange={(event) => setEmailForm({ ...emailForm, current_password: event.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary mt-6"><Save size={18} /> Update</button>
        </form>

        <form onSubmit={updatePassword} className="panel p-5">
          <h2 className="mb-5 text-sm font-black text-slate-500">Change Password</h2>
          <div className="space-y-4">
            <input className="field" type="password" required placeholder="Current password" value={passwordForm.current_password} onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })} />
            <input className="field" type="password" required placeholder="New password" value={passwordForm.password} onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })} />
            <input className="field" type="password" required placeholder="Confirm password" value={passwordForm.password_confirmation} onChange={(event) => setPasswordForm({ ...passwordForm, password_confirmation: event.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary mt-6"><Save size={18} /> Update</button>
        </form>
      </section>

      <section className="panel mt-7 p-5">
        <h2 className="mb-3 text-sm font-black text-slate-500">Session</h2>
        <p className="text-sm font-bold text-slate-500">Logged in as {user.email} · Last account update {new Date(user.updated_at).toLocaleDateString()}</p>
      </section>
    </>
  )
}
