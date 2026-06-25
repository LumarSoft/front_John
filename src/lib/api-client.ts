const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  token?: string | null
  body?: unknown
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string | string[] }
    if (Array.isArray(data.message)) return data.message.join(', ')
    if (typeof data.message === 'string') return data.message
  } catch {
    // response had no JSON body — fall through to the generic message
  }
  return `Request failed with status ${res.status}`
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', token, body } = options

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) throw new ApiError(res.status, await extractErrorMessage(res))
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
