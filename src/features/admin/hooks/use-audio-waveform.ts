import { useEffect, useState } from 'react'

const BAR_COUNT = 40
// Quietest bar height, so silences still draw a visible line.
const MIN_BAR = 0.12

/**
 * Bar heights (0–1) of a voice note, computed in the browser from the audio
 * itself. Null while loading or when the browser cannot decode the file.
 */
export function useAudioWaveform(src: string): number[] | null {
  const [bars, setBars] = useState<number[] | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    let context: AudioContext | null = null

    fetch(src, { signal: controller.signal })
      .then(res => (res.ok ? res.arrayBuffer() : Promise.reject(new Error(String(res.status)))))
      .then(buffer => {
        context = new AudioContext()
        return context.decodeAudioData(buffer)
      })
      .then(audio => {
        const samples = audio.getChannelData(0)
        const size = Math.max(1, Math.floor(samples.length / BAR_COUNT))
        const peaks = Array.from({ length: BAR_COUNT }, (_, bar) => {
          let peak = 0
          for (let i = bar * size; i < (bar + 1) * size && i < samples.length; i++) {
            peak = Math.max(peak, Math.abs(samples[i]))
          }
          return peak
        })
        const loudest = Math.max(...peaks) || 1
        if (!controller.signal.aborted) setBars(peaks.map(p => Math.max(MIN_BAR, p / loudest)))
      })
      // An undecodable or expired file keeps the flat bars: the player still works.
      .catch(() => undefined)
      .finally(() => {
        context?.close().catch(() => undefined)
      })

    return () => controller.abort()
  }, [src])

  return bars
}
