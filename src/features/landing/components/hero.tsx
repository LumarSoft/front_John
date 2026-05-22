'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeUp, fadeUpBlur, stagger, scaleIn } from '@/src/lib/motion'

export function Hero() {
  return (
    <section
      className="border-b border-line-2"
      style={{
        background: 'radial-gradient(ellipse 70% 60% at 5% 55%, rgba(232,168,32,0.045) 0%, transparent 65%)',
      }}
    >
      <motion.div
        className="container pt-[60px] pb-[80px]"
        initial="hidden"
        animate="visible"
        variants={stagger(0.13, 0.05)}
      >
        <div>
          <motion.div variants={fadeUp} className="text-[11px] tracking-[0.32em] uppercase text-amber mb-7 font-medium">
            Productores Asesores · Rosario, Argentina
          </motion.div>

          <motion.h1
            variants={fadeUpBlur}
            className="font-bold text-[clamp(54px,7.2vw,108px)] leading-[0.98] tracking-[-0.05em] text-cream mb-7 mt-0"
          >
            Coberturas
            <br />
            que <em className="italic text-amber">responden</em>
            <br />
            <span className="text-[0.62em] tracking-[-0.01em]">cuando más importa.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-[17px] text-cream-2 max-w-[600px] leading-[1.6] mb-9 mt-0">
            Asesoramos a personas, familias y empresas en la elección de coberturas patrimoniales. Cotizamos el mismo
            día y acompañamos cada siniestro de principio a fin — sin intermediarios, sin derivaciones.
          </motion.p>

          <motion.div
            variants={scaleIn}
            className="mt-8 border border-line-2 rounded-2xl p-6 grid grid-cols-[1fr_1fr_1fr_auto] gap-6 items-center bg-[linear-gradient(180deg,rgba(232,168,32,0.05)_0%,transparent_100%)] max-[720px]:grid-cols-[1fr_1fr] max-[720px]:gap-[18px]"
          >
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-muted mb-2 font-medium">Pólizas activas</div>
              <div className="text-[19px] text-cream tracking-[-0.03em] font-semibold">2.418</div>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-muted mb-2 font-medium">Cotización</div>
              <div className="text-[19px] text-cream tracking-[-0.03em] font-semibold">
                <em className="not-italic text-amber">En el día</em>
              </div>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-muted mb-2 font-medium">Siniestros</div>
              <div className="text-[19px] text-cream tracking-[-0.03em] font-semibold">Los resolvemos nosotros</div>
            </div>
            <Link
              href="/coberturas"
              className="bg-cream text-ink px-7 py-[18px] rounded-xl text-[13px] font-bold tracking-[0.06em] uppercase transition-colors hover:bg-amber"
            >
              Cotizar →
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
