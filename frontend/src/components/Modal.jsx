import { X } from 'lucide-react'

export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
      <div className="panel w-full max-w-xl shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-black">{title}</h2>
          <button type="button" title="Close" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
