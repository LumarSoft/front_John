'use client'

import { useState } from 'react'

interface Props {
  src: string
  transcript: string
}

/**
 * A customer's WhatsApp voice note: player plus the transcription the bot
 * answered. Stored audio is deleted after a retention period, so a missing
 * file falls back to the transcription alone.
 */
export function InboxAudio({ src, transcript }: Props) {
  const [unavailable, setUnavailable] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      {unavailable ? (
        <span className="text-[11.5px] italic opacity-70">El audio ya no está disponible.</span>
      ) : (
        <audio controls preload="none" src={src} onError={() => setUnavailable(true)} className="h-9 max-w-full" />
      )}
      <span>{transcript}</span>
    </div>
  )
}
