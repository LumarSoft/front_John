import { ShieldAlert } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { BLOCKED_CLAIM_LABELS, type BlockedClaimReason } from '@/src/types/api/novedades'

/**
 * A claim the bot refused to file and sent to the office: no policy in force, a
 * rejected payment or overdue installments. `compact` keeps only "Denuncia
 * frenada" (the reason stays in the tooltip) for tight rows like the chat list.
 */
export function BlockedClaimBadge({
  reason,
  compact = false,
  className,
}: {
  reason: BlockedClaimReason
  compact?: boolean
  className?: string
}) {
  const label = BLOCKED_CLAIM_LABELS[reason]
  return (
    <span
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium leading-4 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300',
        className,
      )}
    >
      <ShieldAlert className="size-3 shrink-0" aria-hidden />
      {compact ? 'Denuncia frenada' : label}
    </span>
  )
}
