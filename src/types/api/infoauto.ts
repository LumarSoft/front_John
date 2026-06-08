export interface Brand {
  id: number
  name: string
  logo_url: string | null
  list_price: boolean
  prices: boolean
  prices_from: number | null
  prices_to: number | null
  summary: string | null
}

export interface Group {
  id: number
  name: string
  list_price: boolean
  prices: boolean
  prices_from: number | null
  prices_to: number | null
  summary: string | null
}

export interface NestedBrand {
  id: number
  name: string
}

export interface NestedGroup {
  id: number
  name: string
}

export interface VehicleModel {
  codia: number
  description: string
  brand: NestedBrand
  group: NestedGroup
  list_price: boolean
  prices: boolean
  prices_from: number | null
  prices_to: number | null
  photo_url: string | null
}

export interface Pagination {
  total: number
  page_size: number
  total_pages: number
  first_page: number
  last_page: number
  page: number
  previous_page: number | null
  next_page: number | null
}

export interface InfoAutoListResponse<T> {
  data: T[]
  pagination: Pagination | null
}
