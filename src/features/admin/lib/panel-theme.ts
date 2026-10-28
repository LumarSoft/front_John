// Appearance of the admin panel: light/dark mode plus a colour palette. The choice
// lives in this browser (localStorage) and only applies under /admin, so the public
// site keeps its own colours. The palettes themselves are CSS at the end of app/globals.css.

export type PanelMode = 'light' | 'dark' | 'system'

export type PanelPaletteId = 'dorado' | 'azul' | 'turquesa' | 'violeta' | 'rosa' | 'grafito'

export interface PanelPalette {
  id: PanelPaletteId
  label: string
  description: string
}

export interface PanelThemePreference {
  mode: PanelMode
  palette: PanelPaletteId
}

export const PANEL_PALETTES: PanelPalette[] = [
  { id: 'dorado', label: 'Dorado', description: 'La de siempre' },
  { id: 'azul', label: 'Azul', description: 'Clásica y sobria' },
  { id: 'turquesa', label: 'Turquesa', description: 'Fresca y tranquila' },
  { id: 'violeta', label: 'Violeta', description: 'Moderna' },
  { id: 'rosa', label: 'Rosa', description: 'Cálida y alegre' },
  { id: 'grafito', label: 'Grafito', description: 'Blanco y negro' },
]

export const PANEL_MODES: PanelMode[] = ['light', 'dark', 'system']

export const DEFAULT_PANEL_THEME: PanelThemePreference = { mode: 'light', palette: 'dorado' }

export const PANEL_THEME_STORAGE_KEY = 'panel-theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function isPanelMode(value: unknown): value is PanelMode {
  return PANEL_MODES.includes(value as PanelMode)
}

function isPanelPalette(value: unknown): value is PanelPaletteId {
  return PANEL_PALETTES.some(palette => palette.id === value)
}

export function parsePanelTheme(raw: string | null): PanelThemePreference {
  if (!raw) return DEFAULT_PANEL_THEME
  try {
    const stored: unknown = JSON.parse(raw)
    if (typeof stored !== 'object' || stored === null) return DEFAULT_PANEL_THEME
    const { mode, palette } = stored as Record<string, unknown>
    return {
      mode: isPanelMode(mode) ? mode : DEFAULT_PANEL_THEME.mode,
      palette: isPanelPalette(palette) ? palette : DEFAULT_PANEL_THEME.palette,
    }
  } catch {
    return DEFAULT_PANEL_THEME
  }
}

export function systemPrefersDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches
}

export function subscribeSystemDark(listener: () => void): () => void {
  const query = window.matchMedia(DARK_QUERY)
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}

export function applyPanelTheme(palette: PanelPaletteId, dark: boolean): void {
  const root = document.documentElement
  root.dataset.palette = palette
  root.classList.toggle('dark', dark)
  root.style.colorScheme = dark ? 'dark' : 'light'
}

// Leaving the panel (e.g. to the public site) must not carry its theme along.
export function clearPanelTheme(): void {
  const root = document.documentElement
  delete root.dataset.palette
  root.classList.remove('dark')
  root.style.removeProperty('color-scheme')
}

// Runs in <head> before the first paint, so a dark or non-default panel never
// flashes the default colours while React loads. Same rules as applyPanelTheme.
export const PANEL_THEME_SCRIPT = `(function(){try{
if(!/^\\/admin(\\/|$)/.test(location.pathname))return;
var t=JSON.parse(localStorage.getItem(${JSON.stringify(PANEL_THEME_STORAGE_KEY)})||'{}')||{};
var p=${JSON.stringify(PANEL_PALETTES.map(palette => palette.id))}.indexOf(t.palette)>=0?t.palette:${JSON.stringify(DEFAULT_PANEL_THEME.palette)};
var d=t.mode==='dark'||(t.mode==='system'&&matchMedia(${JSON.stringify(DARK_QUERY)}).matches);
var r=document.documentElement;r.setAttribute('data-palette',p);
if(d)r.classList.add('dark');r.style.colorScheme=d?'dark':'light';
}catch(e){}})()`
