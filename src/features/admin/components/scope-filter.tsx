'use client'

import { useProducerCodes } from '../hooks/use-producer-codes'
import { usePhoneNumbers } from '../hooks/use-phone-numbers'
import { useRole } from '../hooks/use-role'

/** A section filter value: either a producer code OR a phone number (never both). */
export interface ScopeFilterValue {
  producerCodeId?: number
  phoneNumberId?: number
}

interface ScopeFilterProps {
  value: ScopeFilterValue
  onChange: (value: ScopeFilterValue) => void
  className?: string
}

/**
 * Combined "ver todo o filtrar" combobox for the SuperAdmin sections. One select
 * with two groups — Números/Sucursales and Productores — plus "Todos". Choosing a
 * número filters by the codes that number serves (and, in the inbox, by that exact
 * number); choosing a productor filters by that single code. Hidden for plain
 * admins (already restricted to their own codes by the API).
 */
export function ScopeFilter({ value, onChange, className }: ScopeFilterProps) {
  const { isSuperAdmin } = useRole()
  const { data: codes } = useProducerCodes(isSuperAdmin)
  const { data: numbers } = usePhoneNumbers(isSuperAdmin)

  if (!isSuperAdmin) return null

  const selected =
    value.producerCodeId != null
      ? `c:${value.producerCodeId}`
      : value.phoneNumberId != null
        ? `p:${value.phoneNumberId}`
        : ''

  const handle = (raw: string) => {
    if (!raw) return onChange({})
    const [kind, idStr] = raw.split(':')
    const id = Number(idStr)
    onChange(kind === 'c' ? { producerCodeId: id } : { phoneNumberId: id })
  }

  return (
    <select
      value={selected}
      onChange={e => handle(e.target.value)}
      className={`h-10 rounded-md border border-line-2 bg-background px-3 text-[13px] text-ink-3 ${className ?? ''}`}
      aria-label="Filtrar por número o productor"
    >
      <option value="">Todos</option>
      {numbers && numbers.length > 0 && (
        <optgroup label="Números / Sucursales">
          {numbers.map(n => (
            <option key={`p${n.id}`} value={`p:${n.id}`}>
              {n.number}
              {n.responsibleCode ? ` · ${n.responsibleCode.code}` : ''}
            </option>
          ))}
        </optgroup>
      )}
      {codes && codes.length > 0 && (
        <optgroup label="Productores">
          {codes.map(c => (
            <option key={`c${c.id}`} value={`c:${c.id}`}>
              {c.code}
              {c.holderName ? ` · ${c.holderName}` : ''}
              {c.isMaster ? ' (master)' : ''}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  )
}
