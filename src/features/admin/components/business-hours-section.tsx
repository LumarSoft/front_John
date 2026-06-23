'use client'

import { useState } from 'react'
import { CalendarOff, Clock, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Skeleton } from '@/src/components/ui/skeleton'
import { WEEKDAYS, WEEKDAY_LABEL, type Closure, type WeeklySchedule } from '@/src/types/api/business-hours'
import { useBusinessHours } from '../hooks/use-business-hours'
import { useBusinessHoursActions } from '../hooks/use-business-hours-actions'

function ScheduleEditor({ initial }: { initial: WeeklySchedule }) {
  const { updateSchedule } = useBusinessHoursActions()
  const [weekly, setWeekly] = useState<WeeklySchedule>(initial)

  const dirty = JSON.stringify(weekly) !== JSON.stringify(initial)

  const setDay = (day: keyof WeeklySchedule, ranges: WeeklySchedule[typeof day]) =>
    setWeekly(w => ({ ...w, [day]: ranges }))

  const toggleDay = (day: keyof WeeklySchedule) =>
    setDay(day, weekly[day].length ? [] : [{ from: '09:00', to: '18:00' }])

  const save = () => {
    for (const d of WEEKDAYS) {
      for (const r of weekly[d]) {
        if (r.from >= r.to) {
          toast.error(`Revisá ${WEEKDAY_LABEL[d]}: el inicio debe ser anterior al fin.`)
          return
        }
      }
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
          saber si está abierto. Podés cargar dos turnos en un mismo día.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {WEEKDAYS.map(day => {
          const ranges = weekly[day]
          const open = ranges.length > 0
          return (
            <div
              key={day}
              className="flex flex-col gap-2 rounded-xl border border-line-2 p-3 sm:flex-row sm:items-start"
            >
              <label className="flex w-36 shrink-0 cursor-pointer items-center gap-2 select-none">
                <input type="checkbox" checked={open} onChange={() => toggleDay(day)} className="size-4 accent-ember" />
                <span className="text-[14px] font-semibold text-ink">{WEEKDAY_LABEL[day]}</span>
                <span className={`text-[11.5px] font-semibold ${open ? 'text-ember' : 'text-muted-foreground'}`}>
                  {open ? 'Abierto' : 'Cerrado'}
                </span>
              </label>

              <div className="flex flex-1 flex-col gap-2">
                {!open && (
                  <span className="text-[13px] text-muted-foreground">
                    Cerrado. Tocá <span className="font-semibold text-ink">Agregar turno</span> para abrirlo.
                  </span>
                )}
                {ranges.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={r.from}
                      onChange={e =>
                        setDay(
                          day,
                          ranges.map((x, idx) => (idx === i ? { ...x, from: e.target.value } : x)),
                        )
                      }
                      className="h-9 w-[120px]"
                    />
                    <span className="text-muted-foreground">a</span>
                    <Input
                      type="time"
                      value={r.to}
                      onChange={e =>
                        setDay(
                          day,
                          ranges.map((x, idx) => (idx === i ? { ...x, to: e.target.value } : x)),
                        )
                      }
                      className="h-9 w-[120px]"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setDay(
                          day,
                          ranges.filter((_, idx) => idx !== i),
                        )
                      }
                      aria-label="Quitar turno"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setDay(day, [...ranges, { from: '09:00', to: '13:00' }])}
                  className="inline-flex w-fit items-center gap-1 text-[12.5px] font-semibold text-ember hover:underline"
                >
                  <Plus className="size-3.5" /> Agregar turno
                </button>
              </div>
            </div>
          )
        })}
      </CardContent>
      <CardFooter>
        <Button type="button" onClick={save} disabled={!dirty || updateSchedule.isPending} className="h-10">
          {updateSchedule.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Guardando…
            </>
          ) : (
            'Guardar horarios'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function fmtRange(c: Closure): string {
  const f = (d: string) => d.split('-').reverse().join('/')
  return c.startDate === c.endDate ? f(c.startDate) : `${f(c.startDate)} → ${f(c.endDate)}`
}

function ClosuresManager({ closures }: { closures: Closure[] }) {
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
              </li>
            ))}
          </ul>
        )}

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
      </CardContent>
      <CardFooter>
        <Button type="button" onClick={add} disabled={addClosure.isPending} className="h-10">
          {addClosure.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Agregando…
            </>
          ) : (
            'Agregar pausa'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export function BusinessHoursSection() {
  const { data, isLoading, isError } = useBusinessHours()

  if (isLoading) {
    return (
      <Card className="mt-6 max-w-2xl border-line-2">
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
    return <p className="mt-6 text-[14px] text-destructive">No se pudieron cargar los horarios.</p>
  }

  return (
    <div className="mt-6 flex flex-col">
      <div className="mb-3 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.3em] text-ember-2">
        <Clock className="size-3.5" /> Horarios
      </div>
      <ScheduleEditor key={JSON.stringify(data.weekly)} initial={data.weekly} />
      <ClosuresManager closures={data.closures} />
    </div>
  )
}
