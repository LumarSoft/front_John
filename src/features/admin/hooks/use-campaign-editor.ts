import { useRef, useState } from 'react'
import type { Campaign, CampaignSettingField, UpdateCampaignRequest } from '@/src/types/api/campaigns'
import { useCampaignSettingsActions } from './use-campaigns'
import { exampleValues, parseCodes, renderMessage } from '../lib/campaigns-format'

type SettingValue = number | string[]

/** A setting as the input shows it: numbers as typed, codes as comma-separated text. */
function settingText(value: SettingValue | undefined): string {
  if (Array.isArray(value)) return value.join(', ')
  return value == null ? '' : String(value)
}

function settingValue(field: CampaignSettingField, text: string): SettingValue {
  return field.type === 'codes' ? parseCodes(text) : Number(text)
}

function sameSetting(a: SettingValue | undefined, b: SettingValue): boolean {
  return Array.isArray(a) && Array.isArray(b) ? a.join(',') === b.join(',') : a === b
}

/** Why a setting cannot be saved as typed, or null. */
function settingError(field: CampaignSettingField, text: string): string | null {
  if (field.type === 'codes') return parseCodes(text).length ? null : `${field.label}: poné al menos un código.`
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

  return {
    textareaRef,
    body,
    setBody,
    percent,
    setPercent,
    settings,
    setSetting,
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
