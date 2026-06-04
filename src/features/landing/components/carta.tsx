'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeUp, fadeUpBlur, stagger, viewport } from '@/src/lib/motion'
import { SectionMark } from './section-mark'

const STATS = [
  { value: '< 24h', label: 'Cotización detallada en el día' },
  { value: '48h', label: 'Liquidación promedio de siniestros' },
  { value: '+1.500', label: 'Familias y empresas asegurando' },
  { value: '24/7', label: 'Disponibles ante un siniestro' },
]

const PROMISES = [
  {
    title: 'El mismo productor en cada llamada',
    body: 'No te atiende un call center. Hablás siempre con tu productor — el que conoce tu póliza, tu situación y tu historia.',
  },
  {
    title: 'Sin derivaciones, sin "comunicate con la compañía"',
    body: 'Gestionamos tu siniestro de principio a fin. Vos hablás con nosotros y nosotros hablamos con la aseguradora.',
  },
  {
    title: 'Cobertura ajustada por inflación',
    body: 'Revisamos tus sumas aseguradas cada año para que el día que pase algo, lo que cobres alcance para reponer lo que perdiste.',
  },
  {
    title: 'Cero letra chica',
    body: 'Te explicamos lo que cubre y lo que no antes de emitir. Sin sorpresas el día que tengas que usarla.',
  },
]

const COMPARISON = [
  { feature: 'Productor único asignado', us: true, them: false, themLabel: 'Call center rotativo' },
  { feature: 'Cotización en el día', us: true, them: false, themLabel: 'Hasta 5 días hábiles' },
  { feature: 'Gestión del siniestro por tu productor', us: true, them: false, themLabel: 'Te derivan a un 0800' },
  { feature: 'Asesoramiento previo personalizado', us: true, them: false, themLabel: 'Comparador automático' },
]

