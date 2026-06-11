import type { CotizacionCoverage, CotizacionPaymentOption } from '@/src/types/api/cotizador'

export interface CoverageTier {
  prefix: string
  name: string
  tagline: string
  benefits: string[]
  highlighted?: boolean
}

// Triunfo coverage codes group by letter prefix, from basic liability (A) to full coverage (D)
export const COVERAGE_TIERS: CoverageTier[] = [
  {
    prefix: 'A',
    name: 'Responsabilidad Civil',
    tagline: 'La cobertura obligatoria para circular',
    benefits: [
      'Daños a terceros, personas y cosas',
      'Cobertura obligatoria (Ley 24.449)',
      'Asistencia y defensa legal',
      'Validez en países limítrofes',
    ],
  },
  {
    prefix: 'B',
    name: 'Todo Total',
    tagline: 'Responsabilidad civil + pérdidas totales',
    benefits: [
      'Todo lo de Responsabilidad Civil',
      'Robo y hurto total',
      'Incendio total',
      'Destrucción total por accidente',
    ],
  },
  {
    prefix: 'C',
    name: 'Terceros Completo',
    tagline: 'La más elegida',
    highlighted: true,
    benefits: [
      'Todo lo de Todo Total',
      'Robo, hurto e incendio parcial',
      'Rotura de cristales y cerraduras',
      'Granizo, inundación y terremoto',
    ],
  },
  {
    prefix: 'D',
    name: 'Todo Riesgo',
    tagline: 'Protección máxima para tu vehículo',
    benefits: [
      'Todo lo de Terceros Completo',
      'Daños parciales por accidente',
      'Franquicia según plan',
      'Cobertura integral del vehículo',
    ],
  },
]

export interface CoverageCard {
  tier: CoverageTier
  code: string
  displayPrice: number
  paymentOptions: CotizacionPaymentOption[]
}

const displayPrice = (coverage: CotizacionCoverage): number => {
  const contado = coverage.paymentOptions.find(p => p.name.toLowerCase().includes('contado'))
  if (contado && contado.premium > 0) return contado.premium
  const premiums = coverage.paymentOptions.map(p => p.premium).filter(p => p > 0)
  return premiums.length > 0 ? Math.min(...premiums) : 0
}

export function buildCoverageCards(coverages: CotizacionCoverage[]): CoverageCard[] {
  const cards: CoverageCard[] = []

  for (const tier of COVERAGE_TIERS) {
    const matches = coverages.filter(c => c.code.toUpperCase().startsWith(tier.prefix))
    if (matches.length === 0) continue
    const cheapest = matches.reduce((best, c) => (displayPrice(c) < displayPrice(best) ? c : best), matches[0])
    cards.push({
      tier,
      code: cheapest.code,
      displayPrice: displayPrice(cheapest),
      paymentOptions: cheapest.paymentOptions,
    })
  }

  const knownPrefixes = COVERAGE_TIERS.map(t => t.prefix)
  for (const coverage of coverages) {
    if (knownPrefixes.some(p => coverage.code.toUpperCase().startsWith(p))) continue
    cards.push({
      tier: { prefix: coverage.code, name: `Cobertura ${coverage.code}`, tagline: '', benefits: [] },
      code: coverage.code,
      displayPrice: displayPrice(coverage),
      paymentOptions: coverage.paymentOptions,
    })
  }

  return cards.sort((a, b) => a.displayPrice - b.displayPrice)
}

const arsFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export const formatARS = (value: number): string => arsFormatter.format(value)
