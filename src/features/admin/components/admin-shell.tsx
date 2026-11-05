'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/src/components/ui/sidebar'
import { Separator } from '@/src/components/ui/separator'
import { TooltipProvider } from '@/src/components/ui/tooltip'
import { useAuth } from '../context/auth-context'
import { useRole } from '../hooks/use-role'
import { CAMPAIGN_PAGES, campaignHref } from '../lib/campaign-pages'
import { AppSidebar } from './app-sidebar'
import { AssistantLauncher } from './assistant-launcher'
import { TriunfoStatusBanner } from './triunfo-status-banner'

const TITLES: Record<string, string> = {
  '/admin': 'Inicio',
  '/admin/balance': 'Balance mensual',
  '/admin/novedades': 'Asuntos pendientes',
  '/admin/tareas': 'Tareas',
  '/admin/solicitudes': 'Solicitudes de cotización',
  '/admin/inbox': 'Whatsapp',
  '/admin/usuarios': 'Usuarios',
  '/admin/numeros': 'Números',
  '/admin/facturacion': 'Facturación',
  '/admin/funciones': 'Funciones por plan',
  '/admin/organizaciones': 'Organizaciones',
  '/admin/configuracion': 'Configuración',
  '/admin/mejoras': 'Mejoras',
  '/admin/status': 'Status',
  ...Object.fromEntries(CAMPAIGN_PAGES.map(page => [campaignHref(page), page.label])),
}

const OWNER_PATHS = [
  '/admin/organizaciones',
  '/admin/facturacion',
  '/admin/funciones',
  '/admin/mejoras',
  '/admin/status',
]

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, hydrated } = useAuth()
  const { isOwner, isLoading: roleLoading } = useRole()

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace('/admin/login')
  }, [hydrated, isAuthenticated, router])

  // The OWNER's interface is "Organizaciones", "Facturación", "Funciones por plan", the "Mejoras" editor and
  // "Status": keep it there.
  useEffect(() => {
    if (!roleLoading && isOwner && !OWNER_PATHS.some(p => pathname.startsWith(p))) {
      router.replace('/admin/organizaciones')
    }
  }, [roleLoading, isOwner, pathname, router])

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-sidebar">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const title = TITLES[pathname] ?? 'Panel'
  // The Whatsapp section fills the whole screen, like WhatsApp Web, and carries
  // the menu button in its own header.
  const fullScreen = pathname === '/admin/inbox'

  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {!fullScreen && (
            <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 rounded-t-xl border-b border-line bg-background/85 px-4 backdrop-blur-md">
              <SidebarTrigger className="-ml-1 text-muted-foreground" />
              <Separator orientation="vertical" className="mr-1 !h-4" />
              <span className="font-display text-[14.5px] tracking-[-0.01em] text-ink">{title}</span>
              {/* The OWNER does not work a cartera: nothing for the assistant to look up. */}
              {!roleLoading && !isOwner && <AssistantLauncher />}
            </header>
          )}
          {/* The OWNER sees each organization's outage in Organizaciones instead. */}
          <TriunfoStatusBanner enabled={!roleLoading && !isOwner} />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
