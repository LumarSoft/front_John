'use client'

import { Pause, Play } from 'lucide-react'
import { useAudioPlayer } from '../hooks/use-audio-player'

interface Props {
  src: string
  transcript: string
}

function clock(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/**
 * A customer's WhatsApp voice note: player plus the transcription the bot
 * answered. Stored audio is deleted after a retention period, so a missing
 * file falls back to the transcription alone.
 */
export function InboxAudio({ src, transcript }: Props) {
  const { audioProps, playing, current, duration, unavailable, toggle, seek } = useAudioPlayer()
  const progress = duration ? (current / duration) * 100 : 0

  return (
    <div className="flex w-[300px] max-w-full flex-col gap-1.5">
      {unavailable ? (
        <span className="text-[13px] italic text-(--wa-text-2)">El audio ya no está disponible.</span>
      ) : (
        <div className="flex items-center gap-3 pt-1">
          <audio src={src} {...audioProps} />
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pausar audio' : 'Reproducir audio'}
            className="flex size-8 shrink-0 items-center justify-center text-(--wa-icon)"
          >
            {playing ? <Pause className="size-6 fill-current" /> : <Play className="size-6 fill-current" />}
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              onChange={e => seek(Number(e.target.value))}
              aria-label="Posición del audio"
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#c5cbcf] accent-(--wa-green) [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-(--wa-green)"
              style={{
                background: `linear-gradient(to right, var(--wa-green) ${progress}%, #c5cbcf ${progress}%)`,
              }}
            />
            <span className="text-[11px] leading-none text-(--wa-text-2)">
              {clock(playing || current ? current : duration)}
            </span>
          </div>
        </div>
      )}
      {transcript && (
        <span className="border-l-2 border-black/10 pl-2 text-[13.5px] italic leading-[19px] text-(--wa-text-2)">
          {transcript}
        </span>
      )}
    </div>
  )
}
