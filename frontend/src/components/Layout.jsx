import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { CalendarDays, CheckSquare, Home, LogOut, Target, UserRound } from 'lucide-react'
import { useAuth } from '../context/useAuth'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/targets', label: 'Targets', icon: Target },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/account', label: 'Account', icon: UserRound },
]

export function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[150px] border-r border-slate-200 bg-white/80 px-3 py-5 backdrop-blur md:block">
        <Brand />
        <nav className="mt-6 space-y-2">
          {navItems.map((item) => <NavItem key={item.to} item={item} />)}
        </nav>
      </aside>

      <main className="min-h-screen px-4 pb-24 pt-5 md:ml-[150px] md:px-6 md:pb-10 lg:px-8">
        <div className="mx-auto max-w-[980px]">
          <Outlet />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-extrabold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}
            >
              <Icon size={19} strokeWidth={2.5} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        title="Logout"
        className="fixed right-4 top-4 z-30 hidden h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-red-600 md:flex"
      >
        <LogOut size={18} />
      </button>
    </div>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-lg font-black text-white">O</div>
      <div className="text-base font-black tracking-normal">Organizer</div>
    </div>
  )
}

function NavItem({ item }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-extrabold ${isActive ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      <Icon size={17} strokeWidth={2.5} />
      {item.label}
    </NavLink>
  )
}
