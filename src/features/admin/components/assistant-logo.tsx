'use client'

import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/src/lib/utils'

/** The main spark: a four-point star centered on the tile. */
const SPARK =
  'M12 5.2C12.55 9.15 14.85 11.45 18.8 12C14.85 12.55 12.55 14.85 12 18.8C11.45 14.85 9.15 12.55 5.2 12C9.15 11.45 11.45 9.15 12 5.2Z'
/** The small one, up and to the right. */
const TWINKLE =
  'M17.6 3.9C17.78 5.05 18.35 5.62 19.5 5.8C18.35 5.98 17.78 6.55 17.6 7.7C17.42 6.55 16.85 5.98 15.7 5.8C16.85 5.62 17.42 5.05 17.6 3.9Z'

interface AssistantLogoProps {
  /** Side in pixels. */
  size?: number
  /** Thinking: the spark turns and the tile glows, while the assistant works. */
  thinking?: boolean
  /** A soft halo around the tile (the empty conversation). */
  halo?: boolean
  className?: string
}

/**
 * The assistant's mark: a spark on a tile in the panel's accent, so it
 * follows the palette and the dark mode the person picked.
 */
export function AssistantLogo({ size = 24, thinking = false, halo = false, className }: AssistantLogoProps) {
  const id = useId()
  const reduced = useReducedMotion()
  const animate = thinking && !reduced
  const gradient = `assistant-tile-${id}`
  const shine = `assistant-shine-${id}`

  return (
    <span
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size }}
    >
      {(halo || animate) && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-[30%] bg-ember/30 blur-md"
          initial={false}
          animate={animate ? { opacity: [0.35, 0.8, 0.35], scale: [1, 1.18, 1] } : { opacity: 0.45, scale: 1.08 }}
          transition={animate ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
        />
      )}
      <svg viewBox="0 0 24 24" width={size} height={size} className="relative" aria-hidden>
        <defs>
          <linearGradient id={gradient} x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--color-ember)" />
            <stop offset="1" stopColor="var(--color-ember-2)" />
          </linearGradient>
          <radialGradient id={shine} cx="7" cy="5" r="14" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="white" stopOpacity="0.32" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="1" y="1" width="22" height="22" rx="7" fill={`url(#${gradient})`} />
        <rect x="1" y="1" width="22" height="22" rx="7" fill={`url(#${shine})`} />
        <motion.path
          d={SPARK}
          fill="var(--color-on-ember)"
          style={{ transformOrigin: '12px 12px', transformBox: 'view-box' }}
          initial={false}
          animate={animate ? { rotate: [0, 90, 180], scale: [1, 0.82, 1] } : { rotate: 0, scale: 1 }}
          transition={animate ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
        />
        <motion.path
          d={TWINKLE}
          fill="var(--color-on-ember)"
          style={{ transformOrigin: '17.6px 5.8px', transformBox: 'view-box' }}
          initial={false}
          animate={animate ? { opacity: [0.3, 1, 0.3], scale: [0.7, 1.15, 0.7] } : { opacity: 0.9, scale: 1 }}
          transition={animate ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 } : { duration: 0.4 }}
        />
      </svg>
    </span>
  )
}
