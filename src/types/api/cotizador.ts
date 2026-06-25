export type VehicleType = 'auto' | 'moto'

export interface CotizarVehiculoRequest {
  brand: string
  model: string
  manufactureYear: number
  postalCode: number
  coverage?: string
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
  paymentOptions: CotizacionPaymentOption[]
}

export interface CotizarVehiculoResponse {
  quoteNumber: string | null
  validUntil: string | null
  vehicleValue: string | null
  coverages: CotizacionCoverage[]
  messages: string[]
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
  paymentMethod: PaymentMethod
  cardCompany?: string
  cardNumber?: string
  cardExpiry?: string
  cardHolder?: string
}

export type SolicitudPersonalData = Omit<
  SolicitarCoberturaRequest,
  'coverage' | 'startDate' | 'paymentMethod' | 'cardCompany' | 'cardNumber' | 'cardExpiry' | 'cardHolder'
>

export type SolicitudPagoData = Pick<
  SolicitarCoberturaRequest,
  'paymentMethod' | 'cardCompany' | 'cardNumber' | 'cardExpiry' | 'cardHolder'
>

export interface SolicitarCoberturaResponse {
  quoteNumber: string
  coverage: string
  startDate: string
}
