import { useEffect, useState } from 'react'
import { CalendarPlus, Plus, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/Status'
import { api, apiError } from '../lib/api'
import { formatDate, formatTime } from '../lib/date'
import { useAuth } from '../context/useAuth'

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard')
      .then((response) => setData(response.data))
      .catch((err) => setError(apiError(err)))
  }, [])

  if (error) return <ErrorState message={error} />
  if (!data) return <LoadingState label="Loading dashboard..." />

  const firstName = user?.email?.split('@')[0] || 'there'

  return (
    <>
      <PageHeader
        title={`Good ${greeting()}, ${firstName}`}
        subtitle="Here is what needs your attention today."
        action={<button type="button" onClick={() => navigate('/tasks')} className="btn btn-primary"><Plus size={18} /> Add Task</button>}
      />

      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Total tasks" value={data.stats.total_tasks} />
        <Stat label="Completed" value={data.stats.completed_tasks} />
        <Stat label="Pending" value={data.stats.pending_tasks} />
        <Stat label="Overdue" value={data.stats.overdue_tasks} />
        <Stat label="Targets" value={data.stats.active_targets} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="panel overflow-hidden">
          <PanelTitle title="Today" />
          {data.today_tasks.length === 0 ? (
            <div className="p-5"><EmptyState title="No tasks due today" body="Your calendar has room to breathe." /></div>
          ) : data.today_tasks.map((task) => <TaskLine key={task.id} task={task} />)}
        </div>

        <div className="panel p-5">
          <PanelTitle title="This Week" flush />
          <div className="grid grid-cols-2 gap-3">
            {data.week.map((day) => (
              <div key={day.date} className="flex min-h-14 items-center justify-between rounded-xl border border-slate-200 px-4">
                <span className="text-sm font-black">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                {(day.task_count > 0 || day.event_count > 0) && <span className="h-2 w-2 rounded-full bg-blue-600" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <PanelTitle title="Upcoming Deadlines" flush />
          <div className="space-y-3">
            {data.upcoming_deadlines.length === 0 ? <p className="text-sm font-bold text-slate-500">No upcoming deadlines.</p> : data.upcoming_deadlines.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                <div>
                  <p className="font-black">{task.title}</p>
                  <p className="text-sm font-bold text-slate-500">{formatDate(task.deadline)} {formatTime(task.deadline)}</p>
                </div>
                <Priority priority={task.priority} />
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <PanelTitle title="Quick Actions" flush />
          <div className="grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={() => navigate('/tasks')} className="btn btn-ghost"><Plus size={18} /> Task</button>
            <button type="button" onClick={() => navigate('/targets')} className="btn btn-ghost"><Target size={18} /> Target</button>
            <button type="button" onClick={() => navigate('/calendar')} className="btn btn-ghost"><CalendarPlus size={18} /> Event</button>
          </div>
        </div>
      </section>
    </>
  )
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

function Stat({ label, value }) {
  return (
    <div className="panel p-4">
      <div className="text-3xl font-black">{value}</div>
      <div className="mt-2 text-sm font-extrabold text-slate-500">{label}</div>
    </div>
  )
}

function PanelTitle({ title, flush = false }) {
  return <h2 className={`${flush ? 'mb-4' : 'border-b border-slate-200 px-5 py-4'} text-sm font-black text-slate-500`}>{title}</h2>
}

function TaskLine({ task }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3 last:border-b-0">
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${task.overdue ? 'border-red-100 bg-red-50 text-xs font-black text-red-600' : task.is_completed ? 'border-green-600 bg-green-600' : 'border-slate-300'}`}>{task.overdue ? 'x' : ''}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-black">{task.title}</p>
        <p className="text-sm font-bold text-slate-500">{task.is_completed ? 'Completed' : `Due ${formatDate(task.deadline)}`} {formatTime(task.deadline)}</p>
      </div>
    </div>
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
