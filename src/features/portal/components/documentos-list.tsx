'use client'

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Car,
  Bike,
  Home,
  Heart,
  Briefcase,
  Shield,
  ShieldCheck,
  CreditCard,
  Receipt,
  ChevronDown,
  FileText,
  Download,
  Loader2,
  FolderOpen,
  RefreshCw,
} from 'lucide-react'
import { fetchPolizas, type PolizaListItem, type RiskType } from '@/src/services/polizas.service'
import { fetchPolizaDocumentos, type Documento } from '@/src/services/documentos.service'

const RISK_ICONS: Record<RiskType, React.ElementType> = {
  auto: Car,
  moto: Bike,
  home: Home,
  life: Heart,
  commercial: Briefcase,
  other: Shield,
}

function polizaSubject(p: PolizaListItem): string {
  if (p.vehiculo) {
    return [p.vehiculo.marca, p.vehiculo.modelo].filter(Boolean).join(' ') || `Póliza ${p.certificado}`
  }
  if (p.bien?.descripcion) return p.bien.descripcion.split(' - DNI:')[0].trim()
  return `Póliza ${p.certificado}`
}

// Per-policy lazy-loading state. Documents are fetched only when a policy is first
// expanded, then kept in memory so toggling open/closed never re-queries Triunfo.
type DocsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; docs: Documento[] }
  | { status: 'error'; message: string }

// Known Triunfo document codes → icon. Falls back to a generic file icon.
const DOC_ICONS: Record<string, React.ElementType> = {
  '1000': ShieldCheck, // Certificado de Cobertura
  '1001': CreditCard, // Tarjeta de Circulación
  '1002': Receipt, // Cupón de Pago
}

function DocumentoRow({ doc }: { doc: Documento }) {
  const Icon = DOC_ICONS[doc.codigo] ?? FileText
  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-line-2 bg-paper px-4 py-3 transition-shadow hover:shadow-[0_2px_12px_-4px_rgba(15,13,10,0.1)]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas-2">
        <Icon className="h-4 w-4 text-ink-3" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-ink">{doc.nombre}</p>
        {doc.codigo ? <p className="text-[11.5px] text-muted-foreground">Código {doc.codigo}</p> : null}
      </div>
      <Download className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-ember" />
    </a>
  )
}

function PolizaAccordion({ poliza }: { poliza: PolizaListItem }) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<DocsState>({ status: 'idle' })

  const Icon = RISK_ICONS[poliza.riskType]

  async function load() {
    setState({ status: 'loading' })
    try {
      const docs = await fetchPolizaDocumentos(poliza.id)
      setState({ status: 'loaded', docs })
    } catch (e) {
      setState({ status: 'error', message: e instanceof Error ? e.message : 'Error al cargar' })
    }
  }

  function toggle() {
    const next = !open
    setOpen(next)
    // Fetch only the first time the panel is opened.
    if (next && state.status === 'idle') void load()
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line-2 bg-paper">
      <button
        onClick={toggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-canvas-2/50"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas-2">
          <Icon className="h-5 w-5 text-ink-3" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] font-semibold tracking-[-0.02em] text-ink">{polizaSubject(poliza)}</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Póliza {poliza.certificado}
            {poliza.suplemento > 0 ? ` · Sup. ${poliza.suplemento}` : ''}
          </p>
        </div>
        <ChevronDown
          className={['h-4 w-4 shrink-0 text-muted-foreground transition-transform', open ? 'rotate-180' : ''].join(
            ' ',
          )}
        />
      </button>

      {open && (
        <div className="border-t border-line px-5 py-4">
          {state.status === 'loading' && (
            <div className="flex items-center gap-2 py-4 text-[13px] text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando documentos…
            </div>
          )}

          {state.status === 'error' && (
            <div className="flex items-center justify-between gap-3 py-2">
              <span className="flex items-center gap-2 text-[13px] text-red-600">
                <AlertCircle className="h-4 w-4" />
                {state.message}
              </span>
              <button
                onClick={load}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line-2 px-3 py-1.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-canvas-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reintentar
              </button>
            </div>
          )}

          {state.status === 'loaded' &&
            (state.docs.length === 0 ? (
              <p className="py-3 text-[13px] text-muted-foreground">Esta póliza no tiene documentos disponibles.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {state.docs.map(doc => (
                  <DocumentoRow key={doc.codigo} doc={doc} />
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export function DocumentosList() {
  const [polizas, setPolizas] = useState<PolizaListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPolizas()
      .then(setPolizas)
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-[14px] text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-[-0.025em] text-ink">Mis documentos</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Elegí una póliza para ver y descargar sus documentos.
        </p>
      </div>

      {polizas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-2 p-12 text-center">
          <FolderOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-[14px] text-muted-foreground">No tenés pólizas con documentos disponibles.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {polizas.map(p => (
            <PolizaAccordion key={p.id} poliza={p} />
          ))}
        </div>
      )}
    </div>
  )
}
