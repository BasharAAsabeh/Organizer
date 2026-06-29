import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Save, Trash2 } from 'lucide-react'
import { Modal } from '../components/Modal'
import { EmptyState, ErrorState, LoadingState } from '../components/Status'
import { api, apiError } from '../lib/api'
import { datetimeInputValue, formatTime, isoDate, monthName } from '../lib/date'

const blankEvent = { title: '', description: '', start_datetime: '', end_datetime: '', event_type: 'event' }

export function Calendar() {
  const now = new Date()
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [mode, setMode] = useState('days')
  const [monthData, setMonthData] = useState(null)
  const [selectedDate, setSelectedDate] = useState(now)
  const [dayData, setDayData] = useState(null)
  const [modalEvent, setModalEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadMonth = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/calendar/month', { params: { year: cursor.getFullYear(), month: cursor.getMonth() + 1 } })
      setMonthData(response.data)
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }, [cursor])

  const loadDay = useCallback(async (date) => {
    try {
      const response = await api.get('/calendar/day', { params: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() } })
      setDayData(response.data)
    } catch (err) {
      setError(apiError(err))
    }
  }, [])

  useEffect(() => {
    loadMonth()
  }, [loadMonth])

  useEffect(() => {
    loadDay(selectedDate)
  }, [loadDay, selectedDate])

  function backDrill() {
    if (mode === 'days') setMode('months')
    else if (mode === 'months') setMode('years')
    else setMode('days')
  }

  function moveMonth(amount) {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + amount, 1))
    setMode('days')
  }

  const currentTime = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(now)
  const byDay = useMemo(() => indexItems(monthData), [monthData])

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <button type="button" title="Drill out" onClick={backDrill} className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black md:text-[32px]">{mode === 'days' ? currentTime : mode === 'months' ? cursor.getFullYear() : 'Years'}</h1>
            <p className="mt-1 text-sm font-extrabold text-slate-500">{new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(now)} · {modeLabel(mode)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {mode === 'days' && (
            <>
              <button type="button" title="Previous month" onClick={() => moveMonth(-1)} className="btn btn-ghost"><ChevronLeft size={18} /></button>
              <button type="button" title="Next month" onClick={() => moveMonth(1)} className="btn btn-ghost"><ChevronRight size={18} /></button>
            </>
          )}
          <button type="button" onClick={() => setModalEvent({ ...blankEvent, start_datetime: datetimeInputValue(selectedDate) })} className="btn btn-primary"><Plus size={18} /> Add Event</button>
        </div>
      </header>

      <ErrorState message={error} />

      <section className="grid gap-5 lg:grid-cols-[1fr_220px]">
        <div className="overflow-x-auto">
          {loading ? <LoadingState label="Loading calendar..." /> : mode === 'days' ? (
            <MonthGrid cursor={cursor} byDay={byDay} selectedDate={selectedDate} onSelect={setSelectedDate} />
          ) : mode === 'months' ? (
            <MonthsView year={cursor.getFullYear()} onPick={(month) => { setCursor(new Date(cursor.getFullYear(), month, 1)); setMode('days') }} />
          ) : (
            <YearsView currentYear={cursor.getFullYear()} onPick={(year) => { setCursor(new Date(year, cursor.getMonth(), 1)); setMode('months') }} />
          )}
        </div>

        <DayPanel date={selectedDate} data={dayData} onAdd={() => setModalEvent({ ...blankEvent, start_datetime: datetimeInputValue(selectedDate) })} onDelete={async (event) => {
          if (!confirm(`Delete "${event.title}"?`)) return
          await api.delete(`/calendar_events/${event.id}`)
          await Promise.all([loadMonth(), loadDay(selectedDate)])
        }} />
      </section>

      {modalEvent && (
        <EventForm
          event={modalEvent}
          onClose={() => setModalEvent(null)}
          onSaved={async () => {
            setModalEvent(null)
            await Promise.all([loadMonth(), loadDay(selectedDate)])
          }}
          onError={setError}
        />
      )}
    </>
  )
}

function modeLabel(mode) {
  return mode === 'days' ? 'Month view' : mode === 'months' ? 'Month/year drilldown behavior' : 'Years view'
}

function indexItems(data) {
  const index = {}
  if (!data) return index
  for (const task of data.tasks || []) {
    const key = isoDate(new Date(task.deadline))
    index[key] ||= []
    index[key].push({ ...task, calendarType: 'task' })
  }
  for (const event of data.calendar_events || []) {
    const key = isoDate(new Date(event.start_datetime))
    index[key] ||= []
    index[key].push({ ...event, calendarType: 'event' })
  }
  return index
}

