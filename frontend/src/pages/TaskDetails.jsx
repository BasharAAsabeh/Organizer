import { useEffect, useState } from 'react'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ErrorState, LoadingState } from '../components/Status'
import { api, apiError } from '../lib/api'
import { formatDate } from '../lib/date'

export function TaskDetails() {
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [notes, setNotes] = useState('')
  const [resources, setResources] = useState([])
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get(`/tasks/${id}`)
      .then((response) => {
        const loaded = response.data.task
        setTask(loaded)
        setNotes(loaded.task_detail?.notes || '')
        setResources(loaded.task_detail?.resources || [])
      })
      .catch((err) => setError(apiError(err)))
  }, [id])

  async function save() {
    setBusy(true)
    setError('')
    setSaved('')
    try {
      const payload = { notes, resources: resources.filter((resource) => resource.label || resource.url) }
      const response = task.task_detail
        ? await api.patch(`/tasks/${task.id}/task_detail`, payload)
        : await api.post(`/tasks/${task.id}/task_detail`, payload)
      setTask({ ...task, has_detail_page: true, task_detail: response.data.task_detail })
      setSaved('Details saved')
    } catch (err) {
      setError(apiError(err))
    } finally {
      setBusy(false)
    }
  }

  if (error && !task) return <ErrorState message={error} />
  if (!task) return <LoadingState label="Loading task details..." />

  return (
    <>
      <div className="mb-7 flex items-center justify-between gap-4">
        <Link to="/tasks" className="btn btn-ghost"><ArrowLeft size={18} /> Back</Link>
        <button type="button" onClick={save} disabled={busy} className="btn btn-primary"><Save size={18} /> Save Details</button>
      </div>
      <ErrorState message={error} />
      {saved && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{saved}</div>}

      <section className="mb-5 rounded-2xl bg-blue-600 p-6 text-white">
        <p className="text-sm font-black text-blue-100">Task Details</p>
        <h1 className="mt-1 text-3xl font-black">{task.title}</h1>
        <p className="mt-2 text-sm font-black text-blue-100">
          {task.priority} priority · {task.deadline ? `Deadline: ${formatDate(task.deadline)}` : 'No deadline'}{task.target_title ? ` · Target: ${task.target_title}` : ''}
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.65fr]">
        <div className="panel p-5">
          <h2 className="mb-4 text-sm font-black text-slate-500">Notes</h2>
          <textarea className="field min-h-[260px] resize-y" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add task notes..." />
        </div>

        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-500">Resources</h2>
            <button type="button" title="Add resource" onClick={() => setResources([...resources, { label: '', url: '' }])} className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Plus size={17} />
            </button>
          </div>
          <div className="space-y-3">
            {resources.length === 0 && <p className="text-sm font-bold text-slate-500">No resource links yet.</p>}
            {resources.map((resource, index) => (
              <div key={index} className="rounded-xl border border-slate-200 p-3">
                <div className="flex gap-2">
                  <input className="field min-h-0 flex-1 px-3 py-2" placeholder="Label" value={resource.label || ''} onChange={(event) => updateResource(resources, setResources, index, 'label', event.target.value)} />
                  <button type="button" title="Delete resource" onClick={() => setResources(resources.filter((_, resourceIndex) => resourceIndex !== index))} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
                <input className="field mt-2 min-h-0 px-3 py-2" placeholder="https://..." value={resource.url || ''} onChange={(event) => updateResource(resources, setResources, index, 'url', event.target.value)} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function updateResource(resources, setResources, index, key, value) {
  setResources(resources.map((resource, resourceIndex) => (resourceIndex === index ? { ...resource, [key]: value } : resource)))
}
