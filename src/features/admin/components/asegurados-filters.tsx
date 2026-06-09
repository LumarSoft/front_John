'use client'

import { ArrowDownAZ, ArrowUpDown, Check, X } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import type { ClientEstadoFilter, ClientSort, RiskType } from '@/src/types/api/clients'
import { RiskIcon } from '../lib/asegurados-ui'

const RAMOS: { value: RiskType; label: string }[] = [
  { value: 'auto', label: 'Automotor' },
  { value: 'home', label: 'Hogar' },
  { value: 'life', label: 'Vida' },
  { value: 'commercial', label: 'Comercial' },
]

const SORT_LABELS: Record<ClientSort, string> = {
  nombre_asc: 'Apellido (A–Z)',
  nombre_desc: 'Apellido (Z–A)',
  reciente: 'Más recientes',
}

const ESTADO_LABELS: Record<ClientEstadoFilter, string> = {
  vigente: 'Con póliza vigente',
  por_vencer: 'Por vencer (30d)',
  vencida: 'Sin pólizas vigentes',
  sin_polizas: 'Sin pólizas',
}

interface AseguradosFiltersProps {
  riskType?: RiskType
  estado?: ClientEstadoFilter
  sort: ClientSort
  onRiskTypeChange: (value?: RiskType) => void
  onEstadoChange: (value?: ClientEstadoFilter) => void
  onSortChange: (value: ClientSort) => void
}

export function AseguradosFilters({
  riskType,
  estado,
  sort,
  onRiskTypeChange,
  onEstadoChange,
  onSortChange,
}: AseguradosFiltersProps) {
  const hasFilters = !!riskType || !!estado

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {RAMOS.map(ramo => {
          const active = riskType === ramo.value
          return (
            <Button
              key={ramo.value}
              type="button"
              size="sm"
              variant={active ? 'default' : 'outline'}
              onClick={() => onRiskTypeChange(active ? undefined : ramo.value)}
              className="h-8 rounded-full border-line-2 px-3 text-[12.5px]"
            >
              <RiskIcon type={ramo.value} className="size-3.5" />
              {ramo.label}
            </Button>
          )
        })}
      </div>

      {estado && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onEstadoChange(undefined)}
          className="h-8 gap-1 rounded-full bg-ember-soft px-3 text-[12.5px] text-ember-2 hover:bg-ember-soft/80"
        >
          {ESTADO_LABELS[estado]}
          <X className="size-3.5" />
        </Button>
      )}

      <div className="ml-auto flex items-center gap-2">
        {hasFilters && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              onRiskTypeChange(undefined)
              onEstadoChange(undefined)
            }}
            className="h-8 px-2.5 text-[12.5px] text-muted-foreground"
          >
            Limpiar
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" size="sm" variant="outline" className="h-8 border-line-2 px-3 text-[12.5px]">
              <ArrowUpDown className="size-3.5" />
              {SORT_LABELS[sort]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {(Object.keys(SORT_LABELS) as ClientSort[]).map(value => (
              <DropdownMenuItem key={value} onClick={() => onSortChange(value)} className="justify-between">
                <span className="flex items-center gap-2">
                  <ArrowDownAZ className="size-3.5 text-muted-foreground" />
                  {SORT_LABELS[value]}
                </span>
                {sort === value && <Check className="size-3.5 text-ember-2" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
