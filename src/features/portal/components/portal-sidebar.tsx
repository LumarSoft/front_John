'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, FileText, AlertCircle, FolderOpen, LogOut } from 'lucide-react'
import { clearToken } from '@/src/services/portal-auth.service'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  disabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Mis bienes', href: '/portal/dashboard', icon: LayoutGrid },
  { label: 'Pólizas', href: '/portal/polizas', icon: FileText, disabled: false },
  { label: 'Siniestros', href: '/portal/siniestros', icon: AlertCircle, disabled: true },
  { label: 'Documentos', href: '/portal/documentos', icon: FolderOpen, disabled: true },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/portal/dashboard') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function PortalSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    clearToken()
    router.push('/portal/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[220px] flex-col border-r border-line bg-canvas">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line px-4">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-paper">
          <span className="font-display text-[13px] font-semibold italic leading-none tracking-[-0.04em]">Jp</span>
          <span className="absolute -bottom-[3px] -right-[3px] block h-[7px] w-[7px] rounded-full bg-ember ring-2 ring-canvas" />
        </div>
        <div className="min-w-0 leading-none">
          <div className="truncate font-display text-[13.5px] font-semibold tracking-[-0.02em] text-ink">
            John Pellegrini
          </div>
          <div className="mt-[2px] text-[9.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Portal cliente
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Navegación
        </p>
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(item => {
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href}>
                {item.disabled ? (
                  <span className="flex h-9 cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] text-muted-foreground/40">
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                    <span className="ml-auto text-[9.5px] uppercase tracking-wider text-muted-foreground/40">
                      Próximo
                    </span>
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className={[
                      'flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] font-medium transition-colors',
                      active ? 'bg-ember-soft text-ember-2' : 'text-ink-3 hover:bg-canvas-2 hover:text-ink',
                    ].join(' ')}
                  >
                    <item.icon className={['h-4 w-4 shrink-0', active ? 'text-ember' : ''].join(' ')} />
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-line px-2 py-3">
        <button
          onClick={handleLogout}
          className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-canvas-2 hover:text-ink"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
