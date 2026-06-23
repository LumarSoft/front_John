export type LeadProductType = 'bici' | 'comercio' | 'praxis' | 'personas' | 'bolso' | 'hogar'

export interface CreateLeadRequest {
  productType: LeadProductType
  contactName: string
  phone: string
  email?: string
  payload: Record<string, string>
  selectedPlanId?: number
}

export interface CreateLeadResponse {
  id: number
}
