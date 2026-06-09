'use client'

import { type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { PortalSidebar } from './portal-sidebar'

// Routes that render without the authenticated shell
const NO_SHELL_ROUTES = ['/portal/login', '/portal/change-password']

export function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (NO_SHELL_ROUTES.some(r => pathname.startsWith(r))) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <PortalSidebar />
      {/* Offset main content by sidebar width */}
      <main className="ml-[220px] flex-1 min-w-0">
        <div className="flex-1">{children}</div>
      </main>
    </div>
  )
}
