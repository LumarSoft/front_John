import { useRef, useState } from 'react'

/** State and controls for a custom <audio> player. */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [unavailable, setUnavailable] = useState(false)

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play().catch(() => setUnavailable(true))
    else audio.pause()
  }

  const seek = (seconds: number) => {
    if (audioRef.current) audioRef.current.currentTime = seconds
  }

  const audioProps = {
    ref: audioRef,
    preload: 'metadata' as const,
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onEnded: () => {
      setPlaying(false)
      setCurrent(0)
    },
    onTimeUpdate: () => setCurrent(audioRef.current?.currentTime ?? 0),
    onLoadedMetadata: () => {
      const value = audioRef.current?.duration ?? 0
      setDuration(Number.isFinite(value) ? value : 0)
    },
    onError: () => setUnavailable(true),
  }

  return { audioProps, playing, current, duration, unavailable, toggle, seek }
}
