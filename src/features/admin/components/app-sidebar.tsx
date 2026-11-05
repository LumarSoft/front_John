'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  BanknoteX,
  Bell,
  ListTodo,
  Building2,
  ChevronRight,
  ChevronsUpDown,
  ClipboardList,
  FileWarning,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Megaphone,
  MessageSquare,
  Palette,
  Phone,
  Settings,
  ShieldCheck,
  Sparkles,
  ToggleRight,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
  CreditCard,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
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
import { usePanelBrand } from '../hooks/use-panel-brand'
import { OrgMark } from './org-mark'
import { useProfile } from '../hooks/use-profile'
import { useNovedadesStats } from '../hooks/use-novedades-stats'
import { useInboxConversations } from '../hooks/use-inbox-conversations'
import { useInboxMessageSound } from '../hooks/use-inbox-message-sound'
import { useNewSolicitudesCount } from '../hooks/use-solicitudes'
import { useImprovementsUnseenCount } from '../hooks/use-improvements'
import { useNewProposalsCount } from '../hooks/use-proposals'
import { useTaskStats } from '../hooks/use-tasks'
import { useIntegrationStatus } from '../hooks/use-integration-status'
import { failingNames } from '../lib/integration-status'
import { AppearanceDialog } from './appearance-dialog'
import { SidebarUsage } from './sidebar-usage'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  // Only visible to SUPERADMIN (org-wide management). OWNER sees these too.
  superAdminOnly?: boolean
  // Only visible to the platform OWNER (Lumar): provision organizations.
  ownerOnly?: boolean
  // Visible to everyone, the OWNER included (it edits what the others read).
  everyone?: boolean
}

/** A block of the menu that opens and closes; closed, it still shows its pending count. */
interface NavGroup {
  key: string
  label: string
  icon: LucideIcon
  items: NavItem[]
}

type NavEntry = NavItem | NavGroup

const isGroup = (entry: NavEntry): entry is NavGroup => 'items' in entry

// What the office uses every day stays at the top; the rest goes in groups.
const NAV: NavEntry[] = [
  { label: 'Inicio', href: '/admin', icon: LayoutDashboard },
  { label: 'Asuntos pendientes', href: '/admin/novedades', icon: Bell },
  { label: 'Whatsapp', href: '/admin/inbox', icon: MessageSquare },
  { label: 'Tareas', href: '/admin/tareas', icon: ListTodo },
  {
    key: 'cartera',
    label: 'Cartera',
    icon: ShieldCheck,
    items: [
      { label: 'Asegurados', href: '/admin/asegurados', icon: ShieldCheck },
      { label: 'Solicitudes', href: '/admin/solicitudes', icon: ClipboardList },
      { label: 'Siniestros', href: '/admin/siniestros', icon: FileWarning },
      { label: 'Cobranzas', href: '/admin/cobranzas', icon: Wallet },
      { label: 'Rechazos', href: '/admin/rechazos', icon: BanknoteX },
      // The organization's month-end numbers: SuperAdmin only (ADMINs never see it; the OWNER has no cartera).
      { label: 'Balance mensual', href: '/admin/balance', icon: TrendingUp, superAdminOnly: true },
    ],
  },
  // Its own group so each of Nico's campaigns can get its own page later.
  {
    key: 'ventas',
    label: 'Ventas',
    icon: Megaphone,
    items: [{ label: 'Campañas', href: '/admin/campanas', icon: Megaphone }],
  },
  {
    key: 'administracion',
    label: 'Administración',
    icon: Settings,
    items: [
      // Admins see each number's messages; managing numbers stays with the SuperAdmin.
      { label: 'Números', href: '/admin/numeros', icon: Phone },
      { label: 'Usuarios', href: '/admin/usuarios', icon: Users, superAdminOnly: true },
      // Each number's plan and month; the SuperAdmin assigns plans, the OWNER edits the catalog and sees the platform's month.
      { label: 'Facturación', href: '/admin/facturacion', icon: CreditCard, everyone: true },
      // What each plan, and each role, can use: the OWNER's switches.
      { label: 'Funciones por plan', href: '/admin/funciones', icon: ToggleRight, ownerOnly: true },
      { label: 'Organizaciones', href: '/admin/organizaciones', icon: Building2, ownerOnly: true },
      { label: 'Configuración', href: '/admin/configuracion', icon: UserCog },
    ],
  },
  {
    key: 'ayuda',
    label: 'Ayuda',
    icon: LifeBuoy,
    items: [
      { label: 'Mejoras', href: '/admin/mejoras', icon: Sparkles, everyone: true },
      // How Triunfo, InfoAuto and the WhatsApp numbers are answering, for everyone.
      { label: 'Status', href: '/admin/status', icon: Activity, everyone: true },
    ],
  },
]

