/**
 * How a Triunfo auto coverage is shown in the quote results.
 *
 * Rows are not created from the UI: a coverage appears the first time Triunfo
 * quotes its code. `isConfigured` is false until someone edits it, which is what
 * flags the "sin configurar" state in the admin screen.
 */
export interface CoverageSetting {
  id: number
  code: string
  name: string
  tagline: string | null
  benefits: string[]
  isActive: boolean
  isConfigured: boolean
  highlighted: boolean
  sortOrder: number
  /** Vehicle-year window. Null on both ends = every year. */
  yearFrom: number | null
  yearTo: number | null
  firstSeenAt: string
}

export interface UpdateCoverageSettingRequest {
  name?: string
  tagline?: string
  benefits?: string[]
  isActive?: boolean
  highlighted?: boolean
  sortOrder?: number
  yearFrom?: number | null
  yearTo?: number | null
}

export interface ReorderCoverageSettingsRequest {
  items: { id: number; sortOrder: number }[]
}
