'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeUp, stagger, viewport } from '@/src/lib/motion'

interface CredItem {
  k: ReactNode
  v: string
}

const ITEMS: CredItem[] = [
  {
    k: (
      <>
        52 <em className="not-italic text-amber">años</em>
      </>
    ),
    v: 'Asesorando familias y empresas desde 1974 en Rosario, Santa Fe.',
  },
  {
    k: (
      <>
        En el <em className="not-italic text-amber">día</em>
      </>
    ),
    v: 'Recibís tu cotización detallada el mismo día que consultás, sin excepciones.',
  },
  {
    k: (
      <>
        100<em className="not-italic text-amber">%</em>
      </>
    ),
    v: 'Atención directa con el productor. No tercerizamos ningún siniestro.',
  },
  {
    k: (
      <>
        SSN <em className="not-italic text-amber">64.231</em>
      </>
    ),
    v: 'Matrícula vigente ante la Superintendencia de Seguros de la Nación.',
  },
]

export function Credenciales() {
  return (
    <section className="container border-b border-line">
      <motion.div
        className="grid grid-cols-4 max-[880px]:grid-cols-2"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={stagger(0.1)}
      >
        {ITEMS.map((item, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className={`
              py-11 flex flex-col gap-4
              border-r border-line last:border-r-0
              max-[880px]:[&:nth-child(2n)]:border-r-0
              max-[880px]:[&:nth-child(-n+2)]:border-b max-[880px]:[&:nth-child(-n+2)]:border-line
              max-[880px]:py-8
              ${i === 0 ? 'pr-8' : i % 2 === 0 ? 'px-8 max-[880px]:pl-0 max-[880px]:pr-8' : 'px-8 max-[880px]:pl-8'}
            `}
          >
            <div className="w-7 h-[2px] bg-amber" />
            <div className="font-bold text-[40px] tracking-[-0.045em] text-cream leading-none">{item.k}</div>
            <p className="text-[12.5px] text-cream-2 tracking-[0.01em] leading-[1.6] m-0 max-w-[220px]">{item.v}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
