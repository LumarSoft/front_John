'use client'

import { Mic, Pause, Play } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { useAudioPlayer } from '../hooks/use-audio-player'
import { useAudioWaveform } from '../hooks/use-audio-waveform'
import { InboxAvatar } from './inbox-avatar'

// Shown until the waveform is computed, or when the browser cannot decode the file.
const FLAT_BARS = Array.from({ length: 40 }, () => 0.2)

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
  const bars = useAudioWaveform(src) ?? FLAT_BARS
  const progress = duration ? current / duration : 0

  return (
    <div className="flex w-[320px] max-w-full flex-col gap-1.5">
      {unavailable ? (
        <span className="text-[13px] italic text-(--wa-text-2)">El audio ya no está disponible.</span>
      ) : (
        <div className="flex items-center gap-2.5 pt-1">
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
            <div className="relative flex h-7 items-center gap-[2px]">
              {bars.map((height, i) => (
                <span
                  key={i}
                  className={cn(
                    'w-[3px] flex-1 rounded-full',
                    (i + 0.5) / bars.length <= progress ? 'bg-(--wa-icon)' : 'bg-[#b4bcc1]',
                  )}
                  style={{ height: `${Math.round(height * 100)}%` }}
                />
              ))}
              <span
                className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--wa-green)"
                style={{ left: `${progress * 100}%` }}
              />
              {/* Invisible slider on top of the bars: click or arrow keys to seek. */}
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={current}
                onChange={e => seek(Number(e.target.value))}
                aria-label="Posición del audio"
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
            </div>
            <span className="text-[11px] leading-none text-(--wa-text-2)">
              {clock(playing || current ? current : duration)}
            </span>
          </div>
          <span className="relative shrink-0">
            <InboxAvatar className="size-[46px]" />
            <Mic className="absolute -bottom-0.5 -left-1 size-4 text-(--wa-green)" strokeWidth={2.5} />
          </span>
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
