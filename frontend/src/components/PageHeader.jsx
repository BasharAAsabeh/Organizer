export function PageHeader({ title, subtitle, action }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-3xl font-black tracking-normal text-slate-900 md:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm font-extrabold text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
