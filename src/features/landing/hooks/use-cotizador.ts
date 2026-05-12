import { useState } from 'react'
import { PRODUCTS } from '../data/products'
import type { Product } from '../types'

export function useCotizador() {
  const [activeId, setActiveId] = useState<string>('auto')
  const activeProduct = PRODUCTS.find(p => p.id === activeId) as Product
  return { activeId, activeProduct, setActiveId }
}
