'use client'

import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError, onUnauthorized } from '@/src/lib/api-client'
import { adminAuthService } from '@/src/services/admin-auth.service'

const TOKEN_STORAGE_KEY = 'admin_token'

const listeners = new Set<() => void>()

function subscribeToken(listener: () => void): () => void {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function getTokenSnapshot(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
  else localStorage.removeItem(TOKEN_STORAGE_KEY)
  listeners.forEach(listener => listener())
}

// Returns false during SSR and first hydration render, true afterwards — lets the
// guard wait until the client has read localStorage before deciding to redirect.
const subscribeMounted = () => () => {}

interface AuthContextValue {
  token: string | null
  isAuthenticated: boolean
  hydrated: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false,
  )
  const storedToken = useSyncExternalStore(subscribeToken, getTokenSnapshot, () => null)
  const token = hydrated ? storedToken : null
  const queryClient = useQueryClient()
  // Cached queries (profile, role, chats, counters) are not keyed by user: a
  // new session must never start from what the previous one loaded.
  const sessionTokenRef = useRef<string | null | undefined>(undefined)

  const switchSession = (newToken: string | null) => {
    queryClient.clear()
    sessionTokenRef.current = newToken
    setStoredToken(newToken)
  }

  // The session can also change in another tab (login there as someone else).
  useEffect(() => {
    if (!hydrated) return
    if (sessionTokenRef.current === undefined) {
      sessionTokenRef.current = token
      return
    }
    if (sessionTokenRef.current === token) return
    sessionTokenRef.current = token
    void queryClient.resetQueries()
  }, [hydrated, token, queryClient])

  const expireSession = useEffectEvent((rejected: string) => {
    if (rejected !== getTokenSnapshot()) return
    toast.info('Tu sesión venció. Volvé a ingresar.')
    switchSession(null)
  })

  // An expired or removed user's token gets a 401 on every call, and the panel
  // stayed half-loaded instead of going back to the login. A 401 can also come
  // from a provider behind the API (Triunfo), so the session ends only once the
  // API rejects the token itself on /users/me.
  useEffect(() => {
    let checking = false
    return onUnauthorized(async rejected => {
      if (checking || rejected !== getTokenSnapshot()) return
      checking = true
      try {
        await adminAuthService.getProfile(rejected)
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) expireSession(rejected)
      } finally {
        checking = false
      }
    })
  }, [])

  const value: AuthContextValue = {
    token,
    isAuthenticated: !!token,
    hydrated,
    login: (newToken: string) => switchSession(newToken),
    logout: () => switchSession(null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
