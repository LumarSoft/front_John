'use client'

import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip'
import { useMonthUsage } from '../hooks/use-month-usage'
import { NEAR_LIMIT_PERCENT } from '../lib/month-usage'
import { numberLabel } from '../lib/number-label'

const int = (n: number) => n.toLocaleString('es-AR')

/** The month's messages against the plan, above the user menu. Opens Facturación. */
export function SidebarUsage({ enabled }: { enabled: boolean }) {
  const usage = useMonthUsage(enabled)
  if (!usage) return null

  const tone =
    usage.paused > 0
      ? 'bg-red-500 dark:bg-red-400'
      : usage.percent >= NEAR_LIMIT_PERCENT || usage.nearLimit
        ? 'bg-amber'
        : 'bg-ember'
  const several = usage.numbers.length > 1

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/admin/facturacion"
          aria-label={`Mensajes de ${usage.monthLabel}: ${int(usage.used)} de ${int(usage.included)}`}
          className="block rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
        >
          <div className="flex items-baseline justify-between gap-2 text-[11px] leading-none">
            <span className="text-muted-foreground">Mensajes de {usage.monthLabel}</span>
            <span className="text-muted-foreground tabular-nums">
              <span className="font-semibold text-sidebar-foreground">{int(usage.used)}</span> / {int(usage.included)}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line-2">
            <div className={`h-full rounded-full transition-all ${tone}`} style={{ width: `${usage.percent}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] leading-none text-muted-foreground">
            {usage.paused > 0 ? (
              <span className="font-medium text-red-600 dark:text-red-400">
                {usage.paused === 1 ? 'Asistente en pausa' : `${usage.paused} números en pausa`} · elegí qué hacer
              </span>
            ) : (
              <>
                {usage.remaining > 0 ? `Quedan ${int(usage.remaining)}` : 'Plan completo'}
                {several ? ` · ${usage.numbers.length} números` : ''}
              </>
            )}
          </p>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" align="end" className="max-w-64">
        {several ? (
          <ul className="space-y-0.5">
            {usage.numbers.map(n => (
              <li key={n.id} className="flex justify-between gap-3 tabular-nums">
                <span>{numberLabel(n)}</span>
                <span>
                  {int(n.used)} de {int(n.included)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <span>Al llegar al límite del plan, el asistente se pausa hasta que elijas. Detalle en Facturación.</span>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
