'use client'

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react'
import {
  DEFAULT_PANEL_THEME,
  PANEL_THEME_STORAGE_KEY,
  applyPanelTheme,
  clearPanelTheme,
  parsePanelTheme,
  subscribeSystemDark,
  systemPrefersDark,
  type PanelMode,
  type PanelPaletteId,
  type PanelThemePreference,
} from '../lib/panel-theme'

const listeners = new Set<() => void>()

// Another tab changing the theme updates this one too.
function subscribeStoredTheme(listener: () => void): () => void {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function getStoredThemeSnapshot(): string | null {
  return localStorage.getItem(PANEL_THEME_STORAGE_KEY)
}

function storeTheme(preference: PanelThemePreference): void {
  localStorage.setItem(PANEL_THEME_STORAGE_KEY, JSON.stringify(preference))
  listeners.forEach(listener => listener())
}

interface PanelThemeContextValue extends PanelThemePreference {
  // What is on screen: 'system' resolved against the operating system.
  isDark: boolean
  setMode: (mode: PanelMode) => void
  setPalette: (palette: PanelPaletteId) => void
}

const PanelThemeContext = createContext<PanelThemeContextValue | null>(null)

export function usePanelTheme(): PanelThemeContextValue {
  const ctx = useContext(PanelThemeContext)
  if (!ctx) throw new Error('usePanelTheme must be used within a PanelThemeProvider')
  return ctx
}

const subscribeMounted = () => () => {}

export function PanelThemeProvider({ children }: { children: ReactNode }) {
  // The hydration render sees the server snapshot (the default theme); applying it
  // would undo, for a frame, what the <head> script already put on screen.
  const hydrated = useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false,
  )
  const storedTheme = useSyncExternalStore(subscribeStoredTheme, getStoredThemeSnapshot, () => null)
  const systemDark = useSyncExternalStore(subscribeSystemDark, systemPrefersDark, () => false)
  const preference = storedTheme ? parsePanelTheme(storedTheme) : DEFAULT_PANEL_THEME
  const isDark = preference.mode === 'dark' || (preference.mode === 'system' && systemDark)

  useEffect(() => {
    if (hydrated) applyPanelTheme(preference.palette, isDark)
  }, [hydrated, preference.palette, isDark])

  useEffect(() => clearPanelTheme, [])

  const value: PanelThemeContextValue = {
    ...preference,
    isDark,
    setMode: mode => storeTheme({ ...preference, mode }),
    setPalette: palette => storeTheme({ ...preference, palette }),
  }

  return <PanelThemeContext.Provider value={value}>{children}</PanelThemeContext.Provider>
}
