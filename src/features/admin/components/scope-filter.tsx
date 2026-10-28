'use client'

import { useOwnProducerCodes } from '../hooks/use-own-producer-codes'
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
  /** Text of the "no filter" option. */
  allLabel?: string
}

/**
 * Combined "ver todo o filtrar" combobox for the SuperAdmin sections. One select
 * with two groups — Números/Sucursales and Productores — plus "Todos". Choosing a
 * número filters by the codes that number serves (and, in the inbox, by that exact
 * number); choosing a productor filters by that single code. A plain admin
 * (already restricted to their own codes by the API) gets a select of those
 * codes when they have more than one, so a branch with several productores
 * can work one at a time; with a single code there is nothing to choose.
 */
export function ScopeFilter({ value, onChange, className, allLabel = 'Todos' }: ScopeFilterProps) {
  const { isSuperAdmin } = useRole()
  const { data: codes } = useProducerCodes(isSuperAdmin)
  const { data: numbers } = usePhoneNumbers(isSuperAdmin)
  const ownCodes = useOwnProducerCodes()

  if (!isSuperAdmin) {
    if (ownCodes.length < 2) return null
    return (
      <select
        value={value.producerCodeId ?? ''}
        onChange={e => onChange(e.target.value ? { producerCodeId: Number(e.target.value) } : {})}
        className={`h-10 rounded-md border border-line-2 bg-background px-3 text-[13px] text-ink-3 ${className ?? ''}`}
        aria-label="Filtrar por productor"
      >
        <option value="">{allLabel}</option>
        {ownCodes.map(c => (
          <option key={c.id} value={c.id}>
            {c.code}
            {c.holderName ? ` · ${c.holderName}` : ''}
          </option>
        ))}
      </select>
    )
  }

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
      <option value="">{allLabel}</option>
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
