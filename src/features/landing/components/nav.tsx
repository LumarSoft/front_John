'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLockBodyScroll } from '../hooks/use-lock-body-scroll'
import { ThemeToggle } from '@/src/components/ui/theme-toggle'

const ANCHOR_LINKS = [
  { href: '#carta', label: 'El productor' },
  { href: '#companias', label: 'Compañías' },
  { href: '#contacto', label: 'Contacto' },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  useLockBodyScroll(open)
  const close = () => setOpen(false)

  useEffect(() => {
    document.body.classList.toggle('mobile-menu-open', open)
  }, [open])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = ['carta', 'companias', 'contacto']
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

  const anchorClass = (href: string) => {
    const id = href.replace('#', '')
    const active = activeSection === id
    return `py-[6px] border-b transition-colors duration-200 ${
      active ? 'text-amber border-amber' : 'border-transparent text-cream-2 hover:text-amber hover:border-amber'
    }`
  }

  return (
    <>
      <header
        className={`sticky top-0 z-[100] border-b border-line-2 transition-all duration-300 ${
          scrolled ? 'bg-ink/90 backdrop-blur-xl' : 'bg-ink'
        }`}
      >
        <nav>
          <div
            className={`container flex items-center justify-between gap-6 transition-all duration-300 ${
              scrolled ? 'h-[60px]' : 'h-[72px]'
            }`}
          >
            <Link href="/" className="flex items-center gap-[14px] shrink-0">
              <div className="w-[42px] h-[42px] border-[1.5px] border-amber rounded-xl flex items-center justify-center font-bold text-[15px] text-amber tracking-[0.08em] shrink-0">
                JP
              </div>
              <div>
                <div className="font-bold text-[17px] tracking-[-0.02em] text-cream leading-none">
                  John Pellegrini <span className="text-amber">&amp;</span> Asoc.
                </div>
                <div className="text-[9px] tracking-[0.32em] text-muted uppercase mt-[6px] max-[760px]:hidden">
                  Productores asesores de seguros · Matr. 64.231
                </div>
              </div>
            </Link>

            <div className="flex gap-7 items-center text-[13.5px] max-[760px]:hidden">
              <Link
                href="/coberturas"
                className="py-[6px] border-b border-transparent text-cream-2 transition-colors hover:text-amber hover:border-amber"
              >
                Coberturas
              </Link>
              {ANCHOR_LINKS.map(({ href, label }) => (
                <a key={href} href={href} className={anchorClass(href)}>
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4 max-[760px]:hidden">
              <ThemeToggle />
              <a
                href="tel:+541148150099"
                className="text-[14px] text-cream tracking-[-0.01em] font-medium shrink-0 text-right"
              >
                <span className="text-[9.5px] tracking-[0.24em] text-muted uppercase block mb-1">Línea directa</span>
                +54 11 4815-0099
              </a>
            </div>

            <button
              className="hidden max-[760px]:flex flex-col justify-center gap-[5px] bg-transparent border-none p-2 z-[300] shrink-0"
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            >
              <span
                className={`block w-6 h-[1.5px] bg-cream origin-center transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'translate-y-[6.5px] rotate-45' : ''}`}
              />
              <span
                className={`block w-6 h-[1.5px] bg-cream transition-all duration-[250ms] ${open ? 'opacity-0 scale-x-0' : ''}`}
              />
              <span
                className={`block w-6 h-[1.5px] bg-cream origin-center transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? '-translate-y-[6.5px] -rotate-45' : ''}`}
              />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`hidden max-[760px]:flex fixed inset-0 z-[200] bg-ink flex-col px-[22px] pb-[calc(24px+env(safe-area-inset-bottom,0px))] overflow-y-auto transition-opacity duration-[280ms] ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between h-[72px] border-b border-line-2 shrink-0">
          <div className="flex items-center gap-[14px]">
            <div className="w-[42px] h-[42px] border-[1.5px] border-amber rounded-xl flex items-center justify-center font-bold text-[15px] text-amber tracking-[0.08em] shrink-0">
              JP
            </div>
            <div className="font-bold text-[17px] tracking-[-0.02em] text-cream leading-none">
              John Pellegrini <span className="text-amber">&amp;</span> Asoc.
            </div>
          </div>
          <button
            className="bg-transparent border-none text-cream-2 p-[10px] flex items-center justify-center transition-colors hover:text-cream rounded-xl"
            onClick={close}
            aria-label="Cerrar menú"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l14 14M17 3L3 17" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav
          className={`flex flex-col flex-1 pt-4 transition-[transform] duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-[60ms] ${open ? 'translate-y-0' : 'translate-y-3'}`}
        >
          {[
            { href: '/coberturas', label: 'Coberturas', isLink: true },
            { href: '#carta', label: 'El productor', isLink: false },
            { href: '#companias', label: 'Compañías', isLink: false },
            { href: '#contacto', label: 'Contacto', isLink: false },
          ].map(item =>
            item.isLink ? (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="flex items-center justify-between py-5 border-b border-line text-[28px] font-bold tracking-[-0.03em] text-cream [-webkit-tap-highlight-color:transparent] active:text-amber"
              >
                <span>{item.label}</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9h12M10 4l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                onClick={close}
                className="flex items-center justify-between py-5 border-b border-line text-[28px] font-bold tracking-[-0.03em] text-cream [-webkit-tap-highlight-color:transparent] active:text-amber"
              >
                <span>{item.label}</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9h12M10 4l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ),
          )}
        </nav>

        <div
          className={`flex items-center justify-between mt-8 mb-4 transition-[transform] duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-[80ms] ${open ? 'translate-y-0' : 'translate-y-3'}`}
        >
          <span className="text-[10px] tracking-[0.24em] text-muted uppercase font-medium">Apariencia</span>
          <ThemeToggle />
        </div>

        <div
          className={`flex gap-3 transition-[transform] duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-[100ms] ${open ? 'translate-y-0' : 'translate-y-3'}`}
        >
          <a
            href="tel:+541148150099"
            onClick={close}
            className="flex-1 flex items-center justify-center gap-2 h-[52px] border border-line-2 rounded-2xl text-[13.5px] font-semibold text-cream-2 tracking-[-0.01em] transition-[border-color,color] [-webkit-tap-highlight-color:transparent] active:border-amber active:text-amber"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.4 1.17 2 2 0 012.38 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 13.92z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            +54 11 4815-0099
          </a>
          <a
            href="https://wa.me/5491162341198"
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="flex-1 flex items-center justify-center gap-2 h-[52px] border border-[rgba(76,175,114,0.3)] rounded-2xl text-[#4caf72] text-[13.5px] font-semibold tracking-[-0.01em] [-webkit-tap-highlight-color:transparent] active:border-amber active:text-amber"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp directo
          </a>
        </div>

        <a
          href="#contacto"
          onClick={close}
          className={`flex items-center justify-center h-[60px] bg-amber rounded-2xl text-ink font-bold text-[15px] tracking-[0.06em] uppercase mt-[14px] [-webkit-tap-highlight-color:transparent] active:bg-amber-2 transition-[background-color,transform] duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-[140ms] ${open ? 'translate-y-0' : 'translate-y-3'}`}
        >
          Cotizar ahora →
        </a>
      </div>
    </>
  )
}