/** Which groups the user left open, per browser. */
const GROUPS_STORAGE_KEY = 'panel.sidebar.groups'
const GROUPS_EVENT = 'panel-sidebar-groups'

function subscribeGroups(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(GROUPS_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(GROUPS_EVENT, onChange)
  }
}

function groupsSnapshot(): string {
  try {
    return localStorage.getItem(GROUPS_STORAGE_KEY) ?? '{}'
  } catch {
    return '{}'
  }
}

function parseGroups(raw: string): Record<string, boolean> {
  try {
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

function saveOpenGroups(groups: Record<string, boolean>) {
  try {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups))
  } catch {
    // Private window or blocked storage: the groups just reopen as they were.
  }
  window.dispatchEvent(new Event(GROUPS_EVENT))
}

const activeClasses =
  'data-[active=true]:bg-ember-soft data-[active=true]:text-ember-2 data-[active=true]:font-semibold ' +
  'data-[active=true]:hover:bg-ember-soft data-[active=true]:hover:text-ember-2'

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Pulsing count badge (expanded): the ping ring draws the eye from any section so a pending item isn't missed. */
function CountBadge({ count, small = false }: { count: number; small?: boolean }) {
  return (
    <span className="relative ml-auto flex items-center justify-center group-data-[collapsible=icon]:hidden">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember-2 opacity-60" />
      <span
        className={`relative flex items-center justify-center rounded-full bg-ember-2 font-semibold text-on-ember ${
          small ? 'h-4 min-w-4 px-1 text-[9.5px]' : 'h-5 min-w-5 px-1.5 text-[10.5px]'
        }`}
      >
        {count}
      </span>
    </span>
  )
}

/** A top-level entry (or every entry, when the sidebar is down to icons). */
function NavLink({ item, active, count }: { item: NavItem; active: boolean; count: number }) {
  return (
    <SidebarMenuItem className="relative">
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.label}
        className={`h-9 gap-2.5 rounded-lg transition-colors ${activeClasses}`}
      >
        <Link href={item.href}>
          <item.icon />
          <span>{item.label}</span>
          {count > 0 && <CountBadge count={count} />}
        </Link>
      </SidebarMenuButton>
      {count > 0 && (
        // Pulsing dot for the collapsed (icon-only) sidebar.
        <span className="pointer-events-none absolute right-1 top-1 hidden size-2 group-data-[collapsible=icon]:flex">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember-2 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-ember-2" />
        </span>
      )}
    </SidebarMenuItem>
  )
}