function MonthGrid({ cursor, byDay, selectedDate, onSelect }) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const startOffset = first.getDay()
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - startOffset + 1
    return dayNumber > 0 && dayNumber <= daysInMonth ? new Date(cursor.getFullYear(), cursor.getMonth(), dayNumber) : null
  })

  return (
    <div className="panel min-w-[680px] overflow-hidden">
      <div className="calendar-grid border-b border-slate-200 bg-white">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="px-3 py-2 text-center text-xs font-black text-slate-500">{day}</div>)}
      </div>
      <div className="calendar-grid">
        {cells.map((date, index) => {
          const key = date ? isoDate(date) : `blank-${index}`
          const items = date ? byDay[isoDate(date)] || [] : []
          const selected = date && isoDate(date) === isoDate(selectedDate)
          return (
            <button
              key={key}
              type="button"
              disabled={!date}
              onClick={() => date && onSelect(date)}
              className={`min-h-[82px] border-b border-r border-slate-200 bg-white p-2 text-left align-top last:border-r-0 ${selected ? 'bg-blue-50' : ''}`}
            >
              {date && <span className="text-sm font-black">{date.getDate()}</span>}
              <div className="mt-2 space-y-1">
                {items.slice(0, 3).map((item) => (
                  <div key={`${item.calendarType}-${item.id}`} className="truncate rounded-md bg-blue-100 px-2 py-1 text-[11px] font-black text-blue-600">
                    {item.calendarType === 'task' ? 'Task' : item.title}
                  </div>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MonthsView({ year, onPick }) {
  return (
    <div className="panel p-5">
      <h2 className="mb-5 text-sm font-black text-slate-500">Months View</h2>
      <div className="grid max-w-md grid-cols-3 gap-4">
        {Array.from({ length: 12 }, (_, month) => (
          <button key={month} type="button" onClick={() => onPick(month)} className="min-h-14 rounded-xl border border-slate-200 bg-white text-sm font-black hover:bg-blue-50 hover:text-blue-600">
            {monthName(month)}
          </button>
        ))}
      </div>
      <p className="mt-5 text-sm font-bold text-slate-500">{year}</p>
    </div>
  )
}

function YearsView({ currentYear, onPick }) {
  const end = new Date().getFullYear()
  const years = Array.from({ length: end - 1990 + 1 }, (_, index) => 1990 + index)
  return (
    <div className="panel p-5">
      <h2 className="mb-5 text-sm font-black text-slate-500">Years View</h2>
      <div className="grid max-h-[460px] grid-cols-3 gap-3 overflow-auto sm:grid-cols-4 md:grid-cols-5">
        {years.map((year) => (
          <button key={year} type="button" onClick={() => onPick(year)} className={`min-h-12 rounded-xl border border-slate-200 text-sm font-black ${year === currentYear ? 'bg-blue-100 text-blue-600' : 'bg-white hover:bg-slate-50'}`}>
            {year}
          </button>
        ))}
      </div>
    </div>
  )
}

function DayPanel({ date, data, onAdd, onDelete }) {
  const tasks = data?.tasks || []
  const events = data?.calendar_events || []
  return (
    <aside className="panel flex min-h-[250px] flex-col p-5">
      <h2 className="text-base font-black text-slate-500">{new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' }).format(date)}</h2>
      <div className="mt-5 flex-1 space-y-4">
        {tasks.length === 0 && events.length === 0 ? <EmptyState title="Nothing scheduled" body="Add an item or pick another day." /> : null}
        {tasks.map((task) => <SideItem key={`task-${task.id}`} title={task.title} meta="Task deadline" dot />)}
        {events.map((event) => (
          <div key={`event-${event.id}`} className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-600" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-black">{event.title}</p>
              <p className="text-xs font-bold text-slate-500">{event.type} · {formatTime(event.start_datetime)}</p>
            </div>
            <button type="button" title="Delete event" onClick={() => onDelete(event)} className="text-slate-400 hover:text-red-600"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      <button type="button" onClick={onAdd} className="btn btn-primary mt-5"><Plus size={18} /> Add item</button>
    </aside>
  )
}

function SideItem({ title, meta }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-600" />
      <div className="min-w-0">
        <p className="truncate font-black">{title}</p>
        <p className="text-xs font-bold text-slate-500">{meta}</p>
      </div>
    </div>
  )
}

function EventForm({ event, onClose, onSaved, onError }) {
  const [form, setForm] = useState(event)
  const [busy, setBusy] = useState(false)

  async function submit(submitEvent) {
    submitEvent.preventDefault()
    setBusy(true)
    try {
      await api.post('/calendar_events', { ...form, end_datetime: form.end_datetime || null })
      onSaved()
    } catch (err) {
      onError(apiError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Add Calendar Event" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <input className="field" required placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <textarea className="field min-h-24" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="field" required type="datetime-local" value={form.start_datetime} onChange={(event) => setForm({ ...form, start_datetime: event.target.value })} />
          <input className="field" type="datetime-local" value={form.end_datetime || ''} onChange={(event) => setForm({ ...form, end_datetime: event.target.value })} />
        </div>
        <select className="field" value={form.event_type} onChange={(event) => setForm({ ...form, event_type: event.target.value })}>
          <option value="event">Event</option>
          <option value="note">Note</option>
          <option value="pinned">Pinned</option>
        </select>
        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={busy} className="btn btn-primary"><Save size={18} /> Save</button>
        </div>
      </form>
    </Modal>
  )
}
