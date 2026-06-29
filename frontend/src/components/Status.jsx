export function LoadingState({ label = 'Loading...' }) {
  return <div className="panel p-6 text-sm font-extrabold text-slate-500">{label}</div>
}

export function EmptyState({ title, body }) {
  return (
    <div className="panel p-6">
      <p className="text-base font-black text-slate-900">{title}</p>
      {body && <p className="mt-1 text-sm font-bold text-slate-500">{body}</p>}
    </div>
  )
}

export function ErrorState({ message }) {
  if (!message) return null
  return <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</div>
}
