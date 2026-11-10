import type { WeeklySchedule } from '@/src/types/api/business-hours'
import { TRANSFER_BY_OFFICE, type BotProfile, type UpdateBotProfileRequest } from '@/src/types/api/config'
import type { CoverageOverride, NumberAssistant, UpdateNumberAssistantRequest } from '@/src/types/api/phone-numbers'

type ProfileField = keyof BotProfile

/** The bank account customers transfer to: inherited, or the number's own, as a whole. */
export const ACCOUNT_FIELDS = [
  'transferAlias',
  'transferCbu',
  'transferHolder',
  'transferBank',
] as const satisfies ReadonlyArray<ProfileField>

const TRANSFER_KEYS: ReadonlyArray<ProfileField> = ['transferMode', ...ACCOUNT_FIELDS]

/**
 * What the bot gives a customer who wants to transfer on this number: the
 * organization's account, one of its own, or none because the office passes
 * the data in the chat (Roldán does not hand out an alias).
 */
export type TransferChoice = 'organization' | 'own' | 'office'

export function transferChoiceOf(profile: BotProfile): TransferChoice {
  if (profile.transferMode === TRANSFER_BY_OFFICE) return 'office'
  return ACCOUNT_FIELDS.some(key => profile[key]) ? 'own' : 'organization'
}

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
  /** The number's branch ("27 de Febrero"); empty = none. Never the organization's. */
  branchName: string
  botName: string
  staff: string
  ownHours: boolean
  weekly: WeeklySchedule
  profile: Record<ProfileField, string>
  /** Which account the bot gives; with 'own', the account fields of `profile`. */
  transfer: TransferChoice
  /** One entry per organization coverage, keyed by code. */
  coverages: Record<string, CoverageDraft>
  /** Whether the number offers each motorcycle coverage, keyed by code; '' = as the organization. */
  motoCoverages: Record<string, Choice>
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

function motoCoverageDrafts({ own, organization }: NumberAssistant): Record<string, Choice> {
  return Object.fromEntries(
    (organization.motoCoverages ?? []).map(coverage => [
      coverage.code,
      choiceOf(own.motoCoverageSettings?.[coverage.code]),
    ]),
  )
}

