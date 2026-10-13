import { cn } from '@/src/lib/utils'

/** Default WhatsApp-style profile picture: a silhouette on a grey disc. */
export function InboxAvatar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--wa-avatar)',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" className="size-full">
        <circle cx="20" cy="15.5" r="7" fill="#fff" />
        <path d="M6.5 35.5c1.6-7 7-11 13.5-11s11.9 4 13.5 11a19.9 19.9 0 0 1-27 0z" fill="#fff" />
      </svg>
    </span>
  )
}
