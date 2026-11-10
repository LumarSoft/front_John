import { CAMPAIGN_PAGES, campaignHref } from './campaign-pages'

interface Screen {
  path: string
  /** The tab and the section it lands on (see use-panel-link). */
  query?: Record<string, string>
  /** Screens about one record take its id: `pantalla:numero-pagos/12` → `?numero=12`. */
  idParam?: string
}

const config = (tab: string, seccion?: string): Screen => ({
  path: '/admin/configuracion',
  query: { tab, ...(seccion ? { seccion } : {}) },
})
const number = (seccion?: string): Screen => ({
  path: '/admin/numeros',
  idParam: 'numero',
  ...(seccion ? { query: { seccion } } : {}),
})

/**
 * Where the AI assistant can send the person with `[Ir a …](pantalla:ID)` or
 * `(pantalla:ID/NUM)`: the screen, its tab and the exact section. The ids are
 * the API's (api_john src/assistant/panel-guide.ts, PANEL_SCREENS): add a
 * screen here first, then there.
 */
export const SCREENS = {
  inicio: { path: '/admin' },
  asuntos: { path: '/admin/novedades' },
  whatsapp: { path: '/admin/inbox' },
  tareas: { path: '/admin/tareas', query: { vista: 'mine' } },
  'tareas-asignadas': { path: '/admin/tareas', query: { vista: 'created' } },
  asegurados: { path: '/admin/asegurados' },
  solicitudes: { path: '/admin/solicitudes' },
  siniestros: { path: '/admin/siniestros' },
  siniestro: { path: '/admin/siniestros', idParam: 'siniestro' },
  cobranzas: { path: '/admin/cobranzas', query: { tab: 'cuotas' } },
  'cobranzas-vencidas': { path: '/admin/cobranzas', query: { tab: 'vencidas' } },
  rechazos: { path: '/admin/rechazos' },
  balance: { path: '/admin/balance' },
  campanas: { path: '/admin/campanas' },
  ...Object.fromEntries(CAMPAIGN_PAGES.map(page => [`campana-${page.slug}`, { path: campaignHref(page) }])),
  numeros: { path: '/admin/numeros' },
  numero: number(),
  'numero-datos': number('numero-datos'),
  'numero-bot': number('numero-bot'),
  'numero-horario': number('numero-horario'),
  'numero-feriados': number('numero-feriados'),
  'numero-pagos': number('numero-pagos'),
  'numero-coberturas': number('numero-coberturas'),
  usuarios: { path: '/admin/usuarios' },
  facturacion: { path: '/admin/facturacion' },
  'facturacion-planes': { path: '/admin/facturacion', query: { tab: 'planes' } },
  configuracion: config('cuenta'),
  'config-cuenta': config('cuenta'),
  'config-asistente': config('asistente', 'config-bot'),
  'config-datos': config('asistente', 'config-presentacion'),
  'config-asistencia': config('asistente', 'config-asistencia'),
  'config-pagos': config('asistente', 'config-pagos'),
  'config-cotizaciones': config('asistente', 'config-cotizaciones'),
  'config-logo': config('marca'),
  'config-horarios': config('horarios', 'horarios-form'),
  'config-precios': config('precios'),
  'config-coberturas': config('coberturas'),
  mejoras: { path: '/admin/mejoras', query: { tab: 'mejoras' } },
  'mejoras-propuestas': { path: '/admin/mejoras', query: { tab: 'propuestas' } },
  status: { path: '/admin/status' },
} satisfies Record<string, Screen> as Record<string, Screen>

export function isScreenId(id: string): boolean {
  return Object.hasOwn(SCREENS, id)
}

/** The screen's address, with its tab, section and, when it takes one, the record's id. */
export function screenHref(id: string, recordId?: number): string {
  const screen = SCREENS[id]
  if (!screen) return '/admin'
  const params = new URLSearchParams(screen.query)
  if (screen.idParam && recordId) params.set(screen.idParam, String(recordId))
  const query = params.toString()
  return query ? `${screen.path}?${query}` : screen.path
}