/** Only the motorcycle coverages the number sets, as the API takes them. */
export function motoCoverageOffersOf(motoCoverages: Record<string, Choice>): Record<string, boolean> {
  const offers: Record<string, boolean> = {}
  for (const [code, choice] of Object.entries(motoCoverages)) {
    if (choice !== '') offers[code] = choice === 'yes'
  }
  return offers
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

export function toNumberAssistantDraft({ own, organization, branchName }: NumberAssistant): NumberAssistantDraft {
  return {
    branchName: branchName ?? '',
    botName: own.botName ?? '',
    staff: own.staffNames.join(', '),
    ownHours: own.businessHours !== null,
    // A number that starts its own hours starts from the organization's.
    weekly: own.businessHours ?? organization.businessHours,
    profile: Object.fromEntries(
      (Object.keys(own.botProfile) as ProfileField[]).map(key => [key, own.botProfile[key] ?? '']),
    ) as Record<ProfileField, string>,
    transfer: transferChoiceOf(own.botProfile),
    coverages: coverageDrafts({ own, organization } as NumberAssistant),
    motoCoverages: motoCoverageDrafts({ own, organization } as NumberAssistant),
  }
}

/**
 * The form starts over when what is saved changes (after saving it), but not
 * when the bot switch flips or a closure changes, which save on their own:
 * that must not reset what is being edited.
 */
export function numberAssistantFormKey(assistant: NumberAssistant): string {
  return JSON.stringify({
    ...assistant.own,
    branchName: assistant.branchName,
    botEnabled: undefined,
    closures: undefined,
  })
}

/** A draft that gives everything back to the organization; the branch is the number's own, so it stays. */
export function emptyNumberAssistantDraft(assistant: NumberAssistant, branchName: string): NumberAssistantDraft {
  const draft = toNumberAssistantDraft(assistant)
  return {
    branchName,
    botName: '',
    staff: '',
    ownHours: false,
    weekly: assistant.organization.businessHours,
    profile: Object.fromEntries(Object.keys(draft.profile).map(key => [key, ''])) as Record<ProfileField, string>,
    transfer: 'organization',
    coverages: Object.fromEntries(Object.keys(draft.coverages).map(code => [code, EMPTY_COVERAGE_DRAFT])),
    motoCoverages: Object.fromEntries(Object.keys(draft.motoCoverages).map(code => [code, '' as Choice])),
  }
}

/**
 * The transfer as the API takes it: going back to the organization's clears the
 * number's own; the office passing the data clears its account on the API; an
 * account of its own goes as a whole.
 */
function transferChanges(initial: NumberAssistantDraft, draft: NumberAssistantDraft): UpdateBotProfileRequest {
  if (draft.transfer === 'office') return initial.transfer === 'office' ? {} : { transferMode: TRANSFER_BY_OFFICE }
  if (draft.transfer === 'organization') {
    if (initial.transfer === 'organization') return {}
    return { transferMode: '', ...Object.fromEntries(ACCOUNT_FIELDS.map(key => [key, ''])) }
  }
  const changed = ACCOUNT_FIELDS.filter(
    key => initial.transfer !== 'own' || draft.profile[key].trim() !== initial.profile[key].trim(),
  )
  const changes: UpdateBotProfileRequest = Object.fromEntries(changed.map(key => [key, draft.profile[key].trim()]))
  if (initial.transfer === 'office') changes.transferMode = ''
  return changes
}

/** An account of its own needs at least the alias or the CBU. */
export const ownAccountMissing = (draft: NumberAssistantDraft): boolean =>
  draft.transfer === 'own' && !draft.profile.transferAlias.trim() && !draft.profile.transferCbu.trim()

/** Only what changed between the saved settings and the form, as the API takes it. */
export function numberAssistantChanges(
  initial: NumberAssistantDraft,
  draft: NumberAssistantDraft,
): UpdateNumberAssistantRequest {
  const changes: UpdateNumberAssistantRequest = {}
  if (draft.branchName.trim() !== initial.branchName.trim()) changes.branchName = draft.branchName.trim()
  if (draft.botName.trim() !== initial.botName.trim()) changes.botName = draft.botName.trim()
  if (splitNames(draft.staff).join(',') !== splitNames(initial.staff).join(',')) {
    changes.staffNames = splitNames(draft.staff)
  }
  const hoursChanged =
    draft.ownHours !== initial.ownHours ||
    (draft.ownHours && JSON.stringify(draft.weekly) !== JSON.stringify(initial.weekly))
  if (hoursChanged) changes.businessHours = draft.ownHours ? draft.weekly : null

  const profile = (Object.keys(draft.profile) as ProfileField[]).filter(
    key => !TRANSFER_KEYS.includes(key) && draft.profile[key].trim() !== initial.profile[key].trim(),
  )
  const botProfile: UpdateBotProfileRequest = {
    ...Object.fromEntries(profile.map(key => [key, draft.profile[key].trim()])),
    ...transferChanges(initial, draft),
  }
  if (Object.keys(botProfile).length) changes.botProfile = botProfile

  const overrides = coverageOverridesOf(draft.coverages)
  if (JSON.stringify(overrides) !== JSON.stringify(coverageOverridesOf(initial.coverages))) {
    changes.coverageSettings = Object.keys(overrides).length ? overrides : null
  }

  const motoOffers = motoCoverageOffersOf(draft.motoCoverages)
  if (JSON.stringify(motoOffers) !== JSON.stringify(motoCoverageOffersOf(initial.motoCoverages))) {
    changes.motoCoverageSettings = Object.keys(motoOffers).length ? motoOffers : null
  }
  return changes
}
