export type VehicleType = 'auto' | 'moto'

export interface CotizarVehiculoRequest {
  brand: string
  model: string
  manufactureYear: number
  postalCode: number
  coverage?: string
  /** Brand new and not registered yet: Triunfo prices the casco differently. */
  zeroKm?: boolean
  /** Cars: has GNC. Not priced yet; the API adds a notice saying so. */
  hasGnc?: boolean
}

export interface CotizacionPaymentOption {
  code: string
  name: string
  premium: number
  installmentValue: number
  installments: number
}

export interface CotizacionCoverage {
  code: string
  // Commercial wording resolved by the API from the admin "Coberturas" settings
  name: string
  tagline: string | null
  benefits: string[]
  /** What it does not include. Absent from an API that predates it. */
  exclusions?: string[]
  /** The franquicia paid on each claim, or null. Absent from an older API. */
  deductible?: string | null
  highlighted: boolean
  paymentOptions: CotizacionPaymentOption[]
}

export interface CotizarVehiculoResponse {
  quoteNumber: string | null
  validUntil: string | null
  vehicleValue: string | null
  coverages: CotizacionCoverage[]
  messages: string[]
  /**
   * Triunfo could not value the vehicle and priced only Responsabilidad Civil:
   * not a final quote, an advisor quotes the rest. Absent from an older API.
   */
  valuationMissing?: boolean
}

export type PersonType = 'FISICA' | 'JURIDICA'
export type DocType = 'DNI' | 'CUIL' | 'CUIT' | 'PASAPORTE'
export type PaymentMethod = 'CREDIT' | 'DEBIT' | 'OTHER'

export interface SolicitarCoberturaRequest {
  coverage: string
  startDate: string
  personType: PersonType
  firstName: string
  lastName?: string
  email: string
  phone: string
  birthDate?: string
  docType: DocType
  docNumber: string
  address: string
  /** Preferred method only: card data is never collected, an agent finalizes the payment. */
  paymentMethod: PaymentMethod
}

export type SolicitudPersonalData = Omit<SolicitarCoberturaRequest, 'coverage' | 'startDate' | 'paymentMethod'>

export type SolicitudPagoData = Pick<SolicitarCoberturaRequest, 'paymentMethod'>

export interface SolicitarCoberturaResponse {
  quoteNumber: string
  coverage: string
  startDate: string
}
