import type { WeeklySchedule } from '@/src/types/api/business-hours'
import type { BotProfile } from '@/src/types/api/config'
import type { CoverageOverride, NumberAssistant, UpdateNumberAssistantRequest } from '@/src/types/api/phone-numbers'

type ProfileField = keyof BotProfile

/** A yes/no the number may leave to the organization (''). */
export type Choice = '' | 'yes' | 'no'

/** How the number offers one of the organization's coverages; '' = as the organization. */
export interface CoverageDraft {
  isActive: Choice
  highlighted: Choice
  sortOrder: string
}

export const EMPTY_COVERAGE_DRAFT: CoverageDraft = { isActive: '', highlighted: '', sortOrder: '' }

/** What the form edits. Empty text means "the organization's". */
export interface NumberAssistantDraft {
  botName: string
  staff: string
  ownHours: boolean
  weekly: WeeklySchedule
  profile: Record<ProfileField, string>
  /** One entry per organization coverage, keyed by code. */
  coverages: Record<string, CoverageDraft>
}

const choiceOf = (value: boolean | null | undefined): Choice => (value == null ? '' : value ? 'yes' : 'no')
const boolOf = (choice: Choice): boolean | null => (choice === '' ? null : choice === 'yes')

function coverageDrafts({ own, organization }: NumberAssistant): Record<string, CoverageDraft> {
  return Object.fromEntries(
    (organization.coverages ?? []).map(coverage => {
      const stored = own.coverageSettings?.[coverage.code]
      return [
        coverage.code,
        {
          isActive: choiceOf(stored?.isActive),
          highlighted: choiceOf(stored?.highlighted),
          sortOrder: stored?.sortOrder == null ? '' : String(stored.sortOrder),
        },
      ]
    }),
  )
}

/** Only the codes and fields the number sets, as the API takes them. */
export function coverageOverridesOf(
  coverages: Record<string, CoverageDraft>,
): Record<string, Partial<CoverageOverride>> {
  const overrides: Record<string, Partial<CoverageOverride>> = {}
  for (const [code, row] of Object.entries(coverages)) {
    const sortOrder = row.sortOrder.trim() === '' ? null : Number(row.sortOrder)
    const value = { isActive: boolOf(row.isActive), highlighted: boolOf(row.highlighted), sortOrder }
    if (value.isActive !== null || value.highlighted !== null || value.sortOrder !== null) overrides[code] = value
  }
  return overrides
}

export const splitNames = (value: string): string[] =>
  value
    .split(',')
    .map(name => name.trim())
    .filter(Boolean)

export function toNumberAssistantDraft({ own, organization }: NumberAssistant): NumberAssistantDraft {
  return {
    botName: own.botName ?? '',
    staff: own.staffNames.join(', '),
    ownHours: own.businessHours !== null,
    // A number that starts its own hours starts from the organization's.
    weekly: own.businessHours ?? organization.businessHours,
    profile: Object.fromEntries(
      (Object.keys(own.botProfile) as ProfileField[]).map(key => [key, own.botProfile[key] ?? '']),
    ) as Record<ProfileField, string>,
    coverages: coverageDrafts({ own, organization } as NumberAssistant),
  }
}

/** A draft that gives everything back to the organization. */
export function emptyNumberAssistantDraft(assistant: NumberAssistant): NumberAssistantDraft {
  const draft = toNumberAssistantDraft(assistant)
  return {
    botName: '',
    staff: '',
    ownHours: false,
    weekly: assistant.organization.businessHours,
    profile: Object.fromEntries(Object.keys(draft.profile).map(key => [key, ''])) as Record<ProfileField, string>,
    coverages: Object.fromEntries(Object.keys(draft.coverages).map(code => [code, EMPTY_COVERAGE_DRAFT])),
  }
}

/** Only what changed between the saved settings and the form, as the API takes it. */
export function numberAssistantChanges(
  initial: NumberAssistantDraft,
  draft: NumberAssistantDraft,
): UpdateNumberAssistantRequest {
  const changes: UpdateNumberAssistantRequest = {}
  if (draft.botName.trim() !== initial.botName.trim()) changes.botName = draft.botName.trim()
  if (splitNames(draft.staff).join(',') !== splitNames(initial.staff).join(',')) {
    changes.staffNames = splitNames(draft.staff)
  }
  const hoursChanged =
    draft.ownHours !== initial.ownHours ||
    (draft.ownHours && JSON.stringify(draft.weekly) !== JSON.stringify(initial.weekly))
  if (hoursChanged) changes.businessHours = draft.ownHours ? draft.weekly : null

  const profile = (Object.keys(draft.profile) as ProfileField[]).filter(
    key => draft.profile[key].trim() !== initial.profile[key].trim(),
  )
  if (profile.length) changes.botProfile = Object.fromEntries(profile.map(key => [key, draft.profile[key].trim()]))

  const overrides = coverageOverridesOf(draft.coverages)
  if (JSON.stringify(overrides) !== JSON.stringify(coverageOverridesOf(initial.coverages))) {
    changes.coverageSettings = Object.keys(overrides).length ? overrides : null
  }
  return changes
}
