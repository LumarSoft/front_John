// How each product is quoted, mirroring the API:
//  - instant: real-time quote via InfoAuto + Triunfo (auto, moto)
//  - lead:    advisor-contact form (bici/monopatín, comercio, personas, praxis)
//  - fixed:   admin-configured fixed-price plans (bolso, hogar)
export type QuoteFlow = 'instant' | 'lead' | 'fixed'

export const QUOTE_FLOW: Record<string, QuoteFlow> = {
  auto: 'instant',
  moto: 'instant',
  bici: 'lead',
  comercio: 'lead',
  personas: 'lead',
  praxis: 'lead',
  bolso: 'fixed',
  hogar: 'fixed',
}

export function quoteFlowFor(productId: string): QuoteFlow {
  return QUOTE_FLOW[productId] ?? 'lead'
}
