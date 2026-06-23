import { apiRequest } from '@/src/lib/api-client'
import type { ProducerInfo, ProductCatalogItem } from '@/src/types/api/public'

export const publicService = {
  getProducerInfo: (): Promise<ProducerInfo> => apiRequest<ProducerInfo>('/public/producer'),

  getProducts: (): Promise<ProductCatalogItem[]> => apiRequest<ProductCatalogItem[]>('/public/products'),
}
