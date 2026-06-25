import { Car, Home, ShieldAlert, HelpCircle, CheckCircle2, Clock, Loader } from 'lucide-react'
import type { SiniestroEstado, SiniestroTipo } from '@/src/services/siniestros.service'

export const TIPO_LABELS: Record<SiniestroTipo, string> = {
  auto: 'Automotor',
  hogar: 'Hogar',
  robo: 'Robo',
  otro: 'Otro',
}

export const TIPO_ICONS: Record<SiniestroTipo, React.ElementType> = {
  auto: Car,
  hogar: Home,
  robo: ShieldAlert,
  otro: HelpCircle,
}

export interface EstadoMeta {
  label: string
  progress: number // 0..1
  icon: React.ElementType
  chipClass: string
  barClass: string
}

export const ESTADO_META: Record<SiniestroEstado, EstadoMeta> = {
  pendiente: {
    label: 'Pendiente',
    progress: 1 / 3,
    icon: Clock,
    chipClass: 'bg-amber-50 text-amber-700 border-amber-200',
    barClass: 'bg-amber-400',
  },
  en_proceso: {
    label: 'En proceso',
    progress: 2 / 3,
    icon: Loader,
    chipClass: 'bg-blue-50 text-blue-700 border-blue-200',
    barClass: 'bg-blue-400',
  },
  resuelto: {
    label: 'Resuelto',
    progress: 1,
    icon: CheckCircle2,
    chipClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    barClass: 'bg-emerald-500',
  },
}

export const ESTADO_STEPS: { key: SiniestroEstado; label: string }[] = [
  { key: 'pendiente', label: 'Recibida' },
  { key: 'en_proceso', label: 'En proceso' },
  { key: 'resuelto', label: 'Resuelta' },
]

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function ProgressBar({ estado }: { estado: SiniestroEstado }) {
  const meta = ESTADO_META[estado]
  return (
    <div className="mt-4">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas-2">
        <div
          className={`h-full rounded-full transition-all ${meta.barClass}`}
          style={{ width: `${meta.progress * 100}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between">
        {ESTADO_STEPS.map((step, i) => {
          const reached = meta.progress >= (i + 1) / ESTADO_STEPS.length
          return (
            <span
              key={step.key}
              className={['text-[10.5px] font-medium', reached ? 'text-ink' : 'text-muted-foreground/50'].join(' ')}
            >
              {step.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
