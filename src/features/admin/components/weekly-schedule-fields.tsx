'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { WEEKDAYS, WEEKDAY_LABEL, type WeeklySchedule } from '@/src/types/api/business-hours'

/** Monday to Sunday, each closed or with one or more shifts. */
export function WeeklyScheduleFields({
  value,
  onChange,
}: {
  value: WeeklySchedule
  onChange: (weekly: WeeklySchedule) => void
}) {
  const setDay = (day: keyof WeeklySchedule, ranges: WeeklySchedule[typeof day]) =>
    onChange({ ...value, [day]: ranges })

  const toggleDay = (day: keyof WeeklySchedule) =>
    setDay(day, value[day].length ? [] : [{ from: '09:00', to: '18:00' }])

  return (
    <div className="flex flex-col gap-3">
      {WEEKDAYS.map(day => {
        const ranges = value[day]
        const open = ranges.length > 0
        return (
          <div key={day} className="flex flex-col gap-2 rounded-xl border border-line-2 p-3 sm:flex-row sm:items-start">
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
                className="inline-flex w-fit items-center gap-1 text-[12.5px] font-semibold text-ember hover:underline disabled:pointer-events-none disabled:opacity-50"
              >
                <Plus className="size-3.5" /> Agregar turno
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
