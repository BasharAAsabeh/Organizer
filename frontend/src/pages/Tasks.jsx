import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, FileText, Plus, Save, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/Status'
import { api, apiError } from '../lib/api'
import { datetimeInputValue, formatDate, formatTime } from '../lib/date'

const blankTask = {
  title: '',
  description: '',
  priority: 'medium',
  deadline: '',
  is_completed: false,
  has_detail_page: false,
  target_id: '',
}

export function Tasks() {
  const [tasks, setTasks] = useState([])
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalTask, setModalTask] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('created')
  const [showProgress, setShowProgress] = useState(true)

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const [taskResponse, targetResponse] = await Promise.all([
        api.get('/tasks', { params: { filter, sort } }),
        api.get('/targets'),
      ])
      setTasks(taskResponse.data.tasks)
      setTargets(targetResponse.data.targets)
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }, [filter, sort])

  useEffect(() => {
    load()
  }, [load])

  async function toggleTask(task, patch) {
    try {
      const response = await api.patch(`/tasks/${task.id}`, { ...patch })
      setTasks((current) => current.map((item) => (item.id === task.id ? response.data.task : item)))
    } catch (err) {
      setError(apiError(err))
    }
  }

  async function deleteTask(task) {
    if (!confirm(`Delete "${task.title}"?`)) return
    await api.delete(`/tasks/${task.id}`)
    setTasks((current) => current.filter((item) => item.id !== task.id))
  }

  const grouped = useMemo(() => {
    const publicTasks = tasks.filter((task) => !task.target_id)
    const sections = targets.map((target) => ({
      target,
      tasks: tasks.filter((task) => task.target_id === target.id),
    }))
    return { publicTasks, sections }
  }, [tasks, targets])

  const completedPercent = tasks.length ? Math.round((tasks.filter((task) => task.is_completed).length / tasks.length) * 100) : 0

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Public tasks first, then one list for each target."
        action={<button type="button" onClick={() => setModalTask(blankTask)} className="btn btn-primary"><Plus size={18} /> New Task</button>}
      />
      <ErrorState message={error} />

      <div className="mb-5 flex flex-wrap gap-3">
        <select className="field max-w-[180px]" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">All tasks</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
        <select className="field max-w-[190px]" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="created">Newest first</option>
          <option value="priority">Priority</option>
          <option value="deadline">Deadline</option>
        </select>
      </div>

      {loading ? <LoadingState label="Loading tasks..." /> : (
        <div className="space-y-5">
          <TaskSection title="Public Tasks" tasks={grouped.publicTasks} onToggle={toggleTask} onEdit={setModalTask} onDelete={deleteTask} />
          {grouped.sections.map(({ target, tasks: targetTasks }) => (
            <TaskSection key={target.id} title={`Target: ${target.title}`} tasks={targetTasks} onToggle={toggleTask} onEdit={setModalTask} onDelete={deleteTask} />
          ))}
          {tasks.length === 0 && <EmptyState title="No tasks yet" body="Create a public task or attach one to a target." />}
        </div>
      )}

      {modalTask && (
        <TaskForm
          task={modalTask}
          targets={targets}
          onClose={() => setModalTask(null)}
          onSaved={(saved) => {
            setTasks((current) => saved.id && current.some((task) => task.id === saved.id)
              ? current.map((task) => (task.id === saved.id ? saved : task))
              : [saved, ...current])
            setModalTask(null)
          }}
          onError={setError}
        />
      )}

      {tasks.length > 0 && (
        <div className="fixed bottom-20 right-4 z-20 md:bottom-6 md:right-6">
          {showProgress ? (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
              <button type="button" title="Hide progress" onClick={() => setShowProgress(false)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200">
                <EyeOff size={16} />
              </button>
              <ProgressCircle percent={completedPercent} />
            </div>
          ) : (
            <button type="button" title="Show progress" onClick={() => setShowProgress(true)} className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
              <Eye size={18} />
            </button>
          )}
        </div>
      )}
    </>
  )
}

