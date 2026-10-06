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
  paymentOptions: CotizacionPaymentOption[]
}

// Card (code 1) first, then cash (code 9): the API names them "Con tarjeta" and
// "En efectivo". Contado is quoted by Triunfo but the API filters it out.
const PAYMENT_ORDER = ['1', '9']
const byPaymentOrder = (a: CotizacionPaymentOption, b: CotizacionPaymentOption): number =>
  (PAYMENT_ORDER.indexOf(a.code) + 1 || 99) - (PAYMENT_ORDER.indexOf(b.code) + 1 || 99)

/** One card per coverage, in the order the API already sorted them. */
export function buildCoverageCards(coverages: CotizacionCoverage[]): CoverageCard[] {
  return coverages.map(coverage => ({
    code: coverage.code,
    name: coverage.name,
    tagline: coverage.tagline,
    benefits: coverage.benefits,
    highlighted: coverage.highlighted,
    paymentOptions: coverage.paymentOptions.filter(p => p.premium > 0).sort(byPaymentOrder),
  }))
}

const arsFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export const formatARS = (value: number): string => arsFormatter.format(value)

/**
 * The value the vehicle is insured for, as Triunfo resolved it. Null when it
 * could not value the vehicle (it returns 0), so a $0 sum is never shown.
 */
export function formatSumInsured(vehicleValue: string | null | undefined): string | null {
  const value = Number.parseFloat(vehicleValue ?? '')
  return value > 0 ? formatARS(value) : null
}
