import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Badge } from '@/src/components/ui/badge'
import type { PolizaStatus } from '../lib/asegurados-ui'

export function PolizaStatusBadge({ status }: { status: PolizaStatus }) {
  if (status.estado === 'vencida') {
    return (
      <Badge variant="destructive" className="gap-1 text-[11px]">
        <ShieldAlert className="size-3" />
        {status.label}
      </Badge>
    )
  }
  if (status.estado === 'expiring') {
    return (
      <Badge className="gap-1 bg-amber text-[11px] text-[#1a1206] hover:bg-amber/90">
        <AlertTriangle className="size-3" />
        {status.label}
      </Badge>
    )
  }
  return (
    <Badge
      variant="secondary"
      className="gap-1 bg-emerald-50 text-[11px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
    >
      <ShieldCheck className="size-3" />
      {status.label}
    </Badge>
  )
}
