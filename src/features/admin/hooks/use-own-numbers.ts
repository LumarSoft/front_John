import { usePhoneNumbers } from './use-phone-numbers'

/** The active numbers whose assistant the user may change: an admin's own, every one for the SuperAdmin. */
export function useOwnNumbers(enabled = true) {
  const { data, isLoading, isError } = usePhoneNumbers(enabled)
  return {
    numbers: (data ?? []).filter(number => number.isActive && number.canConfigureAssistant),
    isLoading,
    isError,
  }
}
