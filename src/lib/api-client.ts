const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

/** A file the API serves (an API-relative path like /uploads/...) as an absolute URL. */
export function apiAssetUrl(path: string): string {
  return path.startsWith('http') ? path : `${API_URL}${path}`
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type UnauthorizedListener = (token: string) => void

const unauthorizedListeners = new Set<UnauthorizedListener>()

/** Hears every request made with a token that the API answered 401 to, with that token. */
export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

function notifyUnauthorized(res: Response, token: string | null | undefined): void {
  if (res.status === 401 && token) unauthorizedListeners.forEach(listener => listener(token))
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
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

  // A FormData body (file uploads) goes as is: the browser sets the multipart
  // Content-Type with its boundary.
  const isForm = body instanceof FormData
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: isForm ? body : JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    notifyUnauthorized(res, token)
    throw new ApiError(res.status, await extractErrorMessage(res))
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

interface StreamOptions {
  token: string
  body: unknown
  signal?: AbortSignal
}

/**
 * A POST whose answer is a stream of server-sent events (the assistant): each
 * event goes to `onEvent` as it arrives. An HTTP error before the stream
 * starts throws an ApiError, like apiRequest.
 */
export async function apiStream<E extends { event: string; data: unknown }>(
  path: string,
  { token, body, signal }: StreamOptions,
  onEvent: (event: E) => void,
): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok || !res.body) {
    notifyUnauthorized(res, token)
    throw new ApiError(res.status, await extractErrorMessage(res))
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let end: number
    while ((end = buffer.indexOf('\n\n')) >= 0) {
      const chunk = buffer.slice(0, end)
      buffer = buffer.slice(end + 2)
      let event = 'message'
      const data: string[] = []
      for (const line of chunk.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        else if (line.startsWith('data:')) data.push(line.slice(5).trimStart())
      }
      if (data.length) onEvent({ event, data: JSON.parse(data.join('\n')) as unknown } as E)
    }
  }
}

/** Downloads a file the API serves (a PDF) with the panel's token. */
export async function apiDownload(path: string, token: string): Promise<Blob> {
  const res = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    notifyUnauthorized(res, token)
    throw new ApiError(res.status, await extractErrorMessage(res))
  }
  return res.blob()
}
