'use client'

import { useState } from 'react'

type BranchId = 'rosario' | 'funes' | 'pueblo-esther'

interface Branch {
  id: BranchId
  name: string
  badge: string
  address: string
  city: string
  mapSrc: string
  mapTitle: string
}

const BRANCHES: Branch[] = [
  {
    id: 'rosario',
    name: 'Rosario',
    badge: 'Casa Central',
    address: 'Blvd. 27 de Febrero 275',
    city: 'Rosario, Santa Fe',
    mapSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3347.2842954101525!2d-60.63453542353262!3d-32.96990047306482!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b7abadacfbc5e3%3A0x47cf27951fcd52d2!2sJohn%20Pellegrini%20Management%20Group%20SRL%20-%20Productores%20Asesores%20de%20Seguros!5e0!3m2!1ses-419!2sar!4v1779743187004!5m2!1ses-419!2sar',
    mapTitle: 'Sucursal Rosario · John Pellegrini Management Group',
  },
  {
    id: 'funes',
    name: 'Funes',
    badge: 'Agencia',
    address: 'Funes',
    city: 'Funes, Santa Fe',
    mapSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3348.9927053053857!2d-60.802052723534175!3d-32.92479097078641!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b64dada54ea1e7%3A0xf37fc117a0ef9e42!2sJOHN%20PELLEGRINI%20MANAGEMENT%20GROUP%20SRL%20ORGANIZACION%20DE%20SEGUROS%20AGENCIA%20FUNES!5e0!3m2!1ses-419!2sar!4v1779743247885!5m2!1ses-419!2sar',
    mapTitle: 'Agencia Funes · John Pellegrini Management Group',
  },
  {
    id: 'pueblo-esther',
    name: 'Pueblo Esther',
    badge: 'Agencia',
    address: 'Pueblo Esther',
    city: 'Pueblo Esther, Santa Fe',
    mapSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3343.3516652407643!2d-60.5803942235286!3d-33.073531678309905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b708060eac8f97%3A0xe0604fede533e0c6!2sJohn%20Pellegrini%20Management%20Group%20SRL%20Organizacion%20de%20Seguros%20Agencia%20Pueblo%20Esther!5e0!3m2!1ses-419!2sar!4v1779743265028!5m2!1ses-419!2sar',
    mapTitle: 'Agencia Pueblo Esther · John Pellegrini Management Group',
  },
]

export function Estudio() {
  const [activeId, setActiveId] = useState<BranchId>('rosario')
  const active = BRANCHES.find(b => b.id === activeId)!

  return (
    <section id="estudio" className="border-t border-line-2">
      <div className="container py-[120px] max-[880px]:py-[80px]">
        <div className="mb-12 max-[880px]:mb-10">
          <div className="text-[11px] tracking-[0.32em] uppercase text-amber font-medium mb-7">Dónde estamos</div>
          <h2 className="font-bold text-[clamp(36px,4.8vw,60px)] leading-[1.02] tracking-[-0.045em] text-cream m-0 mb-10">
            Tres sucursales en el <em className="not-italic text-amber">Gran Rosario.</em>
          </h2>

          <div className="flex gap-2 flex-wrap">
            {BRANCHES.map(branch => (
              <button
                key={branch.id}
                onClick={() => setActiveId(branch.id)}
                className={`flex flex-col items-start px-4 py-[10px] rounded-xl border transition-all duration-200 text-left ${
                  activeId === branch.id
                    ? 'bg-amber border-amber text-ink'
                    : 'bg-surface border-line-2 text-cream-2 hover:border-line hover:text-cream hover:bg-surface-2'
                }`}
              >
                <span
                  className={`text-[9.5px] tracking-[0.22em] uppercase font-semibold mb-[2px] ${
                    activeId === branch.id ? 'text-ink opacity-60' : 'text-muted'
                  }`}
                >
                  {branch.badge}
                </span>
                <span className="text-[13px] font-semibold tracking-[-0.02em]">{branch.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-16 items-start max-[880px]:grid-cols-1 max-[880px]:gap-8">
          <div className="flex flex-col gap-8 max-[880px]:order-2">
            <div>
              <div className="text-[10px] tracking-[0.24em] uppercase text-muted font-medium mb-[10px]">Dirección</div>
              <div className="text-[17px] text-cream font-semibold tracking-[-0.02em]">{active.address}</div>
              <div className="text-[14px] text-cream-2 mt-1">{active.city}, Argentina</div>
            </div>

            <div>
              <div className="text-[10px] tracking-[0.24em] uppercase text-muted font-medium mb-[10px]">
                Horario de atención
              </div>
              <div className="text-[17px] text-cream font-semibold tracking-[-0.02em]">Lunes a viernes · 9 a 18 hs</div>
              <div className="text-[14px] text-cream-2 mt-1">
                Siniestros: <span className="text-amber font-medium">atención 24 hs</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] tracking-[0.24em] uppercase text-muted font-medium mb-[10px]">
                Contacto directo
              </div>
              <div className="flex flex-col gap-[6px]">
                <a
                  href="tel:+541148150099"
                  className="text-[17px] text-cream font-semibold tracking-[-0.02em] hover:text-amber transition-colors"
                >
                  +54 11 4815-0099
                </a>
                <a
                  href="https://wa.me/5491162341198"
                  className="text-[14px] text-cream-2 hover:text-amber transition-colors"
                >
                  WhatsApp · +54 9 11 6234-1198
                </a>
                <a
                  href="mailto:hola@jpellegrini.ar"
                  className="text-[14px] text-cream-2 hover:text-amber transition-colors"
                >
                  hola@jpellegrini.ar
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-line-2 h-[440px] relative max-[880px]:h-[320px] max-[880px]:order-1">
            {BRANCHES.map(branch => (
              <iframe
                key={branch.id}
                src={branch.mapSrc}
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  position: 'absolute',
                  inset: 0,
                  opacity: activeId === branch.id ? 1 : 0,
                  pointerEvents: activeId === branch.id ? 'auto' : 'none',
                  transition: 'opacity 0.3s ease',
                }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={branch.mapTitle}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
