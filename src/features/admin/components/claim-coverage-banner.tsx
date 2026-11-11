import { ShieldAlert, TriangleAlert } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import type { ClaimCoverageCheck, CoverageIssue } from '@/src/services/siniestros.service'

const LEVEL_META: Record<
  CoverageIssue['level'],
  { eyebrow: string; badge: string; box: string; pill: string; Icon: typeof ShieldAlert }
> = {
  danger: {
    eyebrow: 'Sin cobertura a la fecha del hecho',
    badge: 'Sin cobertura',
    box: 'border-red-300 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200',
    pill: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300',
    Icon: ShieldAlert,
  },
  warning: {
    eyebrow: 'Revisar la cobertura',
    badge: 'Revisar cobertura',
    box: 'border-amber/40 bg-amber/10 text-amber-900 dark:text-amber',
    pill: 'border-amber/30 bg-amber/15 text-amber-700 dark:text-amber',
    Icon: TriangleAlert,
  },
}

/**
 * Whether the claim's policy covered the day of the incident, as the API
 * worked it out from the cartera: red for what Triunfo states (cancelled,
 * outside the policy's dates), amber for what the office has to confirm
 * (installments that read as unpaid, cover under another policy). Nothing is
 * shown for a claim with no issues, or from an API that does not send the check.
 */
export function ClaimCoverageBanner({ check }: { check?: ClaimCoverageCheck | null }) {
  if (!check || check.issues.length === 0) return null
  return (
    <div className="flex flex-col gap-2.5" data-help="siniestro-cobertura">
      {check.issues.map(issue => {
        const meta = LEVEL_META[issue.level]
        return (
          <div
            key={issue.code}
            role={issue.level === 'danger' ? 'alert' : 'status'}
            className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', meta.box)}
          >
            <meta.Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-80">{meta.eyebrow}</div>
              <div className="mt-0.5 text-[15px] font-semibold leading-snug">{issue.title}</div>
              <p className="mt-1 text-[13px] leading-relaxed">{issue.detail}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** The same check in one pill, for the claims list; the tooltip says what was found. */
export function ClaimCoverageBadge({ check, className }: { check?: ClaimCoverageCheck | null; className?: string }) {
  if (!check || check.level === 'ok' || check.issues.length === 0) return null
  const meta = LEVEL_META[check.level]
  return (
    <span
      title={check.issues.map(issue => issue.title).join(' · ')}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4',
        meta.pill,
        className,
      )}
    >
      <meta.Icon className="size-3 shrink-0" aria-hidden />
      {meta.badge}
    </span>
  )
}
