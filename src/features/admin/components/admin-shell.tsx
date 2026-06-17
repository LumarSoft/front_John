'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/src/components/ui/sidebar'
import { Separator } from '@/src/components/ui/separator'
import { TooltipProvider } from '@/src/components/ui/tooltip'
import { useAuth } from '../context/auth-context'
import { AppSidebar } from './app-sidebar'

const TITLES: Record<string, string> = {
  '/admin': 'Inicio',
  '/admin/inbox': 'Bandeja de entrada',
  '/admin/usuarios': 'Usuarios',
  '/admin/configuracion': 'Configuración',
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, hydrated } = useAuth()

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace('/admin/login')
  }, [hydrated, isAuthenticated, router])

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-sidebar">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const title = TITLES[pathname] ?? 'Panel'

  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 rounded-t-xl border-b border-line bg-background/85 px-4 backdrop-blur-md">
            <SidebarTrigger className="-ml-1 text-muted-foreground" />
            <Separator orientation="vertical" className="mr-1 !h-4" />
            <span className="font-display text-[14.5px] tracking-[-0.01em] text-ink">{title}</span>
          </header>
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
