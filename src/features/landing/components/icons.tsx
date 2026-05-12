import type { ReactNode } from 'react'
import type { IconProps } from '../types'

function Ic({ children, size = 28 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

export function IconAuto({ size }: IconProps) {
  return (
    <Ic size={size}>
      <path d="M8 30v6h4v-3h24v3h4v-6" />
      <path d="M10 30l3-10c0.5-1.5 1.8-2.5 3.4-2.5h15.2c1.6 0 2.9 1 3.4 2.5l3 10" />
      <path d="M8 30h32" />
      <circle cx="15" cy="30" r="2.4" />
      <circle cx="33" cy="30" r="2.4" />
    </Ic>
  )
}

export function IconMoto({ size }: IconProps) {
  return (
    <Ic size={size}>
      <circle cx="12" cy="32" r="6" />
      <circle cx="36" cy="32" r="6" />
      <path d="M12 32l8-12h8" />
      <path d="M20 20l4 8h12" />
      <path d="M28 20h6" />
    </Ic>
  )
}

export function IconBici({ size }: IconProps) {
  return (
    <Ic size={size}>
      <circle cx="12" cy="34" r="6" />
      <circle cx="36" cy="34" r="6" />
      <path d="M12 34l8-14h10" />
      <path d="M20 20l8 14" />
      <path d="M24 14h4l2 6" />
    </Ic>
  )
}

export function IconBolso({ size }: IconProps) {
  return (
    <Ic size={size}>
      <path d="M10 18h28l-2 22H12L10 18z" />
      <path d="M17 18v-3a7 7 0 0 1 14 0v3" />
    </Ic>
  )
}

export function IconComercio({ size }: IconProps) {
  return (
    <Ic size={size}>
      <path d="M8 18l3-6h26l3 6" />
      <path d="M8 18v4a4 4 0 0 0 8 0 4 4 0 0 0 8 0 4 4 0 0 0 8 0 4 4 0 0 0 8 0v-4" />
      <path d="M10 22v18h28V22" />
      <path d="M20 40v-10h8v10" />
    </Ic>
  )
}

export function IconHogar({ size }: IconProps) {
  return (
    <Ic size={size}>
      <path d="M8 22L24 9l16 13" />
      <path d="M12 20v20h24V20" />
      <path d="M20 40V28h8v12" />
    </Ic>
  )
}

export function IconPersonas({ size }: IconProps) {
  return (
    <Ic size={size}>
      <circle cx="18" cy="17" r="5" />
      <circle cx="32" cy="19" r="4" />
      <path d="M8 38c0-5.5 4.5-10 10-10s10 4.5 10 10" />
      <path d="M28 38c0-4.5 3-8 7-8s5 2 5 5" />
    </Ic>
  )
}

export function IconPraxis({ size }: IconProps) {
  return (
    <Ic size={size}>
      <path d="M24 6l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
      <path d="M14 24v10c0 4 4.5 7 10 8 5.5-1 10-4 10-8V24" />
      <path d="M14 24h20" />
    </Ic>
  )
}

export function IconArrow({ size = 22 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}
