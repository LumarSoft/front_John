'use client'

import { motion } from 'framer-motion'
import { fadeUp, fadeUpBlur, stagger, viewport } from '@/src/lib/motion'
import { SectionMark } from '@/src/features/landing/components/section-mark'

const BENEFICIOS = [
  {
    title: 'No se pierde ningún mensaje',
    body: 'El asistente contesta al instante, también un domingo a la noche. Nadie se queda esperando una respuesta hasta el lunes.',
  },
  {
    title: 'Tu cartera, cargada sola',
    body: 'Las pólizas, las cuotas y los vencimientos de tus códigos se sincronizan solos con la compañía. No cargás nada a mano.',
  },
  {
    title: 'Ves solo lo tuyo',
    body: 'Cada asesor entra al panel y encuentra únicamente los asegurados de los códigos que tiene asignados. Nada más.',
  },
  {
    title: 'Menos consultas de rutina',
    body: 'Comprobantes, vencimientos, importes de cuota y datos de póliza los resuelve el asistente. Vos atendés lo que importa.',
  },
  {
    title: 'Tomás la conversación cuando querés',
    body: 'Un botón y el asistente se corre. Seguís vos, con todo el historial de lo que ya se habló a la vista.',
  },
  {
    title: 'El WhatsApp sigue siendo el de siempre',
    body: 'Mismo número, mismos contactos. La oficina puede seguir respondiendo desde el celular como lo viene haciendo.',
  },
]

export function Asesores() {
  return (
    <section id="asesores" className="relative bg-ink text-paper overflow-hidden border-t border-line-dark-2">
      <div aria-hidden className="absolute -top-32 right-0 h-[520px] w-[520px] rounded-full bg-ember/10 blur-3xl" />

      <div className="container relative py-[clamp(72px,12vw,160px)]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger(0.12)}
          className="max-w-[860px]"
        >
          <motion.div variants={fadeUp} className="mb-7">
            <SectionMark index="04" label="Para los asesores del grupo" tone="dark" />
          </motion.div>

          <motion.h2
            variants={fadeUpBlur}
            className="font-display text-[clamp(32px,6.6vw,84px)] leading-[0.96] text-paper m-0"
          >
            Tu oficina, abierta <span className="text-ember">las 24 horas.</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-6 md:mt-8 max-w-[560px] text-[15px] md:text-[16px] leading-[1.62] text-paper/65 m-0"
          >
            Si trabajás con un código del grupo, la plataforma es para vos. No cambia tu forma de trabajar: cambia todo
            lo que dejás de hacer a mano.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger(0.07)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line-dark-2 rounded-2xl md:rounded-3xl overflow-hidden border border-line-dark-2 mt-12 md:mt-16"
        >
          {BENEFICIOS.map(item => (
            <motion.div key={item.title} variants={fadeUp} className="bg-ink-2 p-6 md:p-8">
              <div className="h-[2px] w-8 bg-ember" aria-hidden />
              <h3 className="font-display text-[18px] leading-[1.25] text-paper mt-5 mb-3">{item.title}</h3>
              <p className="text-[13.5px] leading-[1.6] text-paper/60 m-0">{item.body}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          className="mt-12 md:mt-16 flex flex-col gap-6 rounded-2xl md:rounded-3xl border border-line-dark-2 bg-ink-2/60 p-6 md:p-10 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="max-w-[520px]">
            <h3 className="font-display text-[clamp(20px,2.8vw,30px)] leading-[1.15] text-paper m-0">
              Querés la plataforma en tu código?
            </h3>
            <p className="mt-3 text-[14px] leading-[1.6] text-paper/60 m-0">
              Escribinos y coordinamos la conexión de tu número. La configuración la hacemos nosotros.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="mailto:mp_seguros@segurosmp.com?subject=Plataforma%20de%20WhatsApp"
              className="btn-shimmer inline-flex items-center justify-center bg-ember rounded-full px-6 md:px-7 py-[14px] md:py-[15px] font-semibold text-[14px] text-paper transition-[background-color,box-shadow] hover:bg-ember-2 hover:shadow-[0_12px_36px_-8px_rgba(232,168,32,0.55)]"
            >
              mp_seguros@segurosmp.com
            </a>
            <a
              href="tel:+5493412757294"
              className="inline-flex items-center justify-center border border-paper/20 rounded-full px-6 md:px-7 py-[14px] md:py-[15px] font-medium text-[14px] text-paper/85 transition-[border-color,color] hover:border-paper hover:text-paper"
            >
              +54 9 341 275-7294
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
