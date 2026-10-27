'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { HOME_BRAND, PLATFORM_BRAND, brandOf, type PanelBrand } from '../lib/org-brand'
import { useProfile } from '../hooks/use-profile'

const HostBrandContext = createContext<PanelBrand>(HOME_BRAND)

/** What the host shows before anyone logs in: JPMG's brand, or the platform's on a neutral host. */
export function PanelBrandProvider({ neutral, children }: { neutral: boolean; children: ReactNode }) {
  return <HostBrandContext.Provider value={neutral ? PLATFORM_BRAND : HOME_BRAND}>{children}</HostBrandContext.Provider>
}

export function useHostBrand(): PanelBrand {
  return useContext(HostBrandContext)
}

/** The logged-in user's organization as the panel presents it. */
export function usePanelBrand(): PanelBrand {
  const hostBrand = useHostBrand()
  const { data: profile } = useProfile()
  return brandOf(profile?.organization, hostBrand)
}
