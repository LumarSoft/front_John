'use client'

import { useState, type ReactNode } from 'react'
import { Smartphone } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import { cn } from '@/src/lib/utils'
import { useNumberAssistant } from '../hooks/use-number-assistant'
import { useOwnNumbers } from '../hooks/use-own-numbers'
import { numberAssistantFormKey } from '../lib/number-assistant-form'
import { numberLabel } from '../lib/number-label'
import { NumberAssistantEditor } from './number-assistant-editor'

function EditorSkeleton() {
  return (
    <Card className="max-w-2xl border-line-2">
      <CardHeader className="flex flex-col gap-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardHeader>
    </Card>
  )
}

/**
 * Configuración → Asistente for a branch's admin: their own number's assistant,
 * never the whole organization's, which only the SuperAdmin changes. On 6/11
 * and 10/11 a branch's admin saved their branch's name, people and bank account
 * as the organization's and every other branch started using them.
 */
export function OwnNumberSettings({ fallback }: { fallback: ReactNode }) {
  const { numbers, isLoading, isError } = useOwnNumbers()
  const [picked, setPicked] = useState<number | null>(null)
  const selectedId = numbers.some(number => number.id === picked) ? picked : (numbers[0]?.id ?? null)
  const { data: assistant, isError: assistantError } = useNumberAssistant(selectedId)

  if (isLoading) return <EditorSkeleton />
  if (isError) return <p className="text-[14px] text-destructive">No se pudieron cargar tus números.</p>

  if (!numbers.length) {
    return (
      <div className="space-y-5">
        <div className="flex max-w-xl gap-3 rounded-xl border border-line-2 bg-canvas-2 px-4 py-3 text-[13px] text-ink-3">
          <Smartphone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p>
            No tenés un número de WhatsApp a cargo. Esto es lo de toda la organización y solo un SuperAdmin lo cambia.
          </p>
        </div>
        {fallback}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {numbers.length > 1 && (
        <div className="flex max-w-2xl flex-wrap gap-2" role="group" aria-label="Tus números">
          {numbers.map(number => (
            <button
              key={number.id}
              type="button"
              aria-pressed={number.id === selectedId}
              onClick={() => setPicked(number.id)}
              className={cn(
                'rounded-lg border px-3 py-2 text-left text-[13px] transition-colors',
                number.id === selectedId
                  ? 'border-ember bg-ember-soft font-medium text-ink'
                  : 'border-line-2 text-ink-3 hover:border-line-strong',
              )}
            >
              {numberLabel(number)}
            </button>
          ))}
        </div>
      )}

      {assistantError && <p className="text-[14px] text-destructive">No se pudo cargar el asistente de tu número.</p>}
      {!assistantError && (!assistant || assistant.id !== selectedId) && <EditorSkeleton />}
      {assistant && assistant.id === selectedId && (
        <Card data-help="config-mi-numero" className="max-w-2xl gap-0 overflow-visible border-line-2 py-0 shadow-sm">
          <CardHeader className="border-b border-line-2 px-5 py-4">
            <CardTitle className="font-display text-[18px]">Asistente de tu número</CardTitle>
            <CardDescription>
              {numberLabel(assistant)}. Lo que cambies acá vale solo para este número. Lo que dejes vacío usa lo de toda
              la organización (se ve en gris), que solo cambia un SuperAdmin.
            </CardDescription>
          </CardHeader>
          <NumberAssistantEditor key={numberAssistantFormKey(assistant)} assistant={assistant} inline />
        </Card>
      )}
    </div>
  )
}
