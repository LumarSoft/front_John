'use client'

import { Skeleton } from '@/src/components/ui/skeleton'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { useNumberAssistant } from '../hooks/use-number-assistant'
import { numberAssistantFormKey } from '../lib/number-assistant-form'
import { numberLabel } from '../lib/number-label'
import { NumberAssistantEditor } from './number-assistant-editor'

/** Números → Asistente: a number's own name, office people, hours and data, over the organization's. */
export function NumberAssistantSheet({
  numberId,
  open,
  onOpenChange,
}: {
  numberId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data, isError } = useNumberAssistant(numberId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-[560px]">
        <SheetHeader className="border-b border-line-2 px-5 py-4 pr-12">
          <SheetTitle className="font-display text-[18px]">Asistente del número</SheetTitle>
          <SheetDescription>
            {data && data.id === numberId ? numberLabel(data) : 'Cargando…'} · Para una sucursal o un productor que
            atiende con su propio número.
          </SheetDescription>
        </SheetHeader>
        {isError && <p className="px-5 py-5 text-[14px] text-destructive">No se pudo cargar el asistente.</p>}
        {!isError && (!data || data.id !== numberId) && (
          <div className="flex flex-col gap-3 px-5 py-5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}
        {data && data.id === numberId && (
          <NumberAssistantEditor
            key={numberAssistantFormKey(data)}
            assistant={data}
            onSaved={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