function NavGroupBlock({
  group,
  open,
  onToggle,
  pathname,
  alertCount,
}: {
  group: NavGroup
  open: boolean
  onToggle: () => void
  pathname: string
  alertCount: (href: string) => number
}) {
  const total = group.items.reduce((sum, item) => sum + alertCount(item.href), 0)
  const containsActive = group.items.some(item => isActive(pathname, item.href))
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        tooltip={group.label}
        className={`h-9 gap-2.5 rounded-lg transition-colors ${containsActive && !open ? 'text-ember-2' : ''}`}
      >
        <group.icon />
        <span>{group.label}</span>
        {!open && total > 0 ? (
          <CountBadge count={total} />
        ) : (
          <ChevronRight
            className={`ml-auto size-4 text-muted-foreground transition-transform duration-200 ease-out motion-reduce:transition-none ${open ? 'rotate-90' : ''}`}
          />
        )}
      </SidebarMenuButton>
      {/* Always rendered so it can unfold and fold: the grid row goes from 0fr to 1fr. Closed, it is
          hidden from screen readers and out of the tab order. */}
      <div
        aria-hidden={!open}
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <SidebarMenuSub>
            {group.items.map(item => {
              const count = alertCount(item.href)
              return (
                <SidebarMenuSubItem key={item.href}>
                  <SidebarMenuSubButton asChild isActive={isActive(pathname, item.href)} className={activeClasses}>
                    <Link href={item.href}>
                      <span>{item.label}</span>
                      {count > 0 && <CountBadge count={count} small />}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </div>
      </div>
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { data: profile } = useProfile()
  const { data: novedadesStats } = useNovedadesStats()
  const { data: taskStats } = useTaskStats()
  // "Pending" conversations = a client asked for a human agent → needs attention.
  const { data: inboxConversations } = useInboxConversations()
  useInboxMessageSound(inboxConversations)
  const inboxPending = inboxConversations?.filter(c => c.status === 'pending').length ?? 0
  const { data: solicitudesNuevas = 0 } = useNewSolicitudesCount()
  const isOwner = profile?.role === 'OWNER'
  // "Mejoras" badge: unseen improvements for the office, new proposals for the OWNER.
  const { data: improvementsUnseen } = useImprovementsUnseenCount(!!profile && !isOwner)
  const { data: newProposals } = useNewProposalsCount(isOwner)
  const { data: integrationStatus } = useIntegrationStatus({ refreshMs: 5 * 60 * 1000 })
  const [appearanceOpen, setAppearanceOpen] = useState(false)

  // Count of items needing the advisor's attention, per sidebar section.
  const alertCount = (href: string): number => {
    if (href === '/admin/novedades') return novedadesStats?.actionableTotal ?? 0
    if (href === '/admin/tareas') return taskStats?.open ?? 0
    if (href === '/admin/solicitudes') return solicitudesNuevas
    if (href === '/admin/inbox') return inboxPending
    if (href === '/admin/mejoras') return (isOwner ? newProposals?.count : improvementsUnseen?.count) ?? 0
    if (href === '/admin/status') return integrationStatus ? failingNames(integrationStatus).length : 0
    return 0
  }

  const brand = usePanelBrand()
  const initials = profile?.email.slice(0, 2).toUpperCase() ?? brand.initials
  const isSuperAdmin = profile?.role === 'SUPERADMIN'
  const roleLabel = isOwner ? 'Owner · Lumar' : isSuperAdmin ? 'SuperAdmin' : 'Administrador'
  // The OWNER's interface is "Organizaciones" plus the "Mejoras" editor. Everyone
  // else sees their items (SuperAdmin-only hidden for admins). A group left empty is not shown.
  const visible = (item: NavItem) =>
    isOwner ? !!(item.ownerOnly || item.everyone) : !item.ownerOnly && (!item.superAdminOnly || isSuperAdmin)
  const nav: NavEntry[] = NAV.flatMap<NavEntry>(entry => {
    if (!isGroup(entry)) return visible(entry) ? [entry] : []
    const items = entry.items.filter(visible)
    return items.length ? [{ ...entry, items }] : []
  })
  const leaves = nav.flatMap(entry => (isGroup(entry) ? entry.items : [entry]))

  // Down to icons, groups can't open: every entry shows as its own icon, as before.
  const { state, isMobile } = useSidebar()
  const iconsOnly = state === 'collapsed' && !isMobile

  // Open groups as the user left them (per browser). The group of the page you are on opens by itself;
  // closing it lasts until you move to another page.
  const storedGroups = useSyncExternalStore(subscribeGroups, groupsSnapshot, () => '{}')
  const openGroups = useMemo(() => parseGroups(storedGroups), [storedGroups])
  const [closedOn, setClosedOn] = useState<string | null>(null)
  const activeGroup = nav.find(entry => isGroup(entry) && entry.items.some(item => isActive(pathname, item.href)))
  const activeGroupKey = activeGroup && isGroup(activeGroup) ? activeGroup.key : null
  const isGroupOpen = (key: string) => (key === activeGroupKey ? closedOn !== pathname : !!openGroups[key])
  const toggleGroup = (key: string) => {
    if (key === activeGroupKey) {
      setClosedOn(closedOn === pathname ? null : pathname)
      return
    }
    saveOpenGroups({ ...openGroups, [key]: !openGroups[key] })
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-1 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <OrgMark brand={brand} size={32} className="rounded-lg shadow-sm" />
          <div className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-display text-[13.5px] text-sidebar-foreground">{brand.name}</span>
            <span className="truncate text-[11px] text-muted-foreground">
              {brand.mark === 'platform' ? 'Panel de la plataforma' : 'Panel de administración'}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10.5px] tracking-[0.14em] uppercase">Navegación</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {iconsOnly
              ? leaves.map(item => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={isActive(pathname, item.href)}
                    count={alertCount(item.href)}
                  />
                ))
              : nav.map(entry =>
                  isGroup(entry) ? (
                    <NavGroupBlock
                      key={entry.key}
                      group={entry}
                      open={isGroupOpen(entry.key)}
                      onToggle={() => toggleGroup(entry.key)}
                      pathname={pathname}
                      alertCount={alertCount}
                    />
                  ) : (
                    <NavLink
                      key={entry.href}
                      item={entry}
                      active={isActive(pathname, entry.href)}
                      count={alertCount(entry.href)}
                    />
                  ),
                )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* The owner has no numbers of its own: its billing is the platform's, in Facturación. */}
        <SidebarUsage enabled={!!profile && !isOwner} />
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
                <DropdownMenuItem onSelect={() => setAppearanceOpen(true)}>
                  <Palette />
                  Apariencia
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <AppearanceDialog open={appearanceOpen} onOpenChange={setAppearanceOpen} />
      </SidebarFooter>
    </Sidebar>
  )
}
