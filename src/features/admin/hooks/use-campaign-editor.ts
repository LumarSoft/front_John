import { useRef, useState } from 'react'
import type {
  Campaign,
  CampaignSettingField,
  CampaignSettingValue,
  UpdateCampaignRequest,
} from '@/src/types/api/campaigns'
import { useCampaignSettingsActions } from './use-campaigns'
import { exampleValues, parseCodes, parseDays, renderMessage } from '../lib/campaigns-format'

type SettingValue = CampaignSettingValue

/** A setting as the input holds it: numbers as typed, lists (codes, days, options) as comma-separated text. */
function settingText(value: SettingValue | undefined): string {
  if (Array.isArray(value)) return value.join(', ')
  return value == null ? '' : String(value)
}

/** The options of a field that are ticked, in the field's order. */
export function pickedOptions(field: CampaignSettingField, text: string): string[] {
  const picked = parseList(text)
  return (field.options ?? []).map(o => o.value).filter(value => picked.includes(value))
}

const parseList = (text: string) =>
  text
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)

function settingValue(field: CampaignSettingField, text: string): SettingValue {
  if (field.type === 'codes') return parseCodes(text)
  if (field.type === 'days') return parseDays(text)
  if (field.type === 'options') return pickedOptions(field, text)
  return Number(text)
}

/** Lists compare without case: the API stores coverage codes in capitals ("C2 FULL" for "C2 Full"). */
function sameSetting(a: SettingValue | undefined, b: SettingValue): boolean {
  return Array.isArray(a) && Array.isArray(b) ? a.join(',').toUpperCase() === b.join(',').toUpperCase() : a === b
}

/** Why a setting cannot be saved as typed, or null. */
function settingError(field: CampaignSettingField, text: string): string | null {
  if (field.type === 'codes') return parseCodes(text).length ? null : `${field.label}: poné al menos un código.`
  if (field.type === 'options') {
    return pickedOptions(field, text).length ? null : `${field.label}: elegí al menos una opción.`
  }
  if (field.type === 'days') {
    const days = parseDays(text)
    if (days.some(d => Number.isNaN(d))) return `${field.label}: escribí días enteros separados por coma.`
    if (days.length > 5) return `${field.label}: hasta 5 recordatorios.`
    if (days.some(d => (field.min != null && d < field.min) || (field.max != null && d > field.max))) {
      return `${field.label}: cada uno va de ${field.min} a ${field.max} días.`
    }
    return null
  }
  const n = Number(text)
  if (text.trim() === '' || !Number.isInteger(n)) return `${field.label}: tiene que ser un número entero.`
  if (field.min != null && n < field.min) return `${field.label}: el mínimo es ${field.min}.`
  if (field.max != null && n > field.max) return `${field.label}: el máximo es ${field.max}.`
  return null
}

/**
 * The "Mensaje" tab's draft of one campaign: the message, the percentage and the settings as typed, what
 * changed against the saved campaign, why it cannot be saved yet, and the preview with the example values.
 */
export function useCampaignEditor(campaign: Campaign) {
  const { update, refreshTemplates } = useCampaignSettingsActions()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [body, setBody] = useState(campaign.body)
  const [percent, setPercent] = useState(String(campaign.discountPercent))
  const [settings, setSettings] = useState<Record<string, string>>(() =>
    Object.fromEntries(campaign.settingFields.map(f => [f.key, settingText(campaign.settings[f.key])])),
  )

  const percentNumber = Number(percent)
  const percentError =
    percent.trim() === '' || !Number.isInteger(percentNumber) || percentNumber < 0 || percentNumber > 100
      ? 'El porcentaje va de 0 a 100, sin decimales.'
      : null
  const bodyError = body.trim() ? null : 'Escribí el mensaje.'
  const fieldErrors = campaign.settingFields.map(f => settingError(f, settings[f.key] ?? '')).filter(Boolean)
  const error = bodyError ?? percentError ?? fieldErrors[0] ?? null

  const changes: UpdateCampaignRequest = {}
  if (body.trim() !== campaign.body) changes.body = body.trim()
  if (!percentError && percentNumber !== campaign.discountPercent) changes.discountPercent = percentNumber
  const changedSettings = Object.fromEntries(
    campaign.settingFields
      .filter(f => !settingError(f, settings[f.key] ?? ''))
      .map(f => [f.key, settingValue(f, settings[f.key] ?? '')] as const)
      .filter(([key, value]) => !sameSetting(campaign.settings[key], value)),
  )
  if (Object.keys(changedSettings).length) changes.settings = { ...campaign.settings, ...changedSettings }
  const dirty = Object.keys(changes).length > 0

  /** Writes `{key}` where the cursor is (or at the end) and leaves the cursor after it. */
  const insertPlaceholder = (key: string) => {
    const token = `{${key}}`
    const el = textareaRef.current
    const start = el?.selectionStart ?? body.length
    const end = el?.selectionEnd ?? body.length
    setBody(body.slice(0, start) + token + body.slice(end))
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      el.setSelectionRange(start + token.length, start + token.length)
    })
  }

  const setSetting = (key: string, text: string) => setSettings(current => ({ ...current, [key]: text }))
  /** Ticks or unticks one option of an `options` setting. */
  const toggleOption = (field: CampaignSettingField, value: string) => {
    const picked = pickedOptions(field, settings[field.key] ?? '')
    const next = picked.includes(value) ? picked.filter(v => v !== value) : [...picked, value]
    setSetting(field.key, next.join(', '))
  }

  return {
    textareaRef,
    body,
    setBody,
    percent,
    setPercent,
    settings,
    setSetting,
    toggleOption,
    preview: renderMessage(body, exampleValues(campaign.placeholders, percentError ? '…' : String(percentNumber))),
    error,
    dirty,
    bodyChanged: changes.body !== undefined,
    changes,
    insertPlaceholder,
    update,
    refreshTemplates,
  }
}
