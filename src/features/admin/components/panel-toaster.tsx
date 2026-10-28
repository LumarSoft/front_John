'use client'

import { Toaster } from '@/src/components/ui/sonner'
import { usePanelTheme } from '../context/panel-theme-context'

// Toasts follow the panel's mode, not the operating system's.
export function PanelToaster() {
  const { isDark } = usePanelTheme()
  return <Toaster position="top-right" richColors closeButton theme={isDark ? 'dark' : 'light'} />
}
