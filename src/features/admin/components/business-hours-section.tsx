'use client'

import { useState } from 'react'
import { CalendarOff, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Skeleton } from '@/src/components/ui/skeleton'
import { WEEKDAY_LABEL, type Closure, type WeeklySchedule } from '@/src/types/api/business-hours'
import { useBusinessHours } from '../hooks/use-business-hours'
import { useBusinessHoursActions } from '../hooks/use-business-hours-actions'
import { firstInvalidDay } from '../lib/weekly-schedule'
import { SuperAdminOnlyNote } from './super-admin-only-note'
import { WeeklyScheduleFields } from './weekly-schedule-fields'

function ScheduleEditor({ initial, canEdit }: { initial: WeeklySchedule; canEdit: boolean }) {
  const { updateSchedule } = useBusinessHoursActions()
  const [weekly, setWeekly] = useState<WeeklySchedule>(initial)

  const dirty = JSON.stringify(weekly) !== JSON.stringify(initial)

  const save = () => {
    const invalid = firstInvalidDay(weekly)
    if (invalid) {
      toast.error(`Revisá ${WEEKDAY_LABEL[invalid]}: el inicio debe ser anterior al fin.`)
      return
    }
    updateSchedule.mutate(weekly, {
      onSuccess: () => toast.success('Horarios actualizados'),
      onError: () => toast.error('No se pudo guardar. Revisá que no haya rangos superpuestos.'),
    })
  }

  return (
    <Card className="max-w-2xl border-line-2 shadow-sm">
      <CardHeader>
        <CardTitle className="font-display text-[18px]">Horarios de atención</CardTitle>
        <CardDescription>
          Definí el horario de lunes a domingo. Se muestra igual en el bot de WhatsApp y en la web, y el bot lo usa para
          saber si está abierto. Podés cargar dos turnos en un mismo día. Es el de toda la organización: un número puede
          tener el suyo desde Números → Asistente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <fieldset disabled={!canEdit} className="contents">
          <WeeklyScheduleFields value={weekly} onChange={setWeekly} />
        </fieldset>
      </CardContent>
      <CardFooter>
        {canEdit ? (
          <Button type="button" onClick={save} disabled={!dirty || updateSchedule.isPending} className="h-10">
            {updateSchedule.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Guardando…
              </>
            ) : (
              'Guardar horarios'
            )}
          </Button>
        ) : (
          <SuperAdminOnlyNote />
        )}
      </CardFooter>
    </Card>
  )
}

function fmtRange(c: Closure): string {
  const f = (d: string) => d.split('-').reverse().join('/')
  return c.startDate === c.endDate ? f(c.startDate) : `${f(c.startDate)} → ${f(c.endDate)}`
}

function ClosuresManager({ closures, canEdit }: { closures: Closure[]; canEdit: boolean }) {
  const { addClosure, removeClosure } = useBusinessHoursActions()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

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
          toast.success('Pausa agregada')
        },
        onError: () => toast.error('No se pudo agregar la pausa.'),
      },
    )
  }

  return (
    <Card className="mt-6 max-w-2xl border-line-2 shadow-sm">
      <CardHeader>
        <CardTitle className="font-display text-[18px]">Pausas y feriados</CardTitle>
        <CardDescription>
          Cerrá un día (o un rango) por feriado o vacaciones. El motivo es obligatorio: el bot se lo informa a quien
          pregunte por el horario.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {closures.length > 0 && (
          <ul className="flex flex-col gap-2">
            {closures.map(c => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line-2 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
                    <CalendarOff className="size-4 shrink-0 text-ember" />
                    {fmtRange(c)}
                  </div>
                  <div className="mt-0.5 truncate text-[13px] text-muted-foreground">{c.reason}</div>
                </div>
                {canEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      removeClosure.mutate(c.id, { onError: () => toast.error('No se pudo quitar la pausa.') })
                    }
                    disabled={removeClosure.isPending}
                    aria-label="Quitar pausa"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        {closures.length === 0 && !canEdit && (
          <p className="text-[13px] text-muted-foreground">No hay pausas ni feriados cargados.</p>
        )}
        {canEdit && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="closure-start">Desde</Label>
              <Input
                id="closure-start"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
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
                className="h-10"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="closure-reason">Motivo</Label>
              <Input
                id="closure-reason"
                type="text"
                maxLength={160}
                placeholder="Ej: Feriado — Día de la Bandera"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {canEdit ? (
          <Button type="button" onClick={add} disabled={addClosure.isPending} className="h-10">
            {addClosure.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Agregando…
              </>
            ) : (
              'Agregar pausa'
            )}
          </Button>
        ) : (
          <SuperAdminOnlyNote />
        )}
      </CardFooter>
    </Card>
  )
}

export function BusinessHoursSection({ canEdit }: { canEdit: boolean }) {
  const { data, isLoading, isError } = useBusinessHours()

  if (isLoading) {
    return (
      <Card className="max-w-2xl border-line-2">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (isError || !data) {
    return <p className="text-[14px] text-destructive">No se pudieron cargar los horarios.</p>
  }

  return (
    <div className="flex flex-col">
      <ScheduleEditor key={JSON.stringify(data.weekly)} initial={data.weekly} canEdit={canEdit} />
      <ClosuresManager closures={data.closures} canEdit={canEdit} />
    </div>
  )
}
