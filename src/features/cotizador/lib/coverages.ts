import type { CotizacionCoverage, CotizacionPaymentOption } from '@/src/types/api/cotizador'

/**
 * A coverage as shown in the results grid.
 *
 * The wording (name, tagline, benefits) and the order come from the API, which
 * resolves them from the admin "Coberturas" settings. There is deliberately no
 * hardcoded catalog here: which coverages exist, which are shown and how they
 * read is a business decision the broker owns, not a constant in the front.
 */
export interface CoverageCard {
  code: string
  name: string
  tagline: string | null
  benefits: string[]
  highlighted: boolean
  displayPrice: number
  paymentOptions: CotizacionPaymentOption[]
}

// Cheapest of the payment methods the API exposes (Débito Automático and Plan
// de Pago). Contado is quoted by Triunfo but the API filters it out, so it never
// reaches this point.
const displayPrice = (coverage: CotizacionCoverage): number => {
  const premiums = coverage.paymentOptions.map(p => p.premium).filter(p => p > 0)
  return premiums.length > 0 ? Math.min(...premiums) : 0
}

/** One card per coverage, in the order the API already sorted them. */
export function buildCoverageCards(coverages: CotizacionCoverage[]): CoverageCard[] {
  return coverages.map(coverage => ({
    code: coverage.code,
    name: coverage.name,
    tagline: coverage.tagline,
    benefits: coverage.benefits,
    highlighted: coverage.highlighted,
    displayPrice: displayPrice(coverage),
    paymentOptions: coverage.paymentOptions,
  }))
}

const arsFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export const formatARS = (value: number): string => arsFormatter.format(value)
