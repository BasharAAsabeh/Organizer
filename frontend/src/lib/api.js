import axios from 'axios'

function apiBaseURL() {
  const configuredURL = import.meta.env.VITE_API_BASE_URL

  if (configuredURL) {
    const url = new URL(configuredURL)
    const localHosts = ['localhost', '127.0.0.1', '0.0.0.0']

    if (localHosts.includes(url.hostname) && !localHosts.includes(window.location.hostname)) {
      url.hostname = window.location.hostname
      return url.toString()
    }

    return configuredURL
  }

  return `${window.location.protocol}//${window.location.hostname}:3001/api`
}

export const api = axios.create({
  baseURL: apiBaseURL(),
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('organizer_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function apiError(error) {
  return error.response?.data?.error || error.response?.data?.errors?.join(', ') || error.message || 'Something went wrong'
}
