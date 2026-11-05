import type { TourId } from './panel-tours'

/**
 * The "Mostrame en pantalla" guide running, if any. Only ever started by a tap
 * on the assistant's button, never on its own. It lives outside React so the
 * guide carries on while the assistant (in the top bar) unmounts, as it does
 * in Whatsapp.
 */
export interface TourState {
  tourId: TourId | null
  step: number
  /** Bumped on every start, so a guide run twice in a row never reuses the last run's state. */
  run: number
}

export const NO_TOUR: TourState = { tourId: null, step: 0, run: 0 }

let state: TourState = NO_TOUR
const listeners = new Set<() => void>()

function set(next: Partial<TourState>) {
  state = { ...state, ...next }
  for (const listener of listeners) listener()
}

export const tourStore = {
  get: (): TourState => state,
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  start: (tourId: TourId) => set({ tourId, step: 0, run: state.run + 1 }),
  next: () => set({ step: state.step + 1 }),
  /** Back one step, when what the current step points at went away (a menu closed). */
  back: () => set({ step: Math.max(0, state.step - 1) }),
  stop: () => set({ tourId: null, step: 0 }),
}
