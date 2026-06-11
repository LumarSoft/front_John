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

export const infoAutoService = {
  getBrands: (vehicleType: VehicleType, query?: string) =>
    request<Brand>(`/infoauto/${vehicleType}/brands`, { query_string: query, page_size: 100 }),

  getGroups: (vehicleType: VehicleType, brandId: number, query?: string) =>
    request<Group>(`/infoauto/${vehicleType}/brands/${brandId}/groups`, { query_string: query, page_size: 100 }),

  getModels: (vehicleType: VehicleType, brandId: number, groupId: number, query?: string) =>
    request<VehicleModel>(`/infoauto/${vehicleType}/brands/${brandId}/groups/${groupId}/models`, {
      query_string: query,
      page_size: 100,
    }),
}
