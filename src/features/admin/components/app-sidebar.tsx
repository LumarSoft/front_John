'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronsUpDown, LayoutDashboard, LogOut, ShieldCheck, UserCog, Users, type LucideIcon } from 'lucide-react'
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

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', href: '/admin', icon: LayoutDashboard },
  { label: 'Asegurados', href: '/admin/asegurados', icon: ShieldCheck },
  { label: 'Usuarios', href: '/admin/usuarios', icon: Users },
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

  const initials = profile?.email.slice(0, 2).toUpperCase() ?? 'JP'

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
            {NAV_ITEMS.map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(pathname, item.href)}
                  tooltip={item.label}
                  className={`h-9 gap-2.5 rounded-lg transition-colors ${activeClasses}`}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
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
                    <span className="truncate text-[11px] text-muted-foreground">Administrador</span>
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
                    <span className="truncate text-[11px] text-muted-foreground">Administrador</span>
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
