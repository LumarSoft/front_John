'use client'

import { useState, type FormEvent } from 'react'
import { Bot, Loader2, Power, PowerOff } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/src/components/ui/alert-dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { ApiError } from '@/src/lib/api-client'
import { cn } from '@/src/lib/utils'
import { WEEKDAY_LABEL } from '@/src/types/api/business-hours'
import type { BotProfile } from '@/src/types/api/config'
import type { NumberAssistant } from '@/src/types/api/phone-numbers'
import { useNumberAssistant, useSetNumberBotStatus, useUpdateNumberAssistant } from '../hooks/use-number-assistant'
import {
  EMPTY_COVERAGE_DRAFT,
  emptyNumberAssistantDraft,
  numberAssistantChanges,
  splitNames,
  toNumberAssistantDraft,
  type Choice,
  type CoverageDraft,
  type NumberAssistantDraft,
} from '../lib/number-assistant-form'
import { firstInvalidDay } from '../lib/weekly-schedule'
import { BOT_PROFILE_GROUPS } from './bot-profile-section'
import { NumberClosures } from './number-closures'
import { WeeklyScheduleFields } from './weekly-schedule-fields'

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-[13.5px] font-semibold text-ink">{title}</h3>
      <p className="mt-0.5 text-[12.5px] text-muted-foreground">{description}</p>
    </div>
  )
}

// The transfer account is inherited as a whole: with any field of its own, the number uses only its own.
const ACCOUNT_FIELDS: ReadonlyArray<keyof BotProfile> = [
  'transferAlias',
  'transferCbu',
  'transferHolder',
  'transferBank',
]

const choiceClasses = (selected: boolean): string =>
  cn(
    'flex-1 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors',
    selected ? 'border-ember bg-ember-soft font-medium text-ink' : 'border-line-2 text-ink-3 hover:border-line-strong',
  )

const selectClasses = 'h-9 rounded-lg border border-line-2 bg-transparent px-2 text-[13px] text-ink'

const formatWhen = (iso: string): string =>
  new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

/** The number's own bot switch: off, the office answers this number's chats itself. */
function NumberBotSwitch({ assistant, canEdit }: { assistant: NumberAssistant; canEdit: boolean }) {
  const setStatus = useSetNumberBotStatus(assistant.id)
  const on = assistant.own.botEnabled !== false
  const last = assistant.lastBotStatusChange

  const flip = (botEnabled: boolean) =>
    setStatus.mutate(botEnabled, {
      onSuccess: () =>
        toast.success(botEnabled ? 'El bot volvió a responder en este número' : 'El bot quedó apagado en este número'),
      onError: () => toast.error('No se pudo cambiar el bot de este número. Intentá de nuevo.'),
    })

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle
        title="El bot en este número"
        description="Apagado, los mensajes de este número entran a Whatsapp y los responde la oficina sin tomar cada chat. Los demás números siguen igual."
      />
      <div
        className={cn(
          'flex flex-col gap-3 rounded-xl border p-3',
          on ? 'border-line-2' : 'border-destructive/40 bg-destructive/5',
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
            {on ? (
              <Power className="size-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <PowerOff className="size-4 text-destructive" />
            )}
            {on ? 'Activo' : 'Apagado'}
          </span>
          {canEdit &&
            (on ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" size="sm" className="h-9" disabled={setStatus.isPending}>
                    <PowerOff className="size-4" /> Apagar en este número
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Apagar el bot en {assistant.number}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      El corte es inmediato. El bot deja de responder en los chats de este número y la oficina contesta
                      desde Whatsapp sin tomar cada chat. Los demás números siguen igual.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => flip(false)}>Apagar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button type="button" size="sm" className="h-9" disabled={setStatus.isPending} onClick={() => flip(true)}>
                <Power className="size-4" /> Encender
              </Button>
            ))}
        </div>
        {last && (
          <p className="text-[12px] text-muted-foreground">
            {last.botEnabled ? 'Encendido' : 'Apagado'} por {last.by ?? 'alguien del equipo'} el {formatWhen(last.at)}.
          </p>
        )}
      </div>
    </section>
  )
}

