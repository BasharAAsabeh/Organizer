import { useEffect, useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/Status'
import { api, apiError } from '../lib/api'
import { dateInputValue, formatDate } from '../lib/date'

const blankTarget = { title: '', description: '', deadline: '', is_finished: false }

export function Targets() {
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalTarget, setModalTarget] = useState(null)

  useEffect(() => {
    api.get('/targets')
      .then((response) => setTargets(response.data.targets))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false))
  }, [])

  async function toggle(target) {
    const response = await api.patch(`/targets/${target.id}`, { is_finished: !target.is_finished })
    setTargets((current) => current.map((item) => (item.id === target.id ? response.data.target : item)))
  }

  async function remove(target) {
    if (!confirm(`Delete "${target.title}"? Tasks attached to it will become public.`)) return
    await api.delete(`/targets/${target.id}`)
    setTargets((current) => current.filter((item) => item.id !== target.id))
  }

  return (
    <>
      <PageHeader
        title="Targets"
        subtitle="Goals with deadlines and task sections."
        action={<button type="button" onClick={() => setModalTarget(blankTarget)} className="btn btn-primary"><Plus size={18} /> New Target</button>}
      />
      <ErrorState message={error} />
      {loading ? <LoadingState label="Loading targets..." /> : targets.length === 0 ? <EmptyState title="No targets yet" body="Create a target to get its own task section." /> : (
        <section className="panel overflow-hidden">
          {targets.map((target) => (
            <article key={target.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-slate-200 px-5 py-4 last:border-b-0">
              <button type="button" title="Toggle finished" onClick={() => toggle(target)} className={`h-5 w-5 rounded-md border ${target.is_finished ? 'border-green-600 bg-green-600' : 'border-slate-300 bg-white'}`} />
              <div className="min-w-0">
                <p className="truncate font-black">{target.title}</p>
                <p className="text-sm font-bold text-slate-500">
                  {target.is_finished ? 'Finished' : target.deadline ? `Deadline: ${formatDate(target.deadline)}` : 'No deadline'} · {target.task_count} linked tasks
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setModalTarget({ ...target, deadline: dateInputValue(target.deadline) })} className={`btn min-h-0 px-4 py-2 ${target.is_finished ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{target.is_finished ? 'Done' : 'Add'}</button>
                <button type="button" title="Delete target" onClick={() => remove(target)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {modalTarget && (
        <TargetForm
          target={modalTarget}
          onClose={() => setModalTarget(null)}
          onSaved={(saved) => {
            setTargets((current) => saved.id && current.some((target) => target.id === saved.id)
              ? current.map((target) => (target.id === saved.id ? saved : target))
              : [saved, ...current])
            setModalTarget(null)
          }}
          onError={setError}
        />
      )}
    </>
  )
}

function TargetForm({ target, onClose, onSaved, onError }) {
  const [form, setForm] = useState(target)
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const payload = { ...form, deadline: form.deadline || null }
      const response = form.id ? await api.patch(`/targets/${form.id}`, payload) : await api.post('/targets', payload)
      onSaved(response.data.target)
    } catch (err) {
      onError(apiError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={form.id ? 'Target Editor' : 'New Target'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <input className="field" required placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <textarea className="field min-h-24" placeholder="Description" value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <input className="field" type="date" value={form.deadline || ''} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
        <label className="flex items-center gap-3 text-sm font-bold text-slate-600">
          <input type="checkbox" checked={form.is_finished} onChange={(event) => setForm({ ...form, is_finished: event.target.checked })} />
          Finished
        </label>
        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={busy} className="btn btn-primary"><Save size={18} /> Save</button>
        </div>
      </form>
    </Modal>
  )
}
