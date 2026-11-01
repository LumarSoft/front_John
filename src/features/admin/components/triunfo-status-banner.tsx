'use client'

import { TriangleAlert } from 'lucide-react'
import { useTriunfoStatus } from '../hooks/use-triunfo-status'
import { formatDayTime } from '../lib/triunfo-errors'

/**
 * Warns the whole office while Triunfo refuses the organization's credentials:
 * on 30/10/2026 that lasted a day without anyone in the panel knowing.
 */
export function TriunfoStatusBanner({ enabled }: { enabled: boolean }) {
  const { data } = useTriunfoStatus(enabled)
  if (!data?.failingSince) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-3 border-b border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <p>
        <span className="font-semibold">
          Triunfo rechaza las credenciales desde el {formatDayTime(data.failingSince)}
        </span>
        {data.failureMessage ? ` («${data.failureMessage}»)` : ''}. Mientras tanto no se pueden traer pólizas ni
        documentos, no se puede cotizar y la cartera no se actualiza. Si cambiaron la contraseña de TriunfoNet, avisale
        a Lumarsoft para cargar la nueva.
      </p>
    </div>
  )
}
