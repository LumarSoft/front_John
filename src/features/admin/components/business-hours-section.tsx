'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Skeleton } from '@/src/components/ui/skeleton'
import { WEEKDAY_LABEL, type WeeklySchedule } from '@/src/types/api/business-hours'
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
          tener el suyo desde Números → Asistente, donde también están sus feriados y pausas (cada número tiene los
          suyos).
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

  return <ScheduleEditor key={JSON.stringify(data.weekly)} initial={data.weekly} canEdit={canEdit} />
}
