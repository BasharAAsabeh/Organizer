import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import { Layout } from './components/Layout'
import { Account } from './pages/Account'
import { Calendar } from './pages/Calendar'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { TaskDetails } from './pages/TaskDetails'
import { Targets } from './pages/Targets'
import { Tasks } from './pages/Tasks'

function ProtectedRoute() {
  const { user, booting } = useAuth()

  if (booting) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-black text-slate-500">Loading organizer...</div>
  }

  return user ? <Layout /> : <Navigate to="/login" replace />
}

function GuestRoute() {
  const { user, booting } = useAuth()
  if (booting) return null
  return user ? <Navigate to="/" replace /> : <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<GuestRoute />} />
        <Route element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
          <Route path="/targets" element={<Targets />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
