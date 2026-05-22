'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PRODUCTS } from '@/src/features/landing/data/products'
import { FIELDS, CONTACT_FIELDS } from '../data/fields'
import { FormField } from './form-field'
import { CotizadorAutoForm } from '@/src/features/cotizador/components/cotizador-auto-form'
import { fadeUp, fadeUpBlur, stagger, EASE_OUT_EXPO } from '@/src/lib/motion'
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
      <section className="pt-[100px] pb-[100px] border-b border-line-2">
        <motion.div
          className="container text-center flex flex-col items-center"
          initial="hidden"
          animate="visible"
          variants={stagger(0.13, 0.05)}
        >
          <motion.div
            variants={fadeUp}
            className="text-[10.5px] tracking-[0.36em] uppercase text-amber font-medium mb-7"
          >
            Coberturas · John Pellegrini &amp; Asoc.
          </motion.div>
          <motion.h1
            variants={fadeUpBlur}
            className="font-bold text-[clamp(52px,8vw,110px)] leading-[0.97] tracking-[-0.05em] text-cream m-0 mb-7"
          >
            Todo lo que
            <br />
            necesitás, <em className="italic text-amber">cubierto.</em>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-[16px] text-cream-2 leading-[1.65] max-w-[480px] m-0">
            Seleccioná la cobertura, completá los datos y te enviamos la cotización detallada en el día.
          </motion.p>
        </motion.div>
      </section>

      <section className="pt-[72px] pb-[120px] bg-ink">
        <div className="container grid grid-cols-[320px_1fr] gap-16 items-start max-[900px]:grid-cols-1 max-[900px]:gap-10">
          <motion.nav
            className="flex flex-col gap-2 sticky top-[96px] max-[900px]:static max-[900px]:grid max-[900px]:grid-cols-2 max-[480px]:grid-cols-1"
            initial="hidden"
            animate="visible"
            variants={stagger(0.06, 0.35)}
          >
            {PRODUCTS.map(p => {
              const Icon = p.Icon
              const isActive = p.id === activeId
              return (
                <motion.button
                  key={p.id}
                  variants={fadeUp}
                  className={`flex items-center gap-4 px-5 py-[18px] border cursor-pointer text-left transition-[background-color,border-color,color] duration-[180ms] [-webkit-tap-highlight-color:transparent] ${
                    isActive
                      ? 'bg-surface-2 border-amber border-l-[3px] text-cream rounded-xl'
                      : 'bg-ink-2 border-line-2 text-cream-2 hover:bg-surface hover:text-cream rounded-xl'
                  }`}
                  onClick={() => handleSelect(p.id)}
                >
                  <div
                    className={`shrink-0 transition-colors duration-[180ms] ${isActive ? 'text-amber' : 'text-muted'}`}
                  >
                    <Icon size={24} />
                  </div>
                  <span className="text-[13px] font-semibold tracking-[0.08em] uppercase flex-1">{p.label}</span>
                  <svg
                    className={`shrink-0 text-amber transition-[opacity,transform] duration-[180ms] ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'}`}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              )
            })}
          </motion.nav>

          <div className="min-w-0" ref={formRef}>
            <AnimatePresence mode="wait">
              <motion.div key={activeId} initial="enter" animate="visible" exit="exit" variants={PANEL_VARIANTS}>
                <div className="mb-10 pb-8 border-b border-line-2">
                  <div className="text-[10.5px] tracking-[0.32em] uppercase text-amber font-medium mb-[10px]">
                    Cotizador
                  </div>
                  <h2 className="font-bold text-[clamp(32px,4vw,48px)] tracking-[-0.04em] leading-[1.02] text-cream m-0 mb-2">
                    {active.label}
                  </h2>
                  <p className="text-[14px] text-muted leading-[1.55] m-0">{active.sub}</p>
                </div>

                {activeId === 'auto' ? (
                  <CotizadorAutoForm />
                ) : (
                  <form className="flex flex-col" onSubmit={handleSubmit}>
                    <div className="text-[10.5px] tracking-[0.28em] uppercase text-muted font-medium mb-[18px]">
                      Datos de la cobertura
                    </div>
                    <div className="grid grid-cols-2 gap-[14px] mb-2 max-[560px]:grid-cols-1">
                      {fields.map((f, i) => (
                        <FormField key={i} field={f} />
                      ))}
                    </div>

                    <hr className="border-none border-t border-line-2 my-7" />

                    <div className="text-[10.5px] tracking-[0.28em] uppercase text-muted font-medium mb-[18px]">
                      Tus datos de contacto
                    </div>
                    <div className="grid grid-cols-2 gap-[14px] mb-2 max-[560px]:grid-cols-1">
                      {CONTACT_FIELDS.map((f, i) => (
                        <FormField key={i} field={f} />
                      ))}
                    </div>

                    <div className="flex items-center gap-6 mt-7 flex-wrap">
                      <button
                        type="submit"
                        className="bg-amber text-ink border-none py-[15px] px-8 rounded-xl font-bold text-[13px] tracking-[0.06em] uppercase cursor-pointer transition-colors hover:bg-[#e5b450]"
                      >
                        Solicitar cotización →
                      </button>
                      <span className="text-[12px] text-muted tracking-[0.04em]">
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
