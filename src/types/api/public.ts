export interface ProducerInfo {
  /** General attention window, e.g. "Lunes a viernes de 8 a 16 hs". */
  attentionHours: string
}

export type ProductFlow = 'instant' | 'fixed' | 'lead'

/** Canonical product description served by GET /public/products (no prices). */
export interface ProductCatalogItem {
  id: string
  label: string
  sub: string
  summary: string
  includes: string[]
  excludes: string[]
  flow: ProductFlow
}
