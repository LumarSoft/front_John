'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  Building2,
  ChevronsUpDown,
  ClipboardList,
  FileWarning,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Phone,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/src/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { useAuth } from '../context/auth-context'
import { useProfile } from '../hooks/use-profile'
import { useNovedadesStats } from '../hooks/use-novedades-stats'
import { useInboxConversations } from '../hooks/use-inbox-conversations'
import { useNewSolicitudesCount } from '../hooks/use-solicitudes'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  // Only visible to SUPERADMIN (org-wide management). OWNER sees these too.
  superAdminOnly?: boolean
  // Only visible to the platform OWNER (Lumar): provision organizations.
  ownerOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', href: '/admin', icon: LayoutDashboard },
  { label: 'Novedades', href: '/admin/novedades', icon: Bell },
  { label: 'Solicitudes', href: '/admin/solicitudes', icon: ClipboardList },
  { label: 'Bandeja', href: '/admin/inbox', icon: MessageSquare },
  { label: 'Siniestros', href: '/admin/siniestros', icon: FileWarning },
  { label: 'Asegurados', href: '/admin/asegurados', icon: ShieldCheck },
  { label: 'Cobranzas', href: '/admin/cobranzas', icon: Wallet },
  { label: 'Usuarios', href: '/admin/usuarios', icon: Users, superAdminOnly: true },
  { label: 'Números', href: '/admin/numeros', icon: Phone, superAdminOnly: true },
  { label: 'Organizaciones', href: '/admin/organizaciones', icon: Building2, ownerOnly: true },
  { label: 'Configuración', href: '/admin/configuracion', icon: UserCog },
]

const activeClasses =
  'data-[active=true]:bg-ember-soft data-[active=true]:text-ember-2 data-[active=true]:font-semibold ' +
  'data-[active=true]:hover:bg-ember-soft data-[active=true]:hover:text-ember-2'

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { data: profile } = useProfile()
  const { data: novedadesStats } = useNovedadesStats()
  // "Pending" conversations = a client asked for a human agent → needs attention.
  const { data: inboxConversations } = useInboxConversations()
  const inboxPending = inboxConversations?.filter(c => c.status === 'pending').length ?? 0
  const { data: solicitudesNuevas = 0 } = useNewSolicitudesCount()

  // Count of items needing the advisor's attention, per sidebar section.
  const alertCount = (href: string): number => {
    if (href === '/admin/novedades') return novedadesStats?.unreadTotal ?? 0
    if (href === '/admin/solicitudes') return solicitudesNuevas
    if (href === '/admin/inbox') return inboxPending
    return 0
  }

  const initials = profile?.email.slice(0, 2).toUpperCase() ?? 'JP'
  const isOwner = profile?.role === 'OWNER'
  const isSuperAdmin = profile?.role === 'SUPERADMIN'
  const roleLabel = isOwner ? 'Owner · Lumar' : isSuperAdmin ? 'SuperAdmin' : 'Administrador'
  // The OWNER's only interface is "Organizaciones": show owner-only items and
  // nothing else. Everyone else sees their items (SuperAdmin-only hidden for admins).
  const navItems = isOwner
    ? NAV_ITEMS.filter(item => item.ownerOnly)
    : NAV_ITEMS.filter(item => !item.ownerOnly && (!item.superAdminOnly || isSuperAdmin))

  const handleLogout = () => {
    logout()
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-1 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber to-ember-2 font-display text-[12px] text-[#1a1206] shadow-[0_6px_16px_-6px_rgba(232,168,32,0.75)]">
            JP
          </div>
          <div className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-display text-[13.5px] text-sidebar-foreground">John Pellegrini</span>
            <span className="truncate text-[11px] text-muted-foreground">Panel admin</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10.5px] tracking-[0.14em] uppercase">Navegación</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {navItems.map(item => {
              const unread = alertCount(item.href)
              return (
                <SidebarMenuItem key={item.href} className="relative">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(pathname, item.href)}
                    tooltip={item.label}
                    className={`h-9 gap-2.5 rounded-lg transition-colors ${activeClasses}`}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                      {unread > 0 && (
                        // Pulsing count badge (expanded): the ping ring draws the eye
                        // from any section so a pending item isn't missed.
                        <span className="relative ml-auto flex items-center justify-center group-data-[collapsible=icon]:hidden">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember-2 opacity-60" />
                          <span className="relative flex h-5 min-w-5 items-center justify-center rounded-full bg-ember-2 px-1.5 text-[10.5px] font-semibold text-on-dark">
                            {unread}
                          </span>
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                  {unread > 0 && (
                    // Pulsing dot for the collapsed (icon-only) sidebar.
                    <span className="pointer-events-none absolute right-1 top-1 hidden size-2 group-data-[collapsible=icon]:flex">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember-2 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-ember-2" />
                    </span>
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="rounded-lg data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-ember-soft text-[12px] font-semibold text-ember-2">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-[13px] font-medium text-sidebar-foreground">
                      {profile?.email ?? 'Cargando…'}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">{roleLabel}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                sideOffset={10}
                className="w-(--radix-dropdown-menu-trigger-width) min-w-60"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="grid leading-tight">
                    <span className="truncate text-[13px] font-medium">{profile?.email}</span>
                    <span className="truncate text-[11px] text-muted-foreground">{roleLabel}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
