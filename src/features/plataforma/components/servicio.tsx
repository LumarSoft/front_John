'use client'

import { motion } from 'framer-motion'
import { fadeUp, stagger, viewport } from '@/src/lib/motion'
import { SectionMark } from '@/src/features/landing/components/section-mark'

const PILARES = [
  {
    id: '01',
    title: 'Asistente de WhatsApp',
    lead: 'Atiende el número de la productora las 24 horas.',
    items: [
      'Identifica al asegurado por DNI y le responde con sus datos reales',
      'Consulta pólizas, cuotas, vencimientos y estado de siniestros',
      'Cotiza auto y moto dentro de la misma conversación',
      'Recibe fotos y documentación para denunciar un siniestro',
      'Deriva a un asesor cuando la consulta lo amerita',
    ],
  },
  {
    id: '02',
    title: 'Base de datos de cartera',
    lead: 'La cartera de la compañía, sincronizada sola.',
    items: [
      'Sincronización automática dos veces por día con la aseguradora',
      'Clientes, pólizas, vehículos y cuotas siempre al día',
      'Cada registro queda atribuido al código de productor que corresponde',
      'Histórico de novedades y movimientos de cartera',
      'Sin planillas, sin cargar nada a mano',
    ],
  },
  {
    id: '03',
    title: 'Panel de administración',
    lead: 'Todo lo que pasa, en un solo lugar.',
    items: [
      'Bandeja de entrada con todas las conversaciones de WhatsApp',
      'Asegurados, cobranzas, siniestros y solicitudes',
      'Cada asesor ve únicamente los códigos que tiene asignados',
      'Control de consumo y costo por número',
      'Alta de usuarios y de organizaciones desde el mismo panel',
    ],
  },
]

const PASOS = [
  {
    n: '01',
    title: 'El asegurado escribe',
    body: 'Manda un mensaje al WhatsApp de siempre de la productora. No instala nada ni aprende nada nuevo.',
  },
  {
    n: '02',
    title: 'El asistente responde',
    body: 'Lo identifica, busca sus pólizas en la base de datos y le contesta en segundos, a cualquier hora.',
  },
  {
    n: '03',
    title: 'Queda registrado',
    body: 'La conversación entera se guarda en el panel de la productora, con el asegurado ya vinculado a su ficha.',
  },
  {
    n: '04',
    title: 'El asesor toma el control',
    body: 'Cuando hace falta una persona, el asesor entra a la conversación desde el panel y el asistente se hace a un lado.',
  },
]

export function Servicio() {
  return (
    <>
      <section id="servicio" className="bg-canvas grain border-t border-line">
        <div className="container py-[clamp(64px,10vw,140px)]">
          <div className="mb-12 md:mb-16 max-w-[720px]">
            <div className="mb-5 md:mb-6">
              <SectionMark index="01" label="El servicio" />
            </div>
            <h2 className="font-display text-[clamp(28px,5.2vw,56px)] leading-[0.98] text-ink m-0">
              Tres piezas que trabajan <span className="text-ember-2">como una sola.</span>
            </h2>
            <p className="mt-6 text-[15px] md:text-[16px] leading-[1.65] text-ink-3 m-0">
              La plataforma no es un chatbot suelto. Es un asistente conectado a la cartera real de la productora y a un
              panel donde su equipo trabaja todos los días.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={stagger(0.1)}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6"
          >
            {PILARES.map(pilar => (
              <motion.article
                key={pilar.id}
                variants={fadeUp}
                className="flex flex-col bg-paper border border-line rounded-2xl md:rounded-3xl p-6 md:p-8"
              >
                <div className="font-display text-[12px] font-bold text-ember leading-none">{pilar.id}</div>
                <h3 className="font-display text-[22px] md:text-[25px] leading-[1.15] text-ink mt-5 mb-2">
                  {pilar.title}
                </h3>
                <p className="text-[14px] leading-[1.55] text-ink-3 m-0">{pilar.lead}</p>

                <ul className="mt-6 pt-6 border-t border-line flex flex-col gap-3 list-none p-0 m-0">
                  {pilar.items.map(item => (
                    <li key={item} className="flex gap-3 text-[13.5px] leading-[1.5] text-ink-3">
                      <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-ember" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="funciona" className="bg-canvas-2 border-t border-line">
        <div className="container py-[clamp(64px,10vw,140px)]">
          <div className="mb-12 md:mb-16 max-w-[640px]">
            <div className="mb-5 md:mb-6">
              <SectionMark index="02" label="Cómo funciona" />
            </div>
            <h2 className="font-display text-[clamp(28px,5.2vw,56px)] leading-[0.98] text-ink m-0">
              Del mensaje a la ficha del cliente, <span className="text-ember-2">sin escalas.</span>
            </h2>
          </div>

          <motion.ol
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={stagger(0.09)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line-2 rounded-2xl md:rounded-3xl overflow-hidden border border-line-2 list-none p-0 m-0"
          >
            {PASOS.map(paso => (
              <motion.li key={paso.n} variants={fadeUp} className="bg-paper p-6 md:p-8">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ember-soft font-display text-[12px] font-bold text-ember-2">
                  {paso.n}
                </div>
                <h3 className="font-display text-[17px] leading-[1.25] text-ink mt-5 mb-2">{paso.title}</h3>
                <p className="text-[13.5px] leading-[1.55] text-ink-3 m-0">{paso.body}</p>
              </motion.li>
            ))}
          </motion.ol>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
            className="mt-8 md:mt-10 max-w-[720px] text-[14px] leading-[1.65] text-ink-3 m-0"
          >
            El asistente convive con el WhatsApp de siempre: el equipo de la productora sigue escribiendo desde el
            celular cuando quiere, y esos mensajes también quedan registrados en el panel.
          </motion.p>
        </div>
      </section>
    </>
  )
}
