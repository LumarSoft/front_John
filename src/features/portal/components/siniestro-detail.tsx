'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Calendar, Clock, FileText, ImageIcon, Loader2, Paperclip, Shield } from 'lucide-react'
import { adjuntoUrl, fetchSiniestro, type Adjunto, type Siniestro } from '@/src/services/siniestros.service'
import { TIPO_ICONS, TIPO_LABELS, ESTADO_META, ProgressBar, formatDate } from './siniestro-shared'

function isImage(adjunto: Adjunto): boolean {
  return adjunto.mimeType.startsWith('image/')
}

function AdjuntoItem({ adjunto }: { adjunto: Adjunto }) {
  const url = adjuntoUrl(adjunto)
  const image = isImage(adjunto)
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-line-2 bg-paper transition-shadow hover:shadow-[0_2px_12px_-4px_rgba(15,13,10,0.12)]"
    >
      <div className="flex h-28 items-center justify-center overflow-hidden bg-canvas-2">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={adjunto.originalName} className="h-full w-full object-cover" />
        ) : (
          <FileText className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        {image ? (
          <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 flex-1 truncate text-[12px] text-ink group-hover:underline">
          {adjunto.originalName}
        </span>
      </div>
    </a>
  )
}

export function SiniestroDetailView({ id }: { id: number }) {
  const [siniestro, setSiniestro] = useState<Siniestro | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSiniestro(id)
      .then(setSiniestro)
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !siniestro) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-[14px] text-muted-foreground">{error ?? 'Siniestro no encontrado'}</p>
        <Link href="/portal/siniestros" className="text-[13px] font-medium text-ember-2 hover:underline">
          Volver a siniestros
        </Link>
      </div>
    )
  }

  const TipoIcon = TIPO_ICONS[siniestro.tipo]
  const meta = ESTADO_META[siniestro.estado]
  const EstadoIcon = meta.icon
  const adjuntos = siniestro.adjuntos ?? []

  return (
    <div className="mx-auto max-w-3xl p-6 md:p-8">
      <Link
        href="/portal/siniestros"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a siniestros
      </Link>

      {/* Header */}
      <div className="mb-6 mt-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-canvas-2">
            <TipoIcon className="h-5 w-5 text-ink-3" />
          </div>
          <div>
            <h1 className="font-display text-[22px] font-semibold tracking-[-0.025em] text-ink">
              {TIPO_LABELS[siniestro.tipo]} · #{siniestro.id}
            </h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Denuncia de siniestro</p>
          </div>
        </div>
        <span
          className={[
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider',
            meta.chipClass,
          ].join(' ')}
        >
          <EstadoIcon className="h-3.5 w-3.5" />
          {meta.label}
        </span>
      </div>

      {/* Progress */}
      <div className="rounded-2xl border border-line-2 bg-paper p-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Seguimiento</p>
        <ProgressBar estado={siniestro.estado} />
      </div>

      {/* Meta */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line-2 bg-paper px-4 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Póliza
          </p>
          <p className="mt-1 text-[14px] font-semibold text-ink">{siniestro.poliza.certificado}</p>
        </div>
        <div className="rounded-xl border border-line-2 bg-paper px-4 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Fecha del hecho
          </p>
          <p className="mt-1 text-[14px] font-semibold text-ink">{formatDate(siniestro.fecha)}</p>
        </div>
        <div className="rounded-xl border border-line-2 bg-paper px-4 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Cargada el
          </p>
          <p className="mt-1 text-[14px] font-semibold text-ink">{formatDate(siniestro.createdAt)}</p>
        </div>
      </div>

      {/* Descripción */}
      <div className="mt-5 rounded-2xl border border-line-2 bg-paper p-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Descripción</p>
        <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">{siniestro.descripcion}</p>
      </div>

      {/* Adjuntos */}
      <div className="mt-5 rounded-2xl border border-line-2 bg-paper p-5">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          <Paperclip className="h-3.5 w-3.5" />
          Adjuntos {adjuntos.length > 0 ? `(${adjuntos.length})` : ''}
        </p>
        {adjuntos.length === 0 ? (
          <p className="mt-2 text-[13px] text-muted-foreground">No se adjuntaron archivos a esta denuncia.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {adjuntos.map((a, i) => (
              <AdjuntoItem key={`${a.filename}-${i}`} adjunto={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
