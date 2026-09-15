import type { Brand, Group, InfoAutoListResponse, VehicleModel } from '@/src/types/api/infoauto'
import type { VehicleType } from '@/src/types/api/cotizador'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function request<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<InfoAutoListResponse<T>> {
  const url = new URL(`${API_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`InfoAuto request failed: ${res.status}`)
  return res.json() as Promise<InfoAutoListResponse<T>>
}

// SelectSearch filters the options it receives locally, so it needs the full
// catalog. InfoAuto caps pages at 100 rows (motos already has 104 brands).
async function requestAll<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<InfoAutoListResponse<T>> {
  const data: T[] = []
  let page = 1
  while (true) {
    const response = await request<T>(path, { ...params, page, page_size: 100 })
    data.push(...response.data)
    const nextPage = response.pagination?.next_page
    if (!nextPage || nextPage <= page) return { data, pagination: null }
    page = nextPage
  }
}

export const infoAutoService = {
  getBrands: (vehicleType: VehicleType, query?: string) =>
    requestAll<Brand>(`/infoauto/${vehicleType}/brands`, { query_string: query }),

  getGroups: (vehicleType: VehicleType, brandId: number, query?: string) =>
    requestAll<Group>(`/infoauto/${vehicleType}/brands/${brandId}/groups`, { query_string: query }),

  getModels: (vehicleType: VehicleType, brandId: number, groupId: number, query?: string) =>
    requestAll<VehicleModel>(`/infoauto/${vehicleType}/brands/${brandId}/groups/${groupId}/models`, {
      query_string: query,
    }),
}