function TaskSection({ title, tasks, onToggle, onEdit, onDelete }) {
  return (
    <section className="panel overflow-hidden">
      <h2 className="border-b border-slate-200 px-5 py-4 text-sm font-black text-slate-500">{title}</h2>
      {tasks.length === 0 ? (
        <div className="px-5 py-4 text-sm font-bold text-slate-400">No tasks in this section.</div>
      ) : tasks.map((task) => (
        <article key={task.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-slate-200 px-5 py-3 last:border-b-0">
          <button
            type="button"
            title={task.is_completed ? 'Mark incomplete' : 'Mark complete'}
            onClick={() => onToggle(task, { is_completed: !task.is_completed })}
            className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs font-black ${task.overdue ? 'border-red-100 bg-red-50 text-red-600' : task.is_completed ? 'border-green-600 bg-green-600 text-white' : 'border-slate-300 bg-white'}`}
          >
            {task.overdue ? 'x' : task.is_completed ? '' : ''}
          </button>
          <div className="min-w-0">
            <p className="truncate font-black">{task.title}</p>
            <p className="text-sm font-bold text-slate-500">
              {task.is_completed ? 'Completed' : task.deadline ? `Deadline: ${formatDate(task.deadline)} ${formatTime(task.deadline)}` : 'No deadline'}
              {task.has_detail_page && ' · Details page'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Priority priority={task.priority} />
            {task.has_detail_page && (
              <Link title="Open details" to={`/tasks/${task.id}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600">
                <FileText size={16} />
              </Link>
            )}
            <button type="button" title="Edit task" onClick={() => onEdit({ ...task, deadline: datetimeInputValue(task.deadline), target_id: task.target_id || '' })} className="btn btn-ghost hidden h-9 min-h-0 px-3 sm:inline-flex">Edit</button>
            <button type="button" title="Delete task" onClick={() => onDelete(task)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        </article>
      ))}
    </section>
  )
}

function TaskForm({ task, targets, onClose, onSaved, onError }) {
  const [form, setForm] = useState(task)
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const payload = { ...form, target_id: form.target_id || null, deadline: form.deadline || null }
      const response = form.id ? await api.patch(`/tasks/${form.id}`, payload) : await api.post('/tasks', payload)
      onSaved(response.data.task)
    } catch (err) {
      onError(apiError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={form.id ? 'Edit Task' : 'New Task'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <input className="field" required placeholder="Task title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <textarea className="field min-h-24" placeholder="Description" value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <select className="field" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
          <select className="field" value={form.target_id || ''} onChange={(event) => setForm({ ...form, target_id: event.target.value })}>
            <option value="">Public task</option>
            {targets.map((target) => <option key={target.id} value={target.id}>{target.title}</option>)}
          </select>
        </div>
        <input className="field" type="datetime-local" value={form.deadline || ''} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
        <label className="flex items-center gap-3 text-sm font-bold text-slate-600">
          <input type="checkbox" checked={form.has_detail_page} onChange={(event) => setForm({ ...form, has_detail_page: event.target.checked })} />
          Create task detail page
        </label>
        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={busy} className="btn btn-primary"><Save size={18} /> Save</button>
        </div>
      </form>
    </Modal>
  )
}

function Priority({ priority }) {
  const classes = {
    high: 'bg-red-100 text-red-600',
    medium: 'bg-amber-100 text-amber-600',
    low: 'bg-green-100 text-green-600',
  }
  return <span className={`rounded-full px-3 py-1 text-xs font-black capitalize ${classes[priority]}`}>{priority}</span>
}

function ProgressCircle({ percent }) {
  return (
    <div className="relative grid h-20 w-20 place-items-center rounded-full" style={{ background: `conic-gradient(#2563eb ${percent * 3.6}deg, #e5e7eb 0deg)` }}>
      <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-lg font-black">{percent}%</div>
    </div>
  )
}
