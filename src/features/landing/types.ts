import type { FC } from 'react'

export interface IconProps {
  size?: number
}

export interface Product {
  id: string
  n: string
  label: string
  sub: string
  Icon: FC<IconProps>
  desc: string
  incl: string[]
  excl: string[]
  price: string
}

export interface Company {
  name: string
  blurb: string
  lines: string[]
  logo?: string
}
