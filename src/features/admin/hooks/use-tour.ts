import { useSyncExternalStore } from 'react'
import { NO_TOUR, tourStore, type TourState } from '../lib/tour-store'

/** The "Mostrame en pantalla" guide running now (see tour-store). */
export function useTour(): TourState {
  return useSyncExternalStore(tourStore.subscribe, tourStore.get, () => NO_TOUR)
}
