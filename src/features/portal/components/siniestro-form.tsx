'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ArrowLeft, Loader2, Paperclip, UploadCloud, X } from 'lucide-react'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { type PolizaListItem } from '@/src/services/polizas.service'
import { createSiniestro, SINIESTRO_TIPOS, type SiniestroTipo } from '@/src/services/siniestros.service'
import { usePolizas } from '../hooks/use-portal-data'

const MAX_FILES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']

const TIPO_LABELS: Record<SiniestroTipo, string> = {
  auto: 'Automotor',
  hogar: 'Hogar',
  robo: 'Robo',
  otro: 'Otro',
}

function polizaLabel(p: PolizaListItem): string {
  const subject = p.vehiculo
    ? [p.vehiculo.marca, p.vehiculo.modelo, p.vehiculo.dominio].filter(Boolean).join(' ')
    : (p.bien?.descripcion?.split(' - DNI:')[0].trim() ?? '')
  return `${p.certificado}${subject ? ` · ${subject}` : ''}`
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const todayISO = (): string => new Date().toISOString().slice(0, 10)

export function SiniestroForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: polizas = [], isLoading: loadingPolizas } = usePolizas()

  const [polizaId, setPolizaId] = useState<string>('')
  const [tipo, setTipo] = useState<SiniestroTipo>('auto')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    setError(null)
    const next: File[] = [...files]
    for (const file of Array.from(incoming)) {
      if (next.length >= MAX_FILES) {
        setError(`Podés adjuntar hasta ${MAX_FILES} archivos`)
        break
      }
      if (!ACCEPTED.includes(file.type)) {
        setError(`Tipo de archivo no permitido: ${file.name}`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" supera los 5 MB`)
        continue
      }
      if (next.some(f => f.name === file.name && f.size === file.size)) continue
      next.push(file)
    }
    setFiles(next)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeFile(index: number) {
    setFiles(files.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!polizaId) {
      setError('Seleccioná una póliza')
      return
    }
    if (!descripcion.trim()) {
      setError('Contanos qué pasó en la descripción')
      return
    }
    if (!fecha) {
      setError('Indicá la fecha del hecho')
      return
    }
    if (fecha > todayISO()) {
      setError('La fecha del hecho no puede ser futura')
      return
    }

    setSubmitting(true)
    try {
      await createSiniestro({
        polizaId: Number(polizaId),
        tipo,
        descripcion: descripcion.trim(),
        fecha,
        adjuntos: files,
      })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.portal.siniestros })
      router.push('/portal/siniestros')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el siniestro')
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-line-2 bg-paper px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-ember placeholder:text-muted-foreground/60'
  const labelClass = 'mb-1.5 block text-[12.5px] font-semibold text-ink'

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-8">
      <Link
        href="/portal/siniestros"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a siniestros
      </Link>

      <div className="mb-6 mt-4">
        <h1 className="font-display text-[22px] font-semibold tracking-[-0.025em] text-ink">Nueva denuncia</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Cargá los datos del siniestro. Un asesor recibirá la denuncia y le dará seguimiento.
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Póliza */}
        <div>
          <label htmlFor="poliza" className={labelClass}>
            Póliza afectada
          </label>
          <select
            id="poliza"
            value={polizaId}
            onChange={e => setPolizaId(e.target.value)}
            disabled={loadingPolizas}
            className={inputClass}
          >
            <option value="" disabled>
              {loadingPolizas ? 'Cargando pólizas…' : 'Seleccioná una póliza'}
            </option>
            {polizas.map(p => (
              <option key={p.id} value={p.id}>
                {polizaLabel(p)}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo */}
        <div>
          <span className={labelClass}>Tipo de siniestro</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SINIESTRO_TIPOS.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={[
                  'rounded-xl border px-3 py-2.5 text-[13px] font-medium transition-colors',
                  tipo === t
                    ? 'border-ember bg-ember-soft text-ember-2'
                    : 'border-line-2 bg-paper text-ink-3 hover:bg-canvas-2',
                ].join(' ')}
              >
                {TIPO_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Fecha */}
        <div>
          <label htmlFor="fecha" className={labelClass}>
            Fecha del hecho
          </label>
          <input
            id="fecha"
            type="date"
            value={fecha}
            max={todayISO()}
            onChange={e => setFecha(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className={labelClass}>
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Contanos qué pasó, dónde y cualquier detalle relevante…"
            className={`${inputClass} resize-y`}
          />
          <p className="mt-1 text-right text-[11px] text-muted-foreground/70">{descripcion.length}/2000</p>
        </div>

        {/* Adjuntos */}
        <div>
          <span className={labelClass}>Adjuntos (opcional)</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-2 bg-canvas px-4 py-6 text-center transition-colors hover:border-ember hover:bg-ember-soft/30"
          >
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
            <span className="text-[13px] font-medium text-ink">Subí fotos o el PDF de la denuncia</span>
            <span className="text-[11.5px] text-muted-foreground">
              JPG, PNG, WEBP o PDF · hasta 5 MB c/u · máx. {MAX_FILES}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            multiple
            onChange={e => addFiles(e.target.files)}
            className="hidden"
          />

          {files.length > 0 && (
            <ul className="mt-3 flex flex-col gap-2">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-line-2 bg-paper px-3 py-2"
                >
                  <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{file.name}</span>
                  <span className="shrink-0 text-[11.5px] text-muted-foreground">{formatSize(file.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-canvas-2 hover:text-ink"
                    aria-label="Quitar archivo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Submit */}
        <div className="mt-2 flex items-center justify-end gap-3">
          <Link
            href="/portal/siniestros"
            className="rounded-xl px-4 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-ink"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-[13px] font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Enviando…' : 'Registrar denuncia'}
          </button>
        </div>
      </form>
    </div>
  )
}
