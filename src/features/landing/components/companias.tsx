'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Company } from '../types'
import { fadeUp, stagger, viewport } from '@/src/lib/motion'
import { SectionMark } from './section-mark'

const COMPANIES: Company[] = [
  {
    name: 'Triunfo Seguros',
    logo: '/triunfo-seguros.png',
    blurb:
      'La elegimos para coberturas de movilidad y hogar. Tiempos de liquidación rápidos y red de atención en todo el país.',
    lines: ['Auto', 'Moto', 'Bicicletas', 'Hogar'],
  },
  {
    name: 'Sancor Seguros',
    logo: '/sancor-seguuros-.png',
    blurb:
      'Nuestra opción para patrimonio empresarial, vida y praxis profesional. Cooperativa con respaldo nacional y cobertura a medida.',
    lines: ['Comercio e Industria', 'Personas', 'Praxis', 'Bolso'],
  },
]

export function Companias() {
  return (
    <section id="companias" className="relative bg-canvas grain border-t border-line">
      <div className="container py-[clamp(64px,10vw,140px)]">
        <motion.div
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10 md:mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger(0.12)}
        >
          <motion.div variants={fadeUp} className="max-w-[700px]">
            <div className="mb-6">
              <SectionMark index="03" label="Las firmas" />
            </div>
            <h2 className="font-display text-[clamp(30px,5.6vw,64px)] leading-[0.98] text-ink m-0">
              Las <span className="text-ember-2">empresas</span> con las que trabajamos
            </h2>
          </motion.div>
          <motion.p variants={fadeUp} className="text-[15px] text-ink-3 leading-[1.65] max-w-[340px] m-0">
            Sabemos que cada negocio es diferente. Por eso trabajamos con las mejores para que tus bienes estén
            protegidos.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger(0.14)}
        >
          {COMPANIES.map((c, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="group relative bg-paper border border-line-2 rounded-2xl md:rounded-3xl p-6 md:p-9 flex flex-col gap-5 md:gap-7 transition-[border-color,box-shadow] hover:border-ember/30 hover:shadow-[0_24px_60px_-30px_rgba(232,168,32,0.22)]"
            >
              <div className="flex items-start justify-between gap-4">
                {c.logo && (
                  <div className="relative h-10 md:h-12 w-[150px] md:w-[180px]">
                    <Image src={c.logo} alt={c.name} fill className="object-contain object-left" sizes="180px" />
                  </div>
                )}
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-line-2 text-faint transition-colors group-hover:text-ember-2 group-hover:border-ember/40 shrink-0">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <p className="text-[15px] md:text-[16.5px] font-medium leading-[1.55] text-ink m-0 tracking-[-0.015em]">
                {c.blurb}
              </p>

              <div className="mt-auto pt-5 md:pt-6 border-t border-line">
                <div className="text-[10px] tracking-[0.22em] uppercase text-faint font-semibold mb-3">
                  Líneas que operamos
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.lines.map(line => (
                    <span
                      key={line}
                      className="text-[11.5px] font-medium tracking-[-0.005em] text-ink-2 bg-canvas-2 rounded-full px-3 py-[6px]"
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
