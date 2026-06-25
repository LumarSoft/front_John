'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PRODUCTS } from '../data/products'
import { fadeUp, stagger, viewport } from '@/src/lib/motion'
import { SectionMark } from './section-mark'

export function Cotizador() {
  const router = useRouter()

  return (
    <section id="coberturas" className="relative grain bg-canvas">
      <div className="container py-[clamp(64px,10vw,140px)]">
        <motion.div
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10 md:mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger(0.12)}
        >
          <motion.div variants={fadeUp} className="max-w-[640px]">
            <div className="mb-6">
              <SectionMark index="01" label="Catálogo" />
            </div>
            <h2 className="font-display text-[clamp(32px,5.6vw,68px)] leading-[0.96] text-ink m-0">
              ¿Qué tipo de <span className="text-ember-2">seguro</span> estás buscando?
            </h2>
          </motion.div>
          <motion.div variants={fadeUp} className="max-w-[360px]">
            <p className="text-[15px] text-ink-3 leading-[1.65] m-0">
              Elegí qué necesitás proteger. Te respondemos con cotización detallada el mismo día hábil — sin call
              centers de por medio.
            </p>
            <button
              onClick={() => router.push('/coberturas')}
              className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-ink underline decoration-ember decoration-2 underline-offset-[6px] transition-colors hover:text-ember-2"
            >
              Ver todas las coberturas
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger(0.06)}
        >
          {PRODUCTS.map(item => {
            const ItemIcon = item.Icon
            return (
              <motion.button
                key={item.id}
                variants={fadeUp}
                onClick={() => router.push(`/coberturas?coverage=${item.id}`)}
                className="group relative flex flex-col gap-3 md:gap-4 rounded-2xl md:rounded-3xl p-5 md:p-7 text-left bg-paper border border-line-2 transition-[transform,border-color,box-shadow] hover:-translate-y-[2px] hover:border-ember/40 hover:shadow-[0_12px_28px_-12px_rgba(232,168,32,0.22)] min-h-[200px] md:min-h-[220px]"
              >
                <div className="flex items-start justify-between">
                  <div className="text-ink-3 transition-colors group-hover:text-ember-2">
                    <ItemIcon size={26} />
                  </div>
                  <div className="font-display text-[11px] tracking-[-0.01em] font-bold text-ember">{item.n}</div>
                </div>
                <div className="mt-auto">
                  <div className="font-display text-[18px] md:text-[20px] text-ink leading-[1.1]">{item.label}</div>
                  <div className="text-[12px] md:text-[12.5px] text-faint mt-1 leading-[1.5]">{item.sub}</div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3 transition-colors group-hover:text-ember-2">
                  Cotizar
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="transition-transform group-hover:translate-x-[3px]"
                  >
                    <path d="M2 6h7M6 2.5L9.5 6 6 9.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
