export type FixedProductType = 'bolso' | 'hogar'

// One coverage row of a plan, with its insured sum. Rows with the same
// label/category align across the product's plans in the comparison table.
export interface CoverageItem {
  label: string
  category?: string
  amount: number
}

export interface ProductPlan {
  id: number
  productType: string
  name: string
  monthlyPrice: number
  description: string | null
  coverageItems: CoverageItem[]
  isActive: boolean
  sortOrder: number
}

export interface CreatePlanRequest {
  productType: FixedProductType
  name: string
  monthlyPrice: number
  description?: string
  coverageItems: CoverageItem[]
  isActive?: boolean
  sortOrder?: number
}

export type UpdatePlanRequest = Partial<Omit<CreatePlanRequest, 'productType'>>
