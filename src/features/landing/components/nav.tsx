'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLockBodyScroll } from '../hooks/use-lock-body-scroll'

interface NavItem {
  href: string
  label: string
  isLink?: boolean
  children?: { href: string; label: string; sub?: string }[]
}

const NAV: NavItem[] = [
  {
    href: '/#coberturas',
    label: 'Coberturas',
    children: [
      { href: '/coberturas?coverage=auto', label: 'Auto', sub: 'Todo riesgo y terceros' },
      { href: '/coberturas?coverage=moto', label: 'Moto', sub: 'Cualquier cilindrada' },
      { href: '/coberturas?coverage=hogar', label: 'Hogar', sub: 'Edificio y contenido' },
      { href: '/coberturas?coverage=comercio', label: 'Comercio', sub: 'Locales e industria' },
      { href: '/coberturas?coverage=personas', label: 'Personas', sub: 'Vida y accidentes' },
      { href: '/coberturas', label: 'Ver todas las coberturas →' },
    ],
  },
  { href: '/#carta', label: 'La diferencia' },
  { href: '/#companias', label: 'Compañías' },
  { href: '/#resenas', label: 'Reseñas' },
  { href: '/#contacto', label: 'Contacto' },
  { href: '/#estudio', label: 'Sucursales' },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  useLockBodyScroll(open)
  const close = () => setOpen(false)

  useEffect(() => {
    document.body.classList.toggle('mobile-menu-open', open)
  }, [open])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = ['coberturas', 'carta', 'companias', 'resenas', 'contacto', 'estudio']
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled ? 'pt-[max(12px,env(safe-area-inset-top))]' : 'pt-[max(20px,calc(env(safe-area-inset-top)+8px))]'
        }`}
      >
        <div className="container">
          <nav
            className={`relative mx-auto flex items-center justify-between gap-4 rounded-full pl-5 pr-2 transition-all duration-300 ${
              scrolled
                ? 'h-[58px] bg-paper/95 shadow-[0_8px_30px_-8px_rgba(15,13,10,0.18),0_0_0_1px_rgba(15,13,10,0.05)] backdrop-blur-xl'
                : 'h-[64px] bg-paper/90 shadow-[0_12px_40px_-12px_rgba(15,13,10,0.22),0_0_0_1px_rgba(15,13,10,0.06)] backdrop-blur-xl'
            }`}
          >
            <Link href="/" className="flex items-center gap-[10px] shrink-0 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-paper transition-transform group-hover:rotate-[-4deg]">
                <span className="font-display text-[15px] font-semibold italic leading-none tracking-[-0.04em]">
                  Jp
                </span>
                <span className="absolute -bottom-[3px] -right-[3px] block h-[8px] w-[8px] rounded-full bg-ember ring-2 ring-paper" />
              </div>
              <div className="leading-none">
                <div className="font-display text-[15px] md:text-[18px] font-semibold tracking-[-0.025em] text-ink">
                  John Pellegrini
                </div>
                <div className="mt-[3px] text-[8.5px] md:text-[9px] font-medium uppercase tracking-[0.2em] md:tracking-[0.22em] text-faint">
                  <span className="hidden min-[380px]:inline">Seguros · </span>desde 1974
                </div>
              </div>
            </Link>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 max-[1024px]:hidden">
              {NAV.map(item => {
                const id = item.href.split('#')[1] ?? ''
                const isActive = activeSection === id
                if (item.children) {
                  return (
                    <div
                      key={item.href}
                      className="relative"
                      onMouseEnter={() => setOpenMenu(item.label)}
                      onMouseLeave={() => setOpenMenu(null)}
                    >
                      <a
                        href={item.href}
                        className={`inline-flex items-center gap-[5px] rounded-full px-[14px] py-[8px] text-[13px] font-medium tracking-[-0.005em] transition-colors ${
                          isActive ? 'text-ink' : 'text-ink-3 hover:text-ink'
                        }`}
                      >
                        {item.label}
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 10 10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          className={`transition-transform duration-200 ${openMenu === item.label ? 'rotate-180' : ''}`}
                        >
                          <path d="M2 4l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                      <div
                        className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-[opacity,transform] duration-200 ${
                          openMenu === item.label
                            ? 'opacity-100 translate-y-0 pointer-events-auto'
                            : 'opacity-0 -translate-y-2 pointer-events-none'
                        }`}
                      >
                        <div className="w-[300px] rounded-2xl bg-paper p-2 shadow-[0_24px_60px_-20px_rgba(15,13,10,0.32),0_0_0_1px_rgba(15,13,10,0.06)]">
                          {item.children.map(child => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block rounded-xl px-3 py-[10px] transition-colors hover:bg-canvas-2"
                            >
                              <div className="text-[13.5px] font-semibold text-ink tracking-[-0.01em]">
                                {child.label}
                              </div>
                              {child.sub && <div className="text-[11.5px] text-faint mt-[2px]">{child.sub}</div>}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                }
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-[14px] py-[8px] text-[13px] font-medium tracking-[-0.005em] transition-colors ${
                      isActive ? 'text-ink' : 'text-ink-3 hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </a>
                )
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0 max-[1024px]:hidden">
              <a
                href="tel:+541148150099"
                className="rounded-full px-4 py-[10px] text-[13px] font-medium text-ink-3 transition-colors hover:text-ink"
              >
                Llamanos
              </a>
              <a
                href="#contacto"
                className="btn-shimmer inline-flex items-center gap-2 rounded-full bg-ember px-5 py-[11px] text-[13px] font-semibold tracking-[-0.005em] text-paper transition-[background-color,box-shadow] hover:bg-ember-2 hover:shadow-[0_8px_24px_-6px_rgba(232,168,32,0.45)]"
              >
                Cotizar
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            <button
              className="hidden max-[1024px]:flex h-10 w-10 ml-auto items-center justify-center rounded-full bg-ink text-paper z-[300] shrink-0"
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            >
              <div className="flex flex-col gap-[5px]">
                <span
                  className={`block w-[18px] h-[1.5px] bg-paper origin-center transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'translate-y-[6.5px] rotate-45' : ''}`}
                />
                <span
                  className={`block w-[18px] h-[1.5px] bg-paper transition-all duration-[250ms] ${open ? 'opacity-0 scale-x-0' : ''}`}
                />
                <span
                  className={`block w-[18px] h-[1.5px] bg-paper origin-center transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? '-translate-y-[6.5px] -rotate-45' : ''}`}
                />
              </div>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        className={`hidden max-[1024px]:flex fixed inset-0 z-[200] bg-paper flex-col px-6 pb-[calc(28px+env(safe-area-inset-bottom,0px))] overflow-y-auto transition-opacity duration-[280ms] ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between h-[76px] shrink-0">
          <div className="flex items-center gap-[10px]">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-paper">
              <span className="font-display text-[15px] font-semibold italic leading-none tracking-[-0.04em]">Jp</span>
              <span className="absolute -bottom-[3px] -right-[3px] block h-[8px] w-[8px] rounded-full bg-ember ring-2 ring-paper" />
            </div>
            <div className="leading-none">
              <div className="font-display text-[18px] font-semibold tracking-[-0.025em] text-ink">Pellegrini</div>
              <div className="mt-[3px] text-[9px] font-medium uppercase tracking-[0.22em] text-faint">
                Seguros · desde 1974
              </div>
            </div>
          </div>
          <button
            className="h-10 w-10 flex items-center justify-center rounded-full bg-ink text-paper"
            onClick={close}
            aria-label="Cerrar menú"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav
          className={`flex flex-col flex-1 pt-6 transition-[transform] duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-[60ms] ${open ? 'translate-y-0' : 'translate-y-3'}`}
        >
          <Link
            href="/coberturas"
            onClick={close}
            className="flex items-center justify-between py-5 border-b border-line text-[30px] font-display font-medium tracking-[-0.025em] text-ink"
          >
            <span>Coberturas</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9h12M10 4l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          {NAV.slice(1).map(item => (
            <a
              key={item.href}
              href={item.href}
              onClick={close}
              className="flex items-center justify-between py-5 border-b border-line text-[30px] font-display font-medium tracking-[-0.025em] text-ink"
            >
              <span>{item.label}</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9h12M10 4l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </nav>

        <div className="grid grid-cols-2 gap-3 mt-8">
          <a
            href="tel:+541148150099"
            onClick={close}
            className="flex items-center justify-center gap-2 h-[52px] border border-line-2 rounded-2xl text-[13.5px] font-semibold text-ink-2 tracking-[-0.01em]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.4 1.17 2 2 0 012.38 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 13.92z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Llamar
          </a>
          <a
            href="https://wa.me/5491162341198"
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="flex items-center justify-center gap-2 h-[52px] border border-line-2 rounded-2xl text-ink-2 text-[13.5px] font-semibold tracking-[-0.01em]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#25d366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        </div>

        <a
          href="#contacto"
          onClick={close}
          className={`flex items-center justify-center h-[58px] bg-ember rounded-full text-paper font-semibold text-[14px] tracking-[-0.005em] mt-3 transition-[background-color,transform] duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-[140ms] ${open ? 'translate-y-0' : 'translate-y-3'}`}
        >
          Cotizar ahora →
        </a>
      </div>
    </>
  )
}
