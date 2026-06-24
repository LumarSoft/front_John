import { cn } from '@/src/lib/utils'
import type { SolicitudStatus } from '@/src/types/api/solicitudes'
import { STATUS_LABELS, STATUS_PILL_CLASS } from '../lib/solicitudes-ui'

export function StatusPill({ status, className }: Readonly<{ status: SolicitudStatus; className?: string }>) {
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full border px-2 text-[10.5px] font-semibold',
        STATUS_PILL_CLASS[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status]}
    </span>
  )
}
