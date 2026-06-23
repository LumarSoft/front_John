'use client'

import { motion } from 'framer-motion'
import { fadeUp, fadeUpBlur, stagger, viewport } from '@/src/lib/motion'
import { useAttentionHours } from '@/src/hooks/use-attention-hours'
import { SectionMark } from './section-mark'

export function CtaSection() {
  const attentionHours = useAttentionHours()
  const contactItems = [
    {
      label: 'Teléfono',
      value: '+54 11 4815-0099',
      href: 'tel:+541148150099',
      sub: attentionHours,
    },
    {
      label: 'WhatsApp',
      value: '+54 9 11 6234-1198',
      href: 'https://wa.me/5491162341198',
      sub: 'Respuesta en menos de 1 hora',
    },
    {
      label: 'Correo',
      value: 'hola@jpellegrini.ar',
      href: 'mailto:hola@jpellegrini.ar',
      sub: 'Respondemos el mismo día hábil',
    },
    {
      label: 'Estudio central',
      value: 'Blvd. 27 de Febrero 275',
      href: 'https://maps.google.com/?q=Blvd.+27+de+Febrero+275+Rosario',
      sub: 'Rosario, Santa Fe',
    },
  ]

  return (
    <section id="contacto" className="relative bg-ink text-paper overflow-hidden">
      {/* Ambient gradient blobs */}
      <div aria-hidden className="absolute -top-32 -left-20 w-[520px] h-[520px] rounded-full bg-ember/10 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full bg-amber/8 blur-3xl" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><path d='M0 47h48M47 0v48' stroke='%23fafaf6' stroke-width='0.5' fill='none'/></svg>\")",
        }}
      />

      <div className="container relative py-[clamp(72px,12vw,160px)]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger(0.12)}
          className="max-w-[1000px]"
        >
          <motion.div variants={fadeUp} className="mb-7">
            <SectionMark index="06" label="Hablemos" tone="dark" />
          </motion.div>

          <motion.h2
            variants={fadeUpBlur}
            className="font-display text-[clamp(40px,8.5vw,128px)] leading-[0.94] text-paper m-0"
          >
            Cotizá con un
            <br />
            productor de <span className="text-ember">verdad.</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-6 md:mt-9 max-w-[520px] text-[15px] md:text-[16px] leading-[1.6] text-paper/65 m-0"
          >
            Una conversación de 5 minutos y un correo con la cotización el mismo día. Sin compromiso, sin spam — y
            siempre con la misma persona del otro lado.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mt-8 md:mt-10">
            <a
              href="https://wa.me/5491162341198"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shimmer inline-flex items-center justify-center gap-3 bg-ember rounded-full px-6 md:px-7 py-[14px] md:py-[15px] font-semibold text-[14px] tracking-[-0.005em] text-paper transition-[background-color,box-shadow] hover:bg-ember-2 hover:shadow-[0_12px_36px_-8px_rgba(232,168,32,0.55)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Escribinos por WhatsApp
            </a>
            <a
              href="tel:+541148150099"
              className="inline-flex items-center justify-center gap-3 border border-paper/20 rounded-full px-6 md:px-7 py-[14px] md:py-[15px] font-medium text-[14px] tracking-[-0.005em] text-paper/85 transition-[border-color,color] hover:border-paper hover:text-paper"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.4 1.17 2 2 0 012.38 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 13.92z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              +54 11 4815-0099
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line-dark-2 rounded-2xl md:rounded-3xl overflow-hidden border border-line-dark-2 mt-12 md:mt-20"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger(0.08)}
        >
          {contactItems.map(item => (
            <motion.a
              key={item.label}
              variants={fadeUp}
              href={item.href}
              {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="group bg-ink-2 p-5 md:p-7 transition-colors hover:bg-ink-3"
            >
              <div className="text-[10px] tracking-[0.24em] uppercase text-paper/55 mb-3 font-semibold">
                {item.label}
              </div>
              <div className="font-display text-[18px] text-paper leading-[1.3] transition-colors group-hover:text-ember">
                {item.value}
              </div>
              <div className="text-[12px] text-paper/55 mt-2 leading-[1.4]">{item.sub}</div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
