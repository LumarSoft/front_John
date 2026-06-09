'use client'

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react'

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

  const value: AuthContextValue = {
    token,
    isAuthenticated: !!token,
    hydrated,
    login: (newToken: string) => setStoredToken(newToken),
    logout: () => setStoredToken(null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
