import { useEffect, useRef } from 'react'
import type { InboxConversation } from '@/src/types/api/inbox'

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }

function playChime(context: AudioContext) {
  const start = context.currentTime
  const notes = [880, 1174.66]

  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const noteStart = start + index * 0.09

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, noteStart)
    gain.gain.setValueAtTime(0.0001, noteStart)
    gain.gain.exponentialRampToValueAtTime(0.12, noteStart + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.22)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(noteStart)
    oscillator.stop(noteStart + 0.24)
  })
}

/**
 * Plays one short chime when polling discovers new inbound activity.
 * The first response only establishes a baseline, so opening or refreshing the
 * panel never replays notifications for messages that were already there.
 */
export function useInboxMessageSound(conversations: InboxConversation[] | undefined) {
  const contextRef = useRef<AudioContext | null>(null)
  const previousInboundRef = useRef<Map<number, number> | null>(null)

  // Browsers require a user gesture before audio may play. Prime a single audio
  // context on the first click/key press anywhere in the admin panel.
  useEffect(() => {
    const unlockAudio = () => {
      if (!contextRef.current) {
        const AudioContextClass = window.AudioContext ?? (window as AudioWindow).webkitAudioContext
        if (!AudioContextClass) return
        contextRef.current = new AudioContextClass()
      }
      void contextRef.current.resume()
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }

    window.addEventListener('pointerdown', unlockAudio)
    window.addEventListener('keydown', unlockAudio)

    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
      if (contextRef.current) void contextRef.current.close()
      contextRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!conversations) return

    const currentInbound = new Map<number, number>()
    for (const conversation of conversations) {
      const timestamp = conversation.lastInboundMessageAt ? new Date(conversation.lastInboundMessageAt).getTime() : 0
      currentInbound.set(conversation.id, timestamp)
    }

    const previousInbound = previousInboundRef.current
    previousInboundRef.current = currentInbound
    if (!previousInbound) return

    const hasNewInbound = conversations.some(conversation => {
      const current = currentInbound.get(conversation.id) ?? 0
      const previous = previousInbound.get(conversation.id)
      return current > 0 && (previous === undefined || current > previous)
    })

    const context = contextRef.current
    if (!hasNewInbound || !context) return

    if (context.state === 'running') {
      playChime(context)
      return
    }

    void context
      .resume()
      .then(() => playChime(context))
      .catch(() => undefined)
  }, [conversations])
}
