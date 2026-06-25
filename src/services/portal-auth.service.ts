const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const PRODUCER_ID = Number(process.env.NEXT_PUBLIC_PRODUCER_ID ?? '1')

export interface LoginClientPayload {
  email: string
  password: string
}

export interface LoginClientResponse {
  access_token: string
  requiresPasswordChange: boolean
}

export async function loginClient(payload: LoginClientPayload): Promise<LoginClientResponse> {
  const res = await fetch(`${API_URL}/auth/client/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, producerId: PRODUCER_ID }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message ?? 'Credenciales inválidas')
  }

  return res.json()
}

export function saveToken(token: string) {
  document.cookie = `portal_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

export function getToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)portal_token=([^;]*)/)
  return match ? match[1] : null
}

export function clearToken() {
  document.cookie = 'portal_token=; path=/; max-age=0'
}
