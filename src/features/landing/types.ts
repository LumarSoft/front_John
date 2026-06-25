import type { FC } from 'react'

export interface IconProps {
  size?: number
}

// Layout-only product entry for the landing/coberturas UI (icon + short labels).
// The canonical coverage descriptions (summary, includes, excludes) live in the
// API catalog (GET /public/products) — the single source shared with the bot —
// so they are intentionally NOT duplicated here.
export interface Product {
  id: string
  n: string
  label: string
  sub: string
  Icon: FC<IconProps>
}

export interface Company {
  name: string
  blurb: string
  lines: string[]
  logo?: string
}
