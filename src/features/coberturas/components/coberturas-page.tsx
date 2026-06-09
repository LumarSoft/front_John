'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { PRODUCTS } from '@/src/features/landing/data/products'
import { FIELDS, CONTACT_FIELDS } from '../data/fields'
import { FormField } from './form-field'
import { CotizadorAutoForm } from '@/src/features/cotizador/components/cotizador-auto-form'
import { fadeUp, fadeUpBlur, stagger, EASE_OUT_EXPO } from '@/src/lib/motion'
import { SectionMark } from '@/src/features/landing/components/section-mark'
import type { Variants } from 'framer-motion'

const PANEL_VARIANTS: Variants = {
  enter: { opacity: 0, x: 14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE_OUT_EXPO } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.18, ease: 'easeIn' } },
}

export function CoberturasPage({ initialCoverageId = PRODUCTS[0].id }: { initialCoverageId?: string }) {
  const [activeId, setActiveId] = useState(initialCoverageId)
  const active = PRODUCTS.find(p => p.id === activeId) ?? PRODUCTS[0]
  const fields = FIELDS[active.id] ?? []
  const formRef = useRef<HTMLDivElement>(null)

  const handleSelect = (id: string) => {
    setActiveId(id)
    if (window.innerWidth <= 900 && formRef.current) {
      const top = formRef.current.getBoundingClientRect().top + window.scrollY - 88
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const handleSubmit = (e: React.FormEvent) => e.preventDefault()

  return (
    <>
      {/* Hero / Header */}
      <section className="relative bg-canvas grain border-b border-line overflow-hidden">
        {/* Soft golden halo behind the figures */}
        <div
          aria-hidden
          className="absolute right-0 bottom-0 h-[80%] w-[70%] md:w-[55%] pointer-events-none"
          style={{
            background: 'radial-gradient(55% 75% at 70% 100%, rgba(232,168,32,0.14) 0%, transparent 75%)',
          }}
        />

        <div className="container relative pt-[110px] md:pt-[140px]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-end">
            <motion.div
              className="md:col-span-6 lg:col-span-7 pb-10 md:pb-24 lg:pb-28 mt-8"
              initial="hidden"
              animate="visible"
              variants={stagger(0.13, 0.05)}
            >
              <motion.h1
                variants={fadeUpBlur}
                className="font-display text-[clamp(32px,6.4vw,80px)] leading-[0.96] text-ink m-0"
              >
                Todo lo que necesitás, <span className="text-ember-2">cubierto.</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-5 md:mt-7 max-w-[480px] text-[15px] md:text-[16px] text-ink-3 leading-[1.6] m-0"
              >
                Elegí la cobertura, completá los datos y te respondemos con cotización detallada el mismo día hábil —
                sin call centers de por medio.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
              className="hidden md:flex md:col-span-6 lg:col-span-5 relative md:h-[600px] lg:h-[640px] items-end justify-end"
            >
              <Image
                src="/coberturaImg.png"
                alt="Asesores de John Pellegrini & Asoc."
                fill
                className="object-contain object-center md:object-bottom"
                priority
                sizes="(max-width: 768px) 90vw, (max-width: 1280px) 50vw, 640px"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cotizador */}
      <section className="bg-paper py-[clamp(48px,8vw,100px)]">
        <div className="container grid grid-cols-[300px_1fr] gap-12 items-start max-[900px]:grid-cols-1 max-[900px]:gap-6">
          {/* Mobile horizontal scroll selector */}
          <motion.nav
            className="hidden max-[900px]:flex -mx-5 px-5 gap-2 overflow-x-auto pb-2 scrollbar-hide"
            initial="hidden"
            animate="visible"
            variants={stagger(0.04, 0.2)}
            aria-label="Elegí una cobertura"
          >
            {PRODUCTS.map(p => {
              const Icon = p.Icon
              const isActive = p.id === activeId
              return (
                <motion.button
                  key={p.id}
                  variants={fadeUp}
                  onClick={() => handleSelect(p.id)}
                  className={`shrink-0 inline-flex items-center gap-2 px-4 py-[10px] rounded-full border transition-[background-color,color,border-color] [-webkit-tap-highlight-color:transparent] ${
                    isActive ? 'bg-ink text-paper border-ink' : 'bg-canvas-2 text-ink-3 border-line hover:text-ink'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-[13px] font-semibold tracking-[-0.005em] whitespace-nowrap">{p.label}</span>
                </motion.button>
              )
            })}
          </motion.nav>

          {/* Desktop sidebar */}
          <motion.nav
            className="flex flex-col gap-1 sticky top-[100px] bg-canvas-2 border border-line rounded-3xl p-2 max-[900px]:hidden"
            initial="hidden"
            animate="visible"
            variants={stagger(0.04, 0.25)}
          >
            <div className="text-[10px] tracking-[0.22em] uppercase text-faint font-semibold px-4 pt-3 pb-2">
              Elegí una cobertura
            </div>
            {PRODUCTS.map(p => {
              const Icon = p.Icon
              const isActive = p.id === activeId
              return (
                <motion.button
                  key={p.id}
                  variants={fadeUp}
                  className={`flex items-center gap-3 px-4 py-[12px] text-left rounded-2xl transition-[background-color,color] duration-[180ms] [-webkit-tap-highlight-color:transparent] ${
                    isActive ? 'bg-ink text-paper' : 'text-ink-3 hover:bg-paper hover:text-ink'
                  }`}
                  onClick={() => handleSelect(p.id)}
                >
                  <div
                    className={`shrink-0 transition-colors duration-[180ms] ${isActive ? 'text-paper' : 'text-ink-3'}`}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="text-[13.5px] font-semibold tracking-[-0.005em] flex-1">{p.label}</span>
                  <svg
                    className={`shrink-0 text-ember transition-[opacity,transform] duration-[180ms] ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'}`}
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              )
            })}
          </motion.nav>

          <div className="min-w-0" ref={formRef}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial="enter"
                animate="visible"
                exit="exit"
                variants={PANEL_VARIANTS}
                className="bg-canvas-2 border border-line rounded-2xl md:rounded-3xl p-6 md:p-10"
              >
                <div className="mb-7 md:mb-9 pb-6 md:pb-7 border-b border-line">
                  <div className="flex items-center gap-3 mb-3 md:mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ember text-paper">
                      <active.Icon size={20} />
                    </div>
                    <div className="text-[10.5px] tracking-[0.24em] uppercase text-faint font-semibold">
                      Cotizador · {active.label}
                    </div>
                  </div>
                  <h2 className="font-display text-[clamp(30px,4vw,44px)] leading-[1.0] text-ink m-0 mb-2">
                    {active.label}
                  </h2>
                  <p className="text-[14.5px] text-ink-3 leading-[1.55] m-0">{active.sub}</p>
                </div>

                {activeId === 'auto' ? (
                  <CotizadorAutoForm />
                ) : (
                  <form className="flex flex-col" onSubmit={handleSubmit}>
                    <div className="text-[10.5px] tracking-[0.24em] uppercase text-faint font-semibold mb-[18px]">
                      Datos de la cobertura
                    </div>
                    <div className="grid grid-cols-2 gap-[14px] mb-2 max-[560px]:grid-cols-1">
                      {fields.map((f, i) => (
                        <FormField key={i} field={f} />
                      ))}
                    </div>

                    <hr className="border-none border-t border-line my-7" />

                    <div className="text-[10.5px] tracking-[0.24em] uppercase text-faint font-semibold mb-[18px]">
                      Tus datos de contacto
                    </div>
                    <div className="grid grid-cols-2 gap-[14px] mb-2 max-[560px]:grid-cols-1">
                      {CONTACT_FIELDS.map((f, i) => (
                        <FormField key={i} field={f} />
                      ))}
                    </div>

                    <div className="flex items-center gap-5 mt-8 flex-wrap">
                      <button
                        type="submit"
                        className="btn-shimmer inline-flex items-center gap-2 bg-ember text-paper border-none py-[14px] px-6 rounded-full font-semibold text-[13.5px] tracking-[-0.005em] cursor-pointer transition-[background-color,box-shadow] hover:bg-ember-2 hover:shadow-[0_12px_32px_-8px_rgba(232,168,32,0.55)]"
                      >
                        Solicitar cotización
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <span className="text-[12.5px] text-faint tracking-[-0.005em]">
                        Te respondemos en menos de 24 hs hábiles
                      </span>
                    </div>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  )
}