export function Carta() {
  return (
    <section id="carta" className="relative bg-paper grain">
      <div className="container py-[clamp(64px,11vw,140px)]">
        {/* Header */}
        <motion.div
          className="max-w-[760px] mb-12 md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger(0.12)}
        >
          <motion.div variants={fadeUp} className="mb-7">
            <SectionMark index="02" label="La diferencia" />
          </motion.div>

          <motion.h2
            variants={fadeUpBlur}
            className="font-display text-[clamp(32px,5.6vw,72px)] leading-[0.96] text-ink m-0"
          >
            Lo que cambia cuando elegís un <span className="text-ember-2">productor que responde.</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-5 md:mt-7 text-[15px] md:text-[16.5px] text-ink-3 leading-[1.6] max-w-[600px] m-0"
          >
            No vendemos pólizas: aseguramos resultados. Esto es lo que vas a ver desde el primer día — no en la letra
            chica, no en el folleto: en la práctica.
          </motion.p>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line-2 rounded-2xl md:rounded-3xl overflow-hidden border border-line-2 mb-10 md:mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger(0.08)}
        >
          {STATS.map(stat => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="bg-paper p-5 md:p-7 flex flex-col justify-between min-h-[120px] md:min-h-[150px]"
            >
              <div className="font-display text-[clamp(28px,7vw,48px)] leading-[0.95] text-ember-2">{stat.value}</div>
              <div className="text-[12px] md:text-[12.5px] text-ink-3 leading-[1.4] mt-2 md:mt-3 max-w-[180px]">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Promises bento */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-10 md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger(0.09)}
        >
          {PROMISES.map(p => (
            <motion.div
              key={p.title}
              variants={fadeUp}
              className="group relative bg-canvas-2 border border-line rounded-2xl md:rounded-3xl p-5 md:p-8 flex gap-4 md:gap-5 transition-[border-color,background-color] hover:border-ember/30 hover:bg-canvas"
            >
              <div className="shrink-0 flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-ember/12 text-ember-2 transition-colors group-hover:bg-ember group-hover:text-paper">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="font-display text-[16.5px] md:text-[19px] text-ink leading-[1.2] mb-1.5 md:mb-2">
                  {p.title}
                </div>
                <div className="text-[13.5px] md:text-[14px] text-ink-3 leading-[1.55]">{p.body}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger(0.1)}
          className="relative bg-ink text-paper rounded-2xl md:rounded-3xl overflow-hidden border border-ink"
        >
          <div
            aria-hidden
            className="absolute -top-20 -right-10 w-[420px] h-[420px] rounded-full bg-ember/15 blur-3xl"
          />
          <div className="relative p-5 md:p-10">
            <motion.div variants={fadeUp} className="mb-6 md:mb-8">
              <div className="mb-5">
                <SectionMark index="02.1" label="Comparativa honesta" tone="dark" />
              </div>
              <h3 className="font-display text-[clamp(24px,5.6vw,40px)] leading-[1.02] text-paper m-0 max-w-[600px] mb-5 md:mb-6">
                Pellegrini VS la <span className="text-ember">competencia.</span>
              </h3>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10.5px] md:text-[11.5px] uppercase tracking-[0.18em] font-semibold">
                <div className="flex items-center gap-2 text-ember">
                  <span className="h-[7px] w-[7px] rounded-full bg-ember" /> Con nosotros
                </div>
                <div className="flex items-center gap-2 text-paper/45">
                  <span className="h-[7px] w-[7px] rounded-full bg-paper/30" /> Sin productor
                </div>
              </div>
            </motion.div>

            <motion.ul variants={fadeUp} className="md:border-t md:border-line-dark-2 flex flex-col gap-3 md:gap-0">
              {COMPARISON.map(row => (
                <li
                  key={row.feature}
                  className="md:border-b md:border-line-dark-2 md:py-5 md:grid md:grid-cols-[1.4fr_1fr_1fr] md:items-center md:gap-4"
                >
                  <div className="font-display text-[14.5px] md:text-[17px] text-paper leading-[1.3] mb-3 md:mb-0">
                    {row.feature}
                  </div>

                  {/* Mobile: side-by-side mini cards */}
                  <div className="grid grid-cols-2 gap-2 md:hidden">
                    <div className="rounded-xl bg-ember/[0.10] border border-ember/30 px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-ember mb-1">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 18 18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.6"
                        >
                          <path d="M3 9l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[9.5px] font-bold uppercase tracking-[0.16em]">Pellegrini</span>
                      </div>
                      <div className="text-[13px] text-paper font-semibold leading-[1.25]">Sí</div>
                    </div>
                    <div className="rounded-xl bg-paper/[0.03] border border-paper/10 px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-paper/45 mb-1">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 14 14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <path d="M3 3l8 8M11 3L3 11" strokeLinecap="round" />
                        </svg>
                        <span className="text-[9.5px] font-bold uppercase tracking-[0.16em]">Sin productor</span>
                      </div>
                      <div className="text-[12px] text-paper/65 leading-[1.25]">{row.themLabel}</div>
                    </div>
                  </div>

                  {/* Desktop: inline */}
                  <div className="hidden md:inline-flex items-center gap-2 text-ember">
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M3 9l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[13px] font-semibold">Sí</span>
                  </div>
                  <div className="hidden md:inline-flex items-center gap-2 text-paper/45 text-[13.5px]">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l8 8M11 3L3 11" strokeLinecap="round" />
                    </svg>
                    <span>{row.themLabel}</span>
                  </div>
                </li>
              ))}
            </motion.ul>

            <motion.div
              variants={fadeUp}
              className="mt-8 md:mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5 pt-6 md:pt-8 border-t border-line-dark-2"
            >
              <div>
                <div className="font-display text-[18px] md:text-[20px] text-paper leading-[1.25] mb-1">
                  ¿Y si lo probás 5 minutos?
                </div>
                <div className="text-[13px] md:text-[13.5px] text-paper/65">
                  Una cotización detallada, sin compromiso ni spam.
                </div>
              </div>
              <Link
                href="/coberturas"
                className="btn-shimmer group inline-flex items-center justify-center gap-2 rounded-full bg-ember px-6 md:px-7 py-[14px] md:py-[15px] text-[13.5px] font-semibold tracking-[-0.005em] text-paper transition-[background-color,box-shadow] hover:bg-ember-2 hover:shadow-[0_14px_36px_-8px_rgba(232,168,32,0.55)]"
              >
                Cotizar ahora
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="transition-transform group-hover:translate-x-[3px]"
                >
                  <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
