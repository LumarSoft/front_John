import { clearToken, getToken } from './portal-auth.service'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const LOGIN_PATH = '/portal/login'

export class PortalSessionExpiredError extends Error {
  constructor() {
    super('Tu sesión expiró. Iniciá sesión nuevamente.')
    this.name = 'PortalSessionExpiredError'
  }
}

let redirecting = false

function redirectToLogin(): never {
  clearToken()
  if (typeof window !== 'undefined' && !redirecting && window.location.pathname !== LOGIN_PATH) {
    redirecting = true
    window.location.assign(LOGIN_PATH)
  }
  throw new PortalSessionExpiredError()
}

export async function portalFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_URL}${path}`, { ...init, headers })
  if (res.status === 401) redirectToLogin()
  return res
}
