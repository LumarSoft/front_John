'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Company } from '../types'
import { fadeUp, stagger, viewport } from '@/src/lib/motion'

const COMPANIES: Company[] = [
  {
    name: 'Triunfo Seguros',
    logo: '/triunfo-seguros.png',
    blurb:
      'La elegimos para coberturas de movilidad y hogar. Destacamos sus tiempos de liquidación de siniestros y la solidez de su red de atención en todo el país.',
    lines: ['Auto', 'Moto', 'Bicicletas', 'Hogar'],
  },
  {
    name: 'Sancor Seguros',
    logo: '/sancor-seguuros-.png',
    blurb:
      'Nuestra opción para patrimonio empresarial, vida y praxis profesional. Cooperativa con respaldo nacional y cobertura a medida para cada actividad.',
    lines: ['Comercio e Industria', 'Personas', 'Praxis', 'Bolso'],
  },
]

export function Companias() {
  return (
    <section id="companias" className="container py-[120px] border-t border-line-2">
      <motion.div
        className="grid grid-cols-2 gap-16 items-end mb-16 max-[880px]:grid-cols-1 max-[880px]:gap-6 max-[880px]:mb-10"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={stagger(0.12)}
      >
        <motion.div variants={fadeUp}>
          <h2 className="font-bold text-[clamp(40px,5.4vw,68px)] leading-[1.02] tracking-[-0.045em] text-cream m-0">
            Las compañías detrás de <em className="not-italic text-amber">tu cobertura.</em>
          </h2>
        </motion.div>
        <motion.p variants={fadeUp} className="text-[15.5px] text-cream-2 leading-[1.6] max-w-[440px] m-0">
          No trabajamos con cualquier compañía — elegimos dos por su solvencia, sus tiempos de respuesta y porque
          conocemos cómo operan cuando hay un siniestro.
        </motion.p>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-6 max-[680px]:grid-cols-1"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={stagger(0.14)}
      >
        {COMPANIES.map((c, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="border border-line-2 rounded-2xl p-10 flex flex-col gap-8 max-[880px]:p-7"
          >
            <div>
              {c.logo && (
                <div className="relative h-14 w-[200px]">
                  <Image src={c.logo} alt={c.name} fill className="object-contain object-left" sizes="200px" />
                </div>
              )}
              <div className="text-[12px] text-muted tracking-[0.18em] uppercase mt-3">{c.name}</div>
            </div>

            <p className="text-[14.5px] text-cream-2 leading-[1.65] m-0">{c.blurb}</p>

            <div className="mt-auto pt-6 border-t border-line-2">
              <div className="text-[10.5px] tracking-[0.22em] uppercase text-muted font-medium mb-3">
                Líneas que operamos
              </div>
              <div className="flex flex-wrap gap-2">
                {c.lines.map(line => (
                  <span
                    key={line}
                    className="text-[11.5px] tracking-[0.04em] text-cream-2 border border-line-2 rounded-full px-3 py-[6px]"
                  >
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
