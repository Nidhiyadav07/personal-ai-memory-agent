const KEY = 'token'

export const getToken = () => localStorage.getItem(KEY)
export const setToken = (t) => (t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY))

let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn)

export async function api(path, { json, body, method = 'GET' } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (json) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(json)
  }

  const res = await fetch(path, { method, headers, body })
  const data = await res.json().catch(() => ({}))

  if (res.status === 401 && token) {
    onUnauthorized()
    throw new Error('Session expired. Log in again.')
  }
  if (!res.ok) {
    const d = data.detail
    throw new Error(
      typeof d === 'string' ? d : Array.isArray(d) ? 'Check your details and try again.' : 'Something went wrong.'
    )
  }
  return data
}
