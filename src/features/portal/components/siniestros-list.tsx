'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Loader2, Plus, ShieldAlert, Paperclip, Calendar } from 'lucide-react'
import { fetchSiniestros, type Siniestro } from '@/src/services/siniestros.service'
import { TIPO_ICONS, TIPO_LABELS, ESTADO_META, ProgressBar, formatDate } from './siniestro-shared'

// ─── Siniestro card ──────────────────────────────────────

function SiniestroCard({ siniestro }: { siniestro: Siniestro }) {
  const TipoIcon = TIPO_ICONS[siniestro.tipo]
  const meta = ESTADO_META[siniestro.estado]
  const EstadoIcon = meta.icon
  const adjuntosCount = siniestro.adjuntos?.length ?? 0

  return (
    <Link
      href={`/portal/siniestros/${siniestro.id}`}
      className="flex flex-col rounded-2xl border border-line-2 bg-paper p-5 shadow-[0_2px_12px_-4px_rgba(15,13,10,0.07)] transition-shadow hover:shadow-[0_4px_20px_-4px_rgba(15,13,10,0.13)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas-2">
            <TipoIcon className="h-5 w-5 text-ink-3" />
          </div>
          <div>
            <h3 className="font-display text-[15px] font-semibold tracking-[-0.02em] text-ink">
              {TIPO_LABELS[siniestro.tipo]} · #{siniestro.id}
            </h3>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Póliza {siniestro.poliza.certificado}</p>
          </div>
        </div>
        <span
          className={[
            'inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider',
            meta.chipClass,
          ].join(' ')}
        >
          <EstadoIcon className="h-3 w-3" />
          {meta.label}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-[13px] text-ink-3 leading-snug">{siniestro.descripcion}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-faint">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          Hecho del {formatDate(siniestro.fecha)}
        </span>
        {adjuntosCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <Paperclip className="h-3.5 w-3.5" />
            {adjuntosCount} {adjuntosCount === 1 ? 'adjunto' : 'adjuntos'}
          </span>
        )}
      </div>

      <ProgressBar estado={siniestro.estado} />
    </Link>
  )
}

// ─── List ────────────────────────────────────────────────

export function SiniestrosList() {
  const [siniestros, setSiniestros] = useState<Siniestro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSiniestros()
      .then(setSiniestros)
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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-[-0.025em] text-ink">Mis siniestros</h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            {siniestros.length === 0
              ? 'No tenés denuncias registradas'
              : `${siniestros.length} ${siniestros.length === 1 ? 'denuncia' : 'denuncias'}`}
          </p>
        </div>
        <Link
          href="/portal/siniestros/nuevo"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-[13px] font-semibold text-paper transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nueva denuncia
        </Link>
      </div>

      {siniestros.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-2 p-12 text-center">
          <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-[14px] text-muted-foreground">Todavía no cargaste ninguna denuncia de siniestro.</p>
          <Link
            href="/portal/siniestros/nuevo"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-[13px] font-semibold text-paper transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Cargar una denuncia
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {siniestros.map(s => (
            <SiniestroCard key={s.id} siniestro={s} />
          ))}
        </div>
      )}
    </div>
  )
}
