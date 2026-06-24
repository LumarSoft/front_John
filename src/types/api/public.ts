export interface ProducerInfo {
  /** General attention window, e.g. "Lunes a viernes de 8 a 16 hs". */
  attentionHours: string
}

export type ProductFlow = 'instant' | 'fixed' | 'lead'

/** A lead-flow data point captured by the contact form and the WhatsApp bot. */
export interface CatalogField {
  label: string
  placeholder: string
  span?: 'half' | 'full'
  type?: 'text' | 'select'
  options?: string[]
  help?: string
  /** Natural-language question used by the WhatsApp bot only (the web shows `label`). */
  question?: string
  numeric?: boolean
}

/** Canonical product description served by GET /public/products (no prices). */
export interface ProductCatalogItem {
  id: string
  label: string
  sub: string
  summary: string
  includes: string[]
  excludes: string[]
  flow: ProductFlow
  fields: CatalogField[]
}