function AssistantForm({ assistant, onDone }: { assistant: NumberAssistant; onDone: () => void }) {
  const update = useUpdateNumberAssistant(assistant.id)
  const initial = toNumberAssistantDraft(assistant)
  const [draft, setDraft] = useState<NumberAssistantDraft>(initial)
  const { organization, canEdit } = assistant

  const changes = numberAssistantChanges(initial, draft)
  const hasChanges = Object.keys(changes).length > 0
  const set = <K extends keyof NumberAssistantDraft>(key: K, value: NumberAssistantDraft[K]) =>
    setDraft(prev => ({ ...prev, [key]: value }))

  const ownAccount = ACCOUNT_FIELDS.some(key => draft.profile[key].trim())
  const inherited = (key: keyof BotProfile): string | null =>
    ownAccount && ACCOUNT_FIELDS.includes(key) ? null : organization.botProfile[key]

  const name = draft.botName.trim() || organization.botName
  const orgName = draft.profile.orgName.trim() || organization.botProfile.orgName || organization.name
  const preview = name ? `Soy ${name}, el asistente de ${orgName}` : `Soy el asistente de ${orgName}`

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return
    const invalid = draft.ownHours ? firstInvalidDay(draft.weekly) : null
    if (invalid) {
      toast.error(`Revisá ${WEEKDAY_LABEL[invalid]}: el inicio debe ser anterior al fin.`)
      return
    }
    update.mutate(changes, {
      onSuccess: () => {
        toast.success('Asistente del número actualizado')
        onDone()
      },
      onError: error =>
        toast.error(
          error instanceof ApiError && error.status === 400
            ? `Revisá los datos: ${error.message}`
            : 'No se pudo guardar. Intentá de nuevo.',
        ),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {!canEdit && (
          <p className="mb-5 rounded-lg border border-line-2 bg-canvas-2 px-3 py-2 text-[12.5px] text-muted-foreground">
            Solo un SuperAdmin o un administrador del código de este número puede cambiarlo.
          </p>
        )}
        <fieldset disabled={!canEdit} className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <SectionTitle
              title="El asistente"
              description="Lo que dejes vacío usa lo de la organización, que se ve en gris."
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="number-bot-name">Nombre del asistente</Label>
              <div className="relative">
                <Bot className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="number-bot-name"
                  maxLength={60}
                  placeholder={organization.botName ?? 'Sin nombre'}
                  className="h-10 pl-9"
                  value={draft.botName}
                  onChange={e => set('botName', e.target.value)}
                />
              </div>
              <p className="text-[12.5px] text-muted-foreground">
                Vista previa: <span className="text-ink">{preview}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="number-staff">Personas de la oficina</Label>
              <Input
                id="number-staff"
                maxLength={200}
                placeholder={organization.staffNames.join(', ') || 'Ej: Caro, Carolina'}
                className="h-10"
                value={draft.staff}
                onChange={e => set('staff', e.target.value)}
              />
              <p className="text-[12.5px] text-muted-foreground">
                Separados por coma. Si un cliente de este número le escribe a alguien por su nombre, el bot le avisa en
                Asuntos pendientes.
                {splitNames(draft.staff).length === 0 && organization.staffNames.length > 0 && (
                  <> Hoy usa las de la organización.</>
                )}
              </p>
            </div>
          </section>

          <NumberBotSwitch assistant={assistant} canEdit={canEdit} />

          <section className="flex flex-col gap-4">
            <SectionTitle title="Horario de atención" description="Con el que el bot dice si están atendiendo." />
            <div className="flex gap-2">
              <button type="button" className={choiceClasses(!draft.ownHours)} onClick={() => set('ownHours', false)}>
                El de la organización
              </button>
              <button type="button" className={choiceClasses(draft.ownHours)} onClick={() => set('ownHours', true)}>
                Horario propio
              </button>
            </div>
            {draft.ownHours && <WeeklyScheduleFields value={draft.weekly} onChange={weekly => set('weekly', weekly)} />}
          </section>

          <section className="flex flex-col gap-4">
            <SectionTitle
              title="Feriados y pausas"
              description="Solo de este número: cerrarlo no cierra los demás. Los feriados nacionales se cargan solos; si este número atiende uno, quitalo. Se guardan al agregarlos o quitarlos."
            />
            <NumberClosures numberId={assistant.id} closures={assistant.own.closures ?? []} canEdit={canEdit} />
          </section>

          {BOT_PROFILE_GROUPS.map(group => (
            <section key={group.title} className="flex flex-col gap-4">
              <SectionTitle title={group.title} description={group.description} />
              {group.fields.map(field => (
                <div key={field.key} className="flex flex-col gap-2">
                  <Label htmlFor={`number-${field.key}`}>{field.label}</Label>
                  <Input
                    id={`number-${field.key}`}
                    type={field.type ?? 'text'}
                    maxLength={field.maxLength}
                    placeholder={inherited(field.key) ?? field.placeholder}
                    className="h-10"
                    value={draft.profile[field.key]}
                    onChange={e => set('profile', { ...draft.profile, [field.key]: e.target.value })}
                  />
                </div>
              ))}
              {group.fields.some(field => ACCOUNT_FIELDS.includes(field.key)) && (
                <p className="text-[12px] text-muted-foreground">
                  Si cargás una cuenta propia, el asistente da solo los datos de cuenta que cargues acá: nunca los
                  mezcla con los de la organización.
                </p>
              )}
            </section>
          ))}

          {organization.coverages && organization.coverages.length > 0 && (
            <section className="flex flex-col gap-4">
              <SectionTitle
                title="Coberturas que ofrece este número"
                description="Las coberturas y sus textos son los de la organización (Configuración → Coberturas). Acá elegís cuáles ofrece este número, cuál recomienda y en qué orden; lo que dejes «como la organización» sigue sus cambios."
              />
              <div className="flex flex-col gap-2">
                {organization.coverages.map(coverage => {
                  const row = draft.coverages[coverage.code] ?? EMPTY_COVERAGE_DRAFT
                  const setRow = (patch: Partial<CoverageDraft>) =>
                    set('coverages', { ...draft.coverages, [coverage.code]: { ...row, ...patch } })
                  return (
                    <div key={coverage.code} className="flex flex-col gap-2 rounded-xl border border-line-2 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-ink">{coverage.name}</span>
                        <span className="text-[11.5px] text-muted-foreground">{coverage.code}</span>
                        {coverage.needsReview && (
                          <span className="text-[11.5px] text-ember-2">sin descripción: no se ofrece</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <label className="flex flex-col gap-1 text-[12px] text-muted-foreground">
                          Ofrecer
                          <select
                            className={selectClasses}
                            value={row.isActive}
                            onChange={e => setRow({ isActive: e.target.value as Choice })}
                          >
                            <option value="">Como la organización ({coverage.isActive ? 'sí' : 'no'})</option>
                            <option value="yes">Sí</option>
                            <option value="no">No</option>
                          </select>
                        </label>
                        <label className="flex flex-col gap-1 text-[12px] text-muted-foreground">
                          Recomendada
                          <select
                            className={selectClasses}
                            value={row.highlighted}
                            onChange={e => setRow({ highlighted: e.target.value as Choice })}
                          >
                            <option value="">Como la organización ({coverage.highlighted ? 'sí' : 'no'})</option>
                            <option value="yes">Sí, «La más elegida»</option>
                            <option value="no">No</option>
                          </select>
                        </label>
                        <label className="flex flex-col gap-1 text-[12px] text-muted-foreground">
                          Orden
                          <Input
                            type="number"
                            min={0}
                            max={999}
                            className="h-9"
                            placeholder={`${coverage.sortOrder} (organización)`}
                            value={row.sortOrder}
                            onChange={e => setRow({ sortOrder: e.target.value })}
                          />
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-[12px] text-muted-foreground">
                Menor orden va primero y la recomendada siempre encabeza la lista. Las motos usan el catálogo fijo de
                Triunfo.
              </p>
            </section>
          )}
        </fieldset>
      </div>

      {canEdit && (
        <SheetFooter className="flex-row items-center justify-between border-t border-line-2 px-5 py-3">
          <Button
            type="button"
            variant="ghost"
            className="h-10 text-muted-foreground"
            onClick={() => setDraft(emptyNumberAssistantDraft(assistant))}
          >
            Usar todo lo de la organización
          </Button>
          <Button type="submit" disabled={!hasChanges || update.isPending} className="h-10">
            {update.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Guardando…
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </SheetFooter>
      )}
    </form>
  )
}

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
            {data && data.id === numberId ? data.number : 'Cargando…'} · Para una sucursal o un productor que atiende
            con su propio número.
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
          <AssistantForm
            // Flipping the bot switch or changing a closure must not reset what is being edited.
            key={JSON.stringify({ ...data.own, botEnabled: undefined, closures: undefined })}
            assistant={data}
            onDone={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
