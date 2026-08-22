'use client'

import { motion } from 'framer-motion'
import { BrandMark } from '@/src/components/brand-mark'
import { fadeUp, fadeUpBlur, stagger, viewport } from '@/src/lib/motion'
import { SectionMark } from '@/src/features/landing/components/section-mark'

const STATS = [
  { value: '24/7', label: 'Atención sin horario' },
  { value: '3', label: 'Sucursales conectadas' },
  { value: '26', label: 'Códigos de productor' },
  { value: '0', label: 'Mensajes sin responder' },
]

export function PlataformaHero() {
  return (
    <section className="relative bg-ink text-paper overflow-hidden">
      <div aria-hidden className="absolute -top-40 -left-24 h-[560px] w-[560px] rounded-full bg-ember/10 blur-3xl" />
      <div aria-hidden className="absolute -bottom-48 -right-24 h-[620px] w-[620px] rounded-full bg-amber/8 blur-3xl" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><path d='M0 47h48M47 0v48' stroke='%23fafaf6' stroke-width='0.5' fill='none'/></svg>\")",
        }}
      />

      <div className="container relative pt-[clamp(120px,16vw,190px)] pb-[clamp(72px,11vw,140px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger(0.11)}
            className="lg:col-span-7 max-w-[680px]"
          >
            <motion.div variants={fadeUp} className="mb-7">
              <SectionMark index="00" label="La plataforma" tone="dark" />
            </motion.div>

            <motion.h1
              variants={fadeUpBlur}
              className="font-display text-[clamp(36px,7.4vw,92px)] leading-[0.95] text-paper m-0"
            >
              El asistente de WhatsApp que atiende a tus <span className="text-ember">asegurados.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 md:mt-8 max-w-[560px] text-[15px] md:text-[17px] leading-[1.62] text-paper/65 m-0"
            >
              Un bot que responde al instante, una base de datos con toda la cartera sincronizada y un panel donde cada
              asesor ve sus asegurados, sus cobranzas y sus conversaciones. Desarrollado y operado por John Pellegrini
              Management Group para las productoras del grupo.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mt-8 md:mt-10">
              <a
                href="#servicio"
                className="btn-shimmer inline-flex items-center justify-center gap-3 bg-ember rounded-full px-6 md:px-7 py-[14px] md:py-[15px] font-semibold text-[14px] tracking-[-0.005em] text-paper transition-[background-color,box-shadow] hover:bg-ember-2 hover:shadow-[0_12px_36px_-8px_rgba(232,168,32,0.55)]"
              >
                Ver cómo funciona
              </a>
              <a
                href="#panel"
                className="inline-flex items-center justify-center gap-3 border border-paper/20 rounded-full px-6 md:px-7 py-[14px] md:py-[15px] font-medium text-[14px] tracking-[-0.005em] text-paper/85 transition-[border-color,color] hover:border-paper hover:text-paper"
              >
                Recorrer el panel
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
            className="lg:col-span-5"
          >
            <PhoneMock />
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger(0.08)}
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line-dark-2 rounded-2xl md:rounded-3xl overflow-hidden border border-line-dark-2 mt-14 md:mt-20"
        >
          {STATS.map(stat => (
            <motion.div key={stat.label} variants={fadeUp} className="bg-ink-2 p-5 md:p-7">
              <div className="font-display text-[clamp(26px,3.4vw,40px)] leading-none text-ember">{stat.value}</div>
              <div className="text-[11.5px] md:text-[12.5px] text-paper/55 mt-3 leading-[1.4]">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* Conversación de ejemplo — reproduce el flujo real del asistente. */
function PhoneMock() {
  return (
    <div className="relative mx-auto w-full max-w-[330px]">
      <div className="absolute -inset-6 rounded-[48px] bg-ember/10 blur-2xl" aria-hidden />
      <div className="relative rounded-[38px] border border-line-dark-2 bg-ink-2 p-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
        <div className="rounded-[28px] overflow-hidden bg-[#0b141a]">
          <div className="flex items-center gap-3 bg-[#1f2c33] px-4 py-3">
            <BrandMark size={36} className="rounded-full" />
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-semibold text-white">John Pellegrini Seguros</div>
              <div className="text-[10.5px] text-white/45">en línea</div>
            </div>
          </div>

          <div className="flex flex-col gap-2 px-3 py-4">
            <Bubble side="in">Hola! Necesito el comprobante de mi póliza del auto</Bubble>
            <Bubble side="out">
              Hola! Soy Nico, el asistente de John Pellegrini. Para buscarte necesito tu DNI, me lo pasás?
            </Bubble>
            <Bubble side="in">30111222</Bubble>
            <Bubble side="out">
              Listo Martín. Encontré 2 pólizas a tu nombre:
              <br />
              <br />
              Automotor — Volkswagen Gol Trend
              <br />
              Hogar — Blvd. Oroño 1200
              <br />
              <br />
              De cuál querés el comprobante?
            </Bubble>
            <div className="mt-1 flex flex-wrap gap-2">
              <Chip>Automotor</Chip>
              <Chip>Hogar</Chip>
              <Chip>Hablar con un asesor</Chip>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Bubble({ side, children }: { side: 'in' | 'out'; children: React.ReactNode }) {
  const isOut = side === 'out'
  return (
    <div className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-[12.5px] leading-[1.45] ${
          isOut ? 'rounded-br-sm bg-[#005c4b] text-white' : 'rounded-bl-sm bg-[#202c33] text-white/90'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#2a3942] bg-[#182229] px-3 py-[6px] text-[11px] font-medium text-[#53bdeb]">
      {children}
    </span>
  )
}
