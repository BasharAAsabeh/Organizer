import { useEffect, useMemo, useState } from 'react'
import { api, apiError } from '../lib/api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('organizer_token')
    if (!token) {
      setBooting(false)
      return
    }

    api.get('/auth/me')
      .then((response) => setUser(response.data.user))
      .catch(() => localStorage.removeItem('organizer_token'))
      .finally(() => setBooting(false))
  }, [])

  async function login(payload) {
    setAuthError('')
    try {
      const response = await api.post('/auth/login', payload)
      localStorage.setItem('organizer_token', response.data.token)
      setUser(response.data.user)
      return true
    } catch (error) {
      setAuthError(apiError(error))
      return false
    }
  }

  async function register(payload) {
    setAuthError('')
    try {
      const response = await api.post('/auth/register', payload)
      localStorage.setItem('organizer_token', response.data.token)
      setUser(response.data.user)
      return true
    } catch (error) {
      setAuthError(apiError(error))
      return false
    }
  }

  async function updateAccount(payload) {
    const response = await api.patch('/account', payload)
    localStorage.setItem('organizer_token', response.data.token)
    setUser(response.data.user)
    return response.data.user
  }

  function logout() {
    localStorage.removeItem('organizer_token')
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    booting,
    authError,
    login,
    register,
    updateAccount,
    logout,
  }), [user, booting, authError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
