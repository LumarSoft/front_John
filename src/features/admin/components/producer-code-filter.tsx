'use client'

import { useProducerCodes } from '../hooks/use-producer-codes'
import { useRole } from '../hooks/use-role'

interface ProducerCodeFilterProps {
  value?: number
  onChange: (value?: number) => void
  className?: string
}

/**
 * "Filter by código" selector for the cartera views. Only rendered for a
 * SuperAdmin (a plain admin is already restricted to their own codes by the API).
 */
export function ProducerCodeFilter({ value, onChange, className }: ProducerCodeFilterProps) {
  const { isSuperAdmin } = useRole()
  const { data: codes } = useProducerCodes(isSuperAdmin)

  if (!isSuperAdmin) return null

  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value ? Number(e.target.value) : undefined)}
      className={`h-10 rounded-md border border-line-2 bg-background px-3 text-[13px] text-ink-3 ${className ?? ''}`}
      aria-label="Filtrar por código de productor"
    >
      <option value="">Todos los códigos</option>
      {(codes ?? []).map(code => (
        <option key={code.id} value={code.id}>
          {code.code}
          {code.holderName ? ` · ${code.holderName}` : ''}
          {code.isMaster ? ' (master)' : ''}
        </option>
      ))}
    </select>
  )
}
