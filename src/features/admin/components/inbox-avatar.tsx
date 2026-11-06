import { cn } from '@/src/lib/utils'

// One fixed hue per contact, picked by hashing the WhatsApp id, so a chat keeps
// its colour across sessions and devices. Mid lightness reads on both themes.
const HUES = [8, 30, 52, 95, 140, 172, 200, 225, 255, 285, 320, 345]

function hashSeed(seed: string): number {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.codePointAt(0)!) >>> 0
  return hash
}

/** "Juan Pérez" → "JP", "mili" → "M". A phone number or an empty name gives "". */
export function contactInitials(name: string | null | undefined): string {
  const words = (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(word => /\p{L}/u.test(word))
  if (words.length === 0) return ''
  const first = [...words[0]][0]
  const last = words.length > 1 ? [...words[words.length - 1]][0] : ''
  return `${first}${last}`.toUpperCase()
}

/**
 * Profile picture of a WhatsApp contact. Meta's API never exposes the real
 * photo, so a named contact gets its initials on a colour of its own and an
 * unnamed one keeps WhatsApp's silhouette on a grey disc.
 */
export function InboxAvatar({
  name,
  seed,
  className,
}: {
  name?: string | null
  /** What the colour is derived from, normally the WhatsApp id. */
  seed?: string
  className?: string
}) {
  const initials = contactInitials(name)
  const hue = initials ? HUES[hashSeed(seed || initials) % HUES.length] : null

  return (
    <span
      className={cn(
        'flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-(--wa-avatar)',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" className="size-full">
        {hue === null ? (
          <>
            <circle cx="20" cy="15.5" r="7" fill="var(--wa-avatar-fg)" />
            <path d="M6.5 35.5c1.6-7 7-11 13.5-11s11.9 4 13.5 11a19.9 19.9 0 0 1-27 0z" fill="var(--wa-avatar-fg)" />
          </>
        ) : (
          <>
            <circle cx="20" cy="20" r="20" fill={`hsl(${hue} 40% 50%)`} />
            <text
              x="20"
              y="21"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={initials.length > 1 ? 15 : 17}
              fontWeight="500"
              fontFamily="inherit"
              fill="#fff"
            >
              {initials}
            </text>
          </>
        )}
      </svg>
    </span>
  )
}
