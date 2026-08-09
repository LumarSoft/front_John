'use client'

import { motion } from 'framer-motion'
import { fadeUp, stagger, viewport } from '@/src/lib/motion'
import { SectionMark } from '@/src/features/landing/components/section-mark'
import { PROVEEDOR } from '../data/proveedor'

const DATOS = [
  {
    title: 'Qué datos recibimos',
    body: 'Los mensajes que los asegurados le envían al número de WhatsApp de la productora, el número de teléfono desde el que escriben y el nombre que tienen configurado en su perfil. Nada más.',
  },
  {
    title: 'Para qué los usamos',
    body: 'Únicamente para responder la consulta y dejarla registrada en el panel de esa productora, de modo que su equipo pueda retomar la conversación y darle seguimiento.',
  },
  {
    title: 'Cómo se separan',
    body: 'Cada productora tiene su propio espacio dentro de la plataforma. Ve sus conversaciones y sus asegurados, y ninguna puede acceder a los datos de otra. Dentro de cada productora, cada asesor ve solo los códigos que tiene asignados.',
  },
  {
    title: 'Qué no hacemos',
    body: 'No compartimos ni vendemos los datos a terceros, no los usamos con fines publicitarios ni de segmentación, y no los cruzamos entre productoras. Solo escribimos a quien nos escribió primero.',
  },
]

export function Datos() {
  return (
    <section id="datos" className="bg-canvas-2 grain border-t border-line">
      <div className="container py-[clamp(64px,10vw,140px)]">
        <div className="mb-12 md:mb-16 max-w-[680px]">
          <div className="mb-5 md:mb-6">
            <SectionMark index="05" label="Datos y privacidad" />
          </div>
          <h2 className="font-display text-[clamp(28px,5.2vw,56px)] leading-[0.98] text-ink m-0">
            Los datos son de la productora, <span className="text-ember-2">no nuestros.</span>
          </h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger(0.09)}
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line-2 rounded-2xl md:rounded-3xl overflow-hidden border border-line-2"
        >
          {DATOS.map(item => (
            <motion.div key={item.title} variants={fadeUp} className="bg-paper p-6 md:p-8">
              <h3 className="font-display text-[18px] leading-[1.25] text-ink mt-0 mb-3">{item.title}</h3>
              <p className="text-[13.5px] leading-[1.6] text-ink-3 m-0">{item.body}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          className="mt-6 rounded-2xl border border-line bg-paper p-5 md:p-6"
        >
          <p className="text-[13px] leading-[1.65] text-ink-3 m-0">
            El detalle completo del tratamiento de datos, los plazos de conservación y el canal para solicitar la baja o
            la eliminación de la información están en la{' '}
            <a href="/privacidad" className="font-semibold text-ember-2 underline underline-offset-4">
              política de privacidad
            </a>
            .
          </p>
        </motion.div>

        {/* Datos del proveedor — requeridos por Meta en la verificación del acceso */}
        <div id="proveedor" className="mt-14 md:mt-20 scroll-mt-28">
          <div className="mb-8 md:mb-10 max-w-[680px]">
            <div className="mb-5 md:mb-6">
              <SectionMark index="06" label="El proveedor" />
            </div>
            <h2 className="font-display text-[clamp(24px,4.2vw,44px)] leading-[1.02] text-ink m-0">
              Quién presta el servicio
            </h2>
            <p className="mt-5 text-[14.5px] leading-[1.65] text-ink-3 m-0">
              La plataforma es desarrollada y operada por John Pellegrini Management Group S.R.L., organización de
              seguros con más de cincuenta años de trayectoria y tres sucursales en el Gran Rosario.
            </p>
          </div>

          <motion.dl
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={stagger(0.06)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line-2 rounded-2xl md:rounded-3xl overflow-hidden border border-line-2 m-0"
          >
            <Dato label="Razón social" value={PROVEEDOR.razonSocial} />
            <Dato label="CUIT" value={PROVEEDOR.cuit} />
            <Dato label="Matrícula" value={PROVEEDOR.matricula} />
            <Dato label="Domicilio legal" value={PROVEEDOR.domicilio} />
            <Dato label="Teléfono" value={PROVEEDOR.telefono} href={PROVEEDOR.telefonoHref} />
            <Dato label="Correo electrónico" value={PROVEEDOR.email} href={`mailto:${PROVEEDOR.email}`} />
          </motion.dl>
        </div>
      </div>
    </section>
  )
}

function Dato({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <motion.div variants={fadeUp} className="bg-paper p-5 md:p-7">
      <dt className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-faint">{label}</dt>
      <dd className="m-0 mt-3 font-display text-[15px] leading-[1.4] text-ink">
        {href ? (
          <a href={href} className="transition-colors hover:text-ember-2">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </motion.div>
  )
}
