'use client'

import { useState } from 'react'
import { SectionMark } from './section-mark'

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
    <section id="estudio" className="bg-canvas grain border-t border-line">
      <div className="container py-[clamp(64px,10vw,140px)]">
        <div className="mb-10 md:mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[640px]">
            <div className="mb-5 md:mb-6">
              <SectionMark index="05" label="Las oficinas" />
            </div>
            <h2 className="font-display text-[clamp(28px,5.2vw,56px)] leading-[0.98] text-ink m-0">
              Tres sucursales en el <span className="text-ember-2">Gran Rosario.</span>
            </h2>
          </div>

          <div className="inline-flex w-full md:w-auto gap-1 bg-paper border border-line rounded-full p-1 overflow-x-auto">
            {BRANCHES.map(branch => (
              <button
                key={branch.id}
                onClick={() => setActiveId(branch.id)}
                className={`flex-1 md:flex-none px-3 md:px-4 py-[10px] rounded-full text-[12px] md:text-[12.5px] font-semibold tracking-[-0.005em] transition-colors whitespace-nowrap ${
                  activeId === branch.id ? 'bg-ink text-paper' : 'text-ink-3 hover:text-ink'
                }`}
              >
                {branch.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 md:gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8 bg-paper border border-line rounded-2xl md:rounded-3xl p-6 md:p-8 order-2 lg:order-1">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-canvas-2 px-3 py-[6px] text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
              {active.badge}
            </div>

            <div>
              <div className="text-[10px] tracking-[0.24em] uppercase text-muted font-semibold mb-2">Dirección</div>
              <div className="font-display text-[22px] text-ink leading-[1.2]">{active.address}</div>
              <div className="text-[14px] text-ink-3 mt-1">{active.city}, Argentina</div>
            </div>

            <div>
              <div className="text-[10px] tracking-[0.24em] uppercase text-muted font-semibold mb-2">Horario</div>
              <div className="font-display text-[16px] text-ink">Lunes a viernes · 9 a 18 hs</div>
              <div className="text-[13.5px] text-ink-3 mt-1">
                Siniestros: <span className="text-ember-2 font-semibold">atención 24 hs</span>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-line">
              <div className="text-[10px] tracking-[0.24em] uppercase text-muted font-semibold mb-3">
                Contacto directo
              </div>
              <div className="flex flex-col gap-[6px]">
                <a
                  href="tel:+541148150099"
                  className="text-[15px] text-ink font-semibold tracking-[-0.01em] hover:text-ember-2 transition-colors"
                >
                  +54 11 4815-0099
                </a>
                <a
                  href="https://wa.me/5491162341198"
                  className="text-[13.5px] text-ink-3 hover:text-ember-2 transition-colors"
                >
                  WhatsApp · +54 9 11 6234-1198
                </a>
                <a
                  href="mailto:hola@jpellegrini.ar"
                  className="text-[13.5px] text-ink-3 hover:text-ember-2 transition-colors"
                >
                  hola@jpellegrini.ar
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 rounded-2xl md:rounded-3xl overflow-hidden border border-line h-[320px] md:h-[420px] lg:h-[480px] relative order-1 lg:order-2">
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
                  filter: 'grayscale(0.4) contrast(1.02)',
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
