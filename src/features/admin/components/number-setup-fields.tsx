'use client'

import { Bot, Clock, Landmark, Users } from 'lucide-react'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { WEEKDAY_LABEL, WEEKDAYS, type WeeklySchedule } from '@/src/types/api/business-hours'
import { splitNames } from '../lib/number-assistant-form'
import { firstInvalidDay } from '../lib/weekly-schedule'
import { WeeklyScheduleFields } from './weekly-schedule-fields'

/** What the office fills in before a number is connected. */
export interface NumberSetup {
  botName: string
  /** Whose assistant the bot says it is ("Vanesa Aguilar"). */
  presentationName: string
  /** The alias customers transfer to. */
  transferAlias: string
  /** Comma-separated names of the people of this office. */
  staff: string
  weekly: WeeklySchedule
}

export type NumberSetupField = keyof NumberSetup

export const EMPTY_WEEK: WeeklySchedule = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }

export const EMPTY_NUMBER_SETUP: NumberSetup = {
  botName: '',
  presentationName: '',
  transferAlias: '',
  staff: '',
  weekly: EMPTY_WEEK,
}

/** The inputs' ids, so the form that embeds the fields can focus the first one in error. */
export const NUMBER_SETUP_INPUT_IDS: Record<Exclude<NumberSetupField, 'weekly'>, string> = {
  botName: 'setup-bot-name',
  presentationName: 'setup-presentation',
  transferAlias: 'setup-transfer-alias',
  staff: 'setup-staff',
}

/**
 * Every field is required: a number that starts without them greets as the
 * head office, with its people and its hours (Roldán greeted as "John
 * Pellegrini Management Group" on 6/11). Returns one message per missing or
 * wrong field, in form order.
 */
export function numberSetupErrors(setup: NumberSetup): Partial<Record<NumberSetupField, string>> {
  const errors: Partial<Record<NumberSetupField, string>> = {}
  if (!setup.botName.trim()) errors.botName = 'Escribí cómo se llama el bot en este número.'
  if (!setup.presentationName.trim()) errors.presentationName = 'Escribí de quién se presenta como asistente.'
  if (!setup.transferAlias.trim()) errors.transferAlias = 'Escribí el alias al que transfieren los clientes.'
  if (splitNames(setup.staff).length === 0) errors.staff = 'Escribí al menos una persona de la oficina.'
  const invalid = firstInvalidDay(setup.weekly)
  if (invalid) errors.weekly = `Revisá ${WEEKDAY_LABEL[invalid]}: el inicio debe ser anterior al fin.`
  else if (!WEEKDAYS.some(day => setup.weekly[day].length > 0)) errors.weekly = 'Abrí al menos un día con su horario.'
  return errors
}

/** The setup as the API takes it. */
export function numberSetupPayload(setup: NumberSetup) {
  return {
    botName: setup.botName.trim(),
    presentationName: setup.presentationName.trim(),
    transferAlias: setup.transferAlias.trim(),
    staffNames: splitNames(setup.staff),
    businessHours: setup.weekly,
  }
}

interface Props {
  value: NumberSetup
  onChange: (value: NumberSetup) => void
  errors?: Partial<Record<NumberSetupField, string>>
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[12.5px] text-muted-foreground">{children}</p>
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-[12.5px] text-destructive">{message}</p> : null
}

/**
 * The assistant of a number, asked together with the branch name before the
 * number is connected: how the bot is called, whose assistant it says it is,
 * the people the customers may write to and when the office answers.
 */
export function NumberSetupFields({ value, onChange, errors = {} }: Props) {
  const set = <K extends NumberSetupField>(key: K, field: NumberSetup[K]) => onChange({ ...value, [key]: field })
  const botName = value.botName.trim() || 'el bot'
  const presentation = value.presentationName.trim()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="setup-bot-name">Nombre del bot</Label>
        <div className="relative">
          <Bot className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={NUMBER_SETUP_INPUT_IDS.botName}
            required
            maxLength={60}
            placeholder="Ej: Nico"
            className="h-10 pl-9"
            aria-invalid={errors.botName ? true : undefined}
            value={value.botName}
            onChange={e => set('botName', e.target.value)}
          />
        </div>
        <Hint>Cómo se presenta el asistente en los chats de este número.</Hint>
        <FieldError message={errors.botName} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="setup-presentation">De quién es asistente</Label>
        <Input
          id={NUMBER_SETUP_INPUT_IDS.presentationName}
          required
          maxLength={120}
          placeholder="Ej: Vanesa Aguilar"
          className="h-10"
          aria-invalid={errors.presentationName ? true : undefined}
          value={value.presentationName}
          onChange={e => set('presentationName', e.target.value)}
        />
        <Hint>
          El nombre de la sucursal o de quien la atiende, tal como lo conocen los clientes. Es el que el bot usa al
          saludar y cuando responde en texto libre.
        </Hint>
        {presentation && (
          <Hint>
            Va a saludar así:{' '}
            <span className="font-medium text-ink">
              ¡Hola! Soy {botName}, el asistente de {presentation} 👋
            </span>
          </Hint>
        )}
        <FieldError message={errors.presentationName} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="setup-transfer-alias">Alias para transferencias</Label>
        <div className="relative">
          <Landmark className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={NUMBER_SETUP_INPUT_IDS.transferAlias}
            required
            maxLength={60}
            placeholder="Ej: TRUENO.VUELO.DELTA"
            className="h-10 pl-9"
            aria-invalid={errors.transferAlias ? true : undefined}
            value={value.transferAlias}
            onChange={e => set('transferAlias', e.target.value)}
          />
        </div>
        <Hint>
          El alias que el bot da cuando un cliente quiere pagar por transferencia. El CBU, el titular y el banco se
          completan después en Asistente.
        </Hint>
        <FieldError message={errors.transferAlias} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="setup-staff">Personas de la oficina</Label>
        <div className="relative">
          <Users className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={NUMBER_SETUP_INPUT_IDS.staff}
            required
            placeholder="Ej: Vanesa, Vane, Emilia, Emi"
            className="h-10 pl-9"
            aria-invalid={errors.staff ? true : undefined}
            value={value.staff}
            onChange={e => set('staff', e.target.value)}
          />
        </div>
        <Hint>
          Separadas por coma, con las variantes con que las nombran los clientes. Si alguien escribe «Hola Vane», el bot
          le avisa a esa persona y sigue atendiendo.
        </Hint>
        <FieldError message={errors.staff} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" /> Horario de atención
        </Label>
        <Hint>
          Cuándo contesta la oficina de esta sucursal. Fuera de ese horario el bot avisa que responden al reabrir.
        </Hint>
        <WeeklyScheduleFields value={value.weekly} onChange={weekly => set('weekly', weekly)} />
        <FieldError message={errors.weekly} />
      </div>
    </div>
  )
}
