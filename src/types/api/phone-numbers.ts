import type { WeeklySchedule } from './business-hours'
import type { BotProfile, UpdateBotProfileRequest } from './config'

export interface PhoneNumberCodeRef {
  id: number
  code: string
  holderName: string | null
}

/** The token plan a number is billed on for a month (1 token = 1 message sent). */
export interface TokenPlan {
  /** 1,000-token blocks: 1 = Inicial, 2 = Estándar… */
  blocks: number
  name: string
  includedTokens: number
  priceUsd: number
}

/**
 * A number's month. The API sends each role its own part: every role gets the
 * tokens, the SuperAdmin also the activity, and only the OWNER the plan and USD.
 */
export interface PhoneNumberUsage {
  period: string
  /** Messages the platform sent this month: one token each. */
  tokens: number
  /** SuperAdmin and owner: messages sent and the OpenAI calls and tokens. */
  metaMessages?: number
  metaConversations?: number
  openaiCalls?: number
  inputTokens?: number
  outputTokens?: number
  /** Owner only: every block of tokens costs the same, e.g. USD 60 per 1,000. */
  pricing?: { blockTokens: number; blockPriceUsd: number }
  plan?: TokenPlan
  /** True when the Inicial plan was prorated for the number's first month. */
  prorated?: boolean
  /** What the number is invoiced for the month, billed in arrears. */
  billedUsd?: number
  metaBillableMessages?: number
  openaiCostUsd?: number
  metaCostUsd?: number
  totalCostUsd?: number
  marginUsd?: number
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
  }
  organization: AssistantSettings & {
    name: string
    businessHours: WeeklySchedule
    botEnabled?: boolean
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
