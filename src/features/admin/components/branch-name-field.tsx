'use client'

import type { Ref } from 'react'
import { MapPin } from 'lucide-react'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { numberLabel } from '../lib/number-label'

interface Props {
  id: string
  value: string
  onChange: (value: string) => void
  /** The number, when it is already known, for the preview. */
  number?: string
  required?: boolean
  error?: string | null
  inputRef?: Ref<HTMLInputElement>
}

/** The branch's name, asked whenever a number is added: it is how the whole panel shows the number. */
export function BranchNameField({ id, value, onChange, number, required, error, inputRef }: Props) {
  const name = value.trim()
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>Nombre de la sucursal</Label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          ref={inputRef}
          required={required}
          maxLength={60}
          placeholder="Ej: 27 de Febrero, Pueblo Esther"
          className="h-10 pl-9"
          aria-invalid={error ? true : undefined}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
      <p className="text-[12.5px] text-muted-foreground">
        Es el nombre con el que se va a ver este número en todo el panel: filtros, listados, Facturación y Status. Usá
        el que conocen en la oficina, como la calle o la localidad.
      </p>
      {name && (
        <p className="text-[12.5px] text-muted-foreground">
          Se va a ver así:{' '}
          <span className="font-medium text-ink">
            {numberLabel({ number: number?.trim() || '+54 9 …', branchName: name })}
          </span>
        </p>
      )}
      {error && <p className="text-[12.5px] text-destructive">{error}</p>}
    </div>
  )
}
