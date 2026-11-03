import type { Closure, WeeklySchedule } from './business-hours'
import type { BilledPlan } from './billing'
import type { BotProfile, UpdateBotProfileRequest } from './config'

export interface PhoneNumberCodeRef {
  id: number
  code: string
  holderName: string | null
}

/**
 * A number's month. The API sends each role its own part: every role gets the
 * messages, the plan and what the month adds up to, the SuperAdmin also the
 * activity, and only the OWNER what Meta and OpenAI cost and the profit.
 */
export interface PhoneNumberUsage {
  period: string
  /** Messages the platform sent this month. */
  messages: number
  /** The plan the number is on, and the one the month is billed on. */
  assignedPlan?: BilledPlan | null
  plan?: BilledPlan
  upgraded?: boolean
  prorated?: boolean
  billedUsd?: number
  /** Its assistant is paused this month for reaching the plan. */
  planPaused?: boolean
  /** SuperAdmin and owner: messages sent and the OpenAI calls and tokens. */
  metaMessages?: number
  metaConversations?: number
  openaiCalls?: number
  inputTokens?: number
  outputTokens?: number
  /** Owner only. */
  metaBillableMessages?: number
  openaiCostUsd?: number
  metaCostUsd?: number
  totalCostUsd?: number
  /** Owner only: billed minus Meta (OpenAI is prepaid). */
  marginUsd?: number
}

/** The Meta business portfolio that owns a number's WhatsApp account, as Meta reported it. */
export interface MetaPortfolio {
  /** The WhatsApp account's name in Meta. */
  wabaName: string | null
  businessId: string | null
  /** The portfolio's name: whose it is. */
  businessName: string | null
  /** Meta's business_verification_status: verified, not_verified, pending… */
  verification: string | null
  checkedAt: string
}

export interface AdminPhoneNumber {
  id: number
  phoneNumberId: string
  number: string
  isActive: boolean
  /** Owner only: the OpenAI budget of the month. */
  monthlyBudgetUsd?: number | null
  /** SuperAdmin and owner: the AI paused for the month on reaching its budget. */
  budgetExceededAt?: string | null
  /** Set when Meta dropped the number off the WhatsApp API; cleared by reconnecting. */
  disconnectedAt: string | null
  /** Meta's reason code, e.g. BUSINESS_DOWNGRADE. */
  disconnectReason: string | null
  /** The reason in plain words, for the office. */
  disconnectReasonLabel: string | null
  /** Null until Meta was read (it is read at onboarding and once a day). */
  portfolio?: MetaPortfolio | null
  responsibleCode: PhoneNumberCodeRef | null
  servedCodes: PhoneNumberCodeRef[]
  usage: PhoneNumberUsage
  /** The number's own assistant name (null = the organization's) and whether it changes any setting. */
  assistant: { botName: string | null; customized: boolean }
  /** Whether the user may change this number's assistant: the SuperAdmin always, an admin on their codes' numbers. */
  canConfigureAssistant: boolean
  /** The number's own bot switch (absent on older APIs). */
  botEnabled?: boolean
}

/** What a number changes about one of the organization's coverages; null = the organization's. */
export interface CoverageOverride {
  isActive: boolean | null
  highlighted: boolean | null
  sortOrder: number | null
}

/** Keyed by Triunfo coverage code. */
export type CoverageOverrides = Record<string, CoverageOverride>

/** A coverage as the organization offers it, which a number's own settings start from. */
export interface OrganizationCoverage {
  id: number
  code: string
  name: string
  isActive: boolean
  highlighted: boolean
  sortOrder: number
  /** Nobody wrote what it includes: quotes hide it whatever the number says. */
  needsReview: boolean
}

export interface BotStatusChangeInfo {
  botEnabled: boolean
  at: string
  by: string | null
}

/** A number's own bot switch after flipping it (PATCH /admin/phone-numbers/:id/bot-status). */
export interface NumberBotStatus {
  id: number
  botEnabled: boolean
  lastBotStatusChange: BotStatusChangeInfo | null
}

/** Assistant settings as the organization has them, or as a number overrides them. */
export interface AssistantSettings {
  botName: string | null
  staffNames: string[]
  businessHours: WeeklySchedule | null
  botProfile: BotProfile
}

/**
 * A number's own assistant next to its organization's (GET /admin/phone-numbers/:id/assistant).
 * Whatever the number leaves empty is the organization's.
 */
export interface NumberAssistant {
  id: number
  number: string
  canEdit: boolean
  own: AssistantSettings & {
    /** The number's own bot switch (absent on older APIs). */
    botEnabled?: boolean
    /** How this number offers the organization's coverages (absent on older APIs). */
    coverageSettings?: CoverageOverrides
    /** The number's holidays and closures, upcoming or under way (absent on older APIs). */
    closures?: Closure[]
  }
  organization: AssistantSettings & {
    name: string
    businessHours: WeeklySchedule
    coverages?: OrganizationCoverage[]
  }
  /** Who last flipped the number's own switch (absent on older APIs). */
  lastBotStatusChange?: BotStatusChangeInfo | null
}

/** Only the fields sent change; clearing one gives the number the organization's value back. */
export interface UpdateNumberAssistantRequest {
  botName?: string
  staffNames?: string[]
  businessHours?: WeeklySchedule | null
  botProfile?: UpdateBotProfileRequest
  /** Only the codes and fields the number changes; null = every coverage as the organization's. */
  coverageSettings?: Record<string, Partial<CoverageOverride>> | null
}

export interface CreatePhoneNumberRequest {
  phoneNumberId: string
  number: string
  responsibleProducerCodeId?: number
  servedCodeIds?: number[]
}

export interface UpdatePhoneNumberRequest {
  number?: string
  responsibleProducerCodeId?: number
  servedCodeIds?: number[]
  isActive?: boolean
}
