'use client'

import { useState, type KeyboardEvent } from 'react'
import { CalendarOff, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import type { Closure } from '@/src/types/api/business-hours'
import { useNumberClosures } from '../hooks/use-number-assistant'

/** How many closures show before "ver todos": a year of national holidays is a long list. */
const FIRST_SHOWN = 4

function fmtRange(c: Closure): string {
  const f = (d: string) => d.split('-').reverse().join('/')
  return c.startDate === c.endDate ? f(c.startDate) : `${f(c.startDate)} → ${f(c.endDate)}`
}

/** A number's own holidays and closures: closing one branch never closes the others. */
export function NumberClosures({
  numberId,
  closures,
  canEdit,
}: {
  numberId: number
  closures: Closure[]
  canEdit: boolean
}) {
  const { addClosure, removeClosure } = useNumberClosures(numberId)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? closures : closures.slice(0, FIRST_SHOWN)
  const hidden = closures.length - shown.length

  const add = () => {
    if (!startDate || !reason.trim()) {
      toast.error('Completá la fecha de inicio y el motivo.')
      return
    }
    const end = endDate || startDate
    if (end < startDate) {
      toast.error('La fecha de fin no puede ser anterior al inicio.')
      return
    }
    addClosure.mutate(
      { startDate, endDate: end, reason: reason.trim() },
      {
        onSuccess: () => {
          setStartDate('')
          setEndDate('')
          setReason('')
          toast.success('Pausa agregada en este número')
        },
        onError: () => toast.error('No se pudo agregar la pausa.'),
      },
    )
  }

  // Enter adds the closure instead of saving the rest of the sheet.
  const addOnEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    add()
  }

  return (
    <div className="flex flex-col gap-3">
      {closures.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {shown.map(c => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line-2 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <CalendarOff className="size-4 shrink-0 text-ember" />
                  {fmtRange(c)}
                  {c.holiday && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                      Feriado nacional
                    </span>
                  )}
                </div>
                <div className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                  {c.holiday ? c.reason.replace(/^feriado nacional:\s*/i, '') : c.reason}
                </div>
              </div>
              {canEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    removeClosure.mutate(c.id, {
                      onSuccess: () => toast.success('Este número atiende ese día'),
                      onError: () => toast.error('No se pudo quitar la pausa.'),
                    })
                  }
                  disabled={removeClosure.isPending}
                  aria-label={c.holiday ? 'Atender este feriado' : 'Quitar pausa'}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </li>
          ))}
          {(hidden > 0 || showAll) && closures.length > FIRST_SHOWN && (
            <li>
              <button
                type="button"
                onClick={() => setShowAll(all => !all)}
                className="text-[12.5px] font-medium text-ember-2 underline-offset-2 hover:underline"
              >
                {showAll ? 'Ver menos' : `Ver ${hidden} más`}
              </button>
            </li>
          )}
        </ul>
      ) : (
        <p className="text-[12.5px] text-muted-foreground">No hay feriados ni pausas próximos en este número.</p>
      )}

      {canEdit && (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-dashed border-line-2 p-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="closure-start">Desde</Label>
            <Input
              id="closure-start"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              onKeyDown={addOnEnter}
              className="h-10"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="closure-end">
              Hasta <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="closure-end"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              onKeyDown={addOnEnter}
              className="h-10"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="closure-reason">Motivo</Label>
            <Input
              id="closure-reason"
              type="text"
              maxLength={160}
              placeholder="Ej: Vacaciones de la sucursal"
              value={reason}
              onChange={e => setReason(e.target.value)}
              onKeyDown={addOnEnter}
              className="h-10"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={add} disabled={addClosure.isPending} className="h-9">
              {addClosure.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Agregando…
                </>
              ) : (
                'Agregar pausa'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
