'use client'

import { motion } from 'framer-motion'
import { fadeUp, fadeUpBlur, stagger, viewport } from '@/src/lib/motion'
import { SectionMark } from '@/src/features/landing/components/section-mark'
import { PROVEEDOR, PRIVACIDAD_ACTUALIZADA } from '../data/proveedor'

interface Bloque {
  id: string
  titulo: string
  parrafos?: string[]
  items?: { termino: string; detalle: string }[]
  lista?: string[]
}

const BLOQUES: Bloque[] = [
  {
    id: 'responsable',
    titulo: '1. Quién es responsable de tus datos',
    parrafos: [
      `El responsable del tratamiento es ${PROVEEDOR.razonSocial}, CUIT ${PROVEEDOR.cuit}, con domicilio en ${PROVEEDOR.domicilio}. Organización de seguros inscripta ante la Superintendencia de Seguros de la Nación bajo la ${PROVEEDOR.matricula}.`,
      `Para cualquier consulta sobre esta política o sobre tus datos personales podés escribirnos a ${PROVEEDOR.email} o llamarnos al ${PROVEEDOR.telefono}.`,
    ],
  },
  {
    id: 'datos',
    titulo: '2. Qué datos tratamos',
    parrafos: ['Según cómo interactúes con nosotros, podemos tratar las siguientes categorías de datos:'],
    items: [
      {
        termino: 'Datos de contacto de WhatsApp',
        detalle:
          'Tu número de teléfono y el nombre que tenés configurado en tu perfil de WhatsApp, cuando nos escribís a nuestro número de atención.',
      },
      {
        termino: 'Contenido de las conversaciones',
        detalle:
          'Los mensajes que intercambiás con nuestro asistente automático o con un asesor, incluyendo las imágenes y documentos que nos envíes.',
      },
      {
        termino: 'Datos identificatorios',
        detalle:
          'Nombre, apellido, DNI, correo electrónico y localidad, cuando nos los proporcionás para que podamos identificarte como asegurado.',
      },
      {
        termino: 'Datos de tu cobertura',
        detalle:
          'Pólizas, vehículos, bienes asegurados, cuotas, vencimientos y siniestros. Provienen de las compañías aseguradoras con las que operás a través nuestro.',
      },
      {
        termino: 'Datos de cotización',
        detalle:
          'La información que cargás para pedir un presupuesto: datos del vehículo o del bien, tu localidad y tus datos de contacto.',
      },
      {
        termino: 'Datos de navegación',
        detalle:
          'Información técnica básica de tu visita al sitio, necesaria para que funcione correctamente y para mantenerlo seguro.',
      },
    ],
  },
  {
    id: 'finalidad',
    titulo: '3. Para qué los usamos',
    lista: [
      'Responder tus consultas por WhatsApp, de forma automática o a través de un asesor.',
      'Identificarte como asegurado y darte información sobre tus pólizas, cuotas y siniestros.',
      'Elaborar y enviarte cotizaciones cuando nos las pedís.',
      'Gestionar la denuncia y el seguimiento de un siniestro ante la compañía.',
      'Dejar registro de la conversación para que cualquier asesor del equipo pueda continuarla sin que tengas que repetir todo.',
      'Cumplir con las obligaciones que nos impone la normativa de seguros.',
    ],
  },
  {
    id: 'base-legal',
    titulo: '4. Con qué fundamento',
    parrafos: [
      'Tratamos tus datos con tu consentimiento, que prestás al escribirnos o al completar un formulario, y para poder ejecutar la relación de intermediación de seguros que nos vincula, en los términos de la Ley 25.326 de Protección de los Datos Personales.',
      'Podés retirar tu consentimiento en cualquier momento. Hacerlo puede impedirnos seguir prestándote el servicio.',
    ],
  },
  {
    id: 'terceros',
    titulo: '5. Con quién los compartimos',
    parrafos: [
      'No vendemos ni cedemos tus datos. Los compartimos únicamente con quienes necesitamos para poder prestarte el servicio:',
    ],
    items: [
      {
        termino: 'Compañías aseguradoras',
        detalle:
          'Los datos necesarios para cotizar, emitir una póliza o gestionar un siniestro se transmiten a la aseguradora correspondiente, que los trata bajo su propia política de privacidad.',
      },
      {
        termino: 'Meta Platforms',
        detalle:
          'Los mensajes de WhatsApp se transmiten a través de la plataforma de Meta, que actúa como proveedor del canal. Su tratamiento se rige además por las políticas de privacidad de WhatsApp y de Meta.',
      },
      {
        termino: 'Proveedor de inteligencia artificial',
        detalle:
          'Para redactar las respuestas del asistente enviamos el texto de la conversación a un proveedor de modelos de lenguaje. Ese proveedor no utiliza esta información para entrenar sus modelos.',
      },
      {
        termino: 'Proveedor de infraestructura',
        detalle:
          'Nuestros servidores y bases de datos están alojados en un proveedor de hosting que actúa como encargado del tratamiento y no puede usar los datos para fines propios.',
      },
      {
        termino: 'Autoridades',
        detalle: 'Cuando exista una obligación legal o un requerimiento judicial que nos obligue a hacerlo.',
      },
    ],
  },
  {
    id: 'no-hacemos',
    titulo: '6. Qué no hacemos',
    lista: [
      'No vendemos tus datos a terceros ni los cedemos con fines comerciales.',
      'No los usamos para publicidad ni para segmentación de audiencias.',
      'No cruzamos los datos de una productora con los de otra: cada una tiene su propio espacio dentro de la plataforma y no puede acceder al de las demás.',
      'No te escribimos por WhatsApp si vos no nos escribiste primero o no nos diste tus datos para que te contactemos.',
    ],
  },
  {
    id: 'conservacion',
    titulo: '7. Cuánto tiempo los conservamos',
    parrafos: [
      'Conservamos tus datos mientras dure la relación comercial y, después, durante el plazo en que puedan resultar necesarios para atender reclamos o cumplir obligaciones legales, contables y regulatorias del rubro asegurador.',
      'Las conversaciones de WhatsApp se conservan mientras sean útiles para darte seguimiento. Podés pedirnos su eliminación cuando quieras.',
    ],
  },
  {
    id: 'seguridad',
    titulo: '8. Cómo los protegemos',
    parrafos: [
      'Aplicamos medidas técnicas y organizativas razonables para resguardar tus datos: las comunicaciones con nuestro sitio y con nuestra plataforma viajan cifradas, el acceso al panel de administración requiere credenciales personales, y cada usuario interno accede únicamente a la información que le corresponde por su rol y por los códigos de productor que tiene asignados.',
      'Ningún sistema es infalible. Si detectáramos un incidente de seguridad que afecte tus datos personales, actuaremos conforme a la normativa vigente.',
    ],
  },
  {
    id: 'derechos',
    titulo: '9. Tus derechos',
    parrafos: [
      `Podés solicitar el acceso, la rectificación, la actualización y la supresión de tus datos personales escribiendo a ${PROVEEDOR.email}. Vamos a pedirte que acredites tu identidad antes de responder.`,
      'EL TITULAR DE LOS DATOS PERSONALES TIENE LA FACULTAD DE EJERCER EL DERECHO DE ACCESO A LOS MISMOS EN FORMA GRATUITA A INTERVALOS NO INFERIORES A SEIS MESES, SALVO QUE SE ACREDITE UN INTERÉS LEGÍTIMO AL EFECTO, CONFORME LO ESTABLECIDO EN EL ARTÍCULO 14, INCISO 3 DE LA LEY Nº 25.326.',
      'LA AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, EN SU CARÁCTER DE ÓRGANO DE CONTROL DE LA LEY Nº 25.326, TIENE LA ATRIBUCIÓN DE ATENDER LAS DENUNCIAS Y RECLAMOS QUE INTERPONGAN QUIENES RESULTEN AFECTADOS EN SUS DERECHOS POR INCUMPLIMIENTO DE LAS NORMAS VIGENTES EN MATERIA DE PROTECCIÓN DE DATOS PERSONALES.',
    ],
  },
  {
    id: 'cambios',
    titulo: '10. Cambios en esta política',
    parrafos: [
      'Podemos actualizar esta política cuando cambien nuestros servicios o la normativa aplicable. La versión vigente es siempre la publicada en esta página, con su fecha de última actualización.',
    ],
  },
]

export function PrivacidadPage() {
  return (
    <>
      <section className="relative bg-ink text-paper overflow-hidden">
        <div aria-hidden className="absolute -top-40 -left-24 h-[520px] w-[520px] rounded-full bg-ember/10 blur-3xl" />
        <div className="container relative pt-[clamp(120px,16vw,180px)] pb-[clamp(48px,8vw,96px)]">
          <motion.div initial="hidden" animate="visible" variants={stagger(0.11)} className="max-w-[720px]">
            <motion.div variants={fadeUp} className="mb-7">
              <SectionMark index="—" label="Legales" tone="dark" />
            </motion.div>
            <motion.h1
              variants={fadeUpBlur}
              className="font-display text-[clamp(34px,7vw,80px)] leading-[0.96] text-paper m-0"
            >
              Política de <span className="text-ember">privacidad.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-[15px] leading-[1.62] text-paper/65 m-0">
              Qué datos tuyos tratamos, para qué los usamos y cómo podés pedirnos que los eliminemos. Escrito para que
              se entienda, sin letra chica.
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="mt-6 text-[11px] uppercase tracking-[0.22em] text-paper/45 font-semibold m-0"
            >
              Última actualización · {PRIVACIDAD_ACTUALIZADA}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="bg-canvas grain border-t border-line">
        <div className="container py-[clamp(56px,9vw,120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* índice */}
            <nav aria-label="Índice" className="lg:col-span-3">
              <div className="lg:sticky lg:top-28">
                <div className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-faint mb-4">
                  En esta página
                </div>
                <ol className="flex flex-col gap-[6px] list-none p-0 m-0">
                  {BLOQUES.map(b => (
                    <li key={b.id}>
                      <a
                        href={`#${b.id}`}
                        className="block text-[12.5px] leading-[1.45] text-ink-3 transition-colors hover:text-ember-2"
                      >
                        {b.titulo}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={stagger(0.06)}
              className="lg:col-span-9 flex flex-col gap-4 md:gap-5"
            >
              {BLOQUES.map(bloque => (
                <motion.article
                  key={bloque.id}
                  id={bloque.id}
                  variants={fadeUp}
                  className="scroll-mt-28 rounded-2xl md:rounded-3xl border border-line bg-paper p-6 md:p-9"
                >
                  <h2 className="font-display text-[clamp(19px,2.4vw,26px)] leading-[1.2] text-ink mt-0 mb-4">
                    {bloque.titulo}
                  </h2>

                  {bloque.parrafos?.map(p => (
                    <p key={p.slice(0, 40)} className="text-[14px] leading-[1.7] text-ink-3 mt-0 mb-4 last:mb-0">
                      {p}
                    </p>
                  ))}

                  {bloque.items && (
                    <dl className="mt-5 flex flex-col gap-4 m-0">
                      {bloque.items.map(item => (
                        <div key={item.termino} className="border-l-2 border-ember/40 pl-4">
                          <dt className="font-display text-[14.5px] leading-[1.3] text-ink">{item.termino}</dt>
                          <dd className="m-0 mt-[6px] text-[13.5px] leading-[1.6] text-ink-3">{item.detalle}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {bloque.lista && (
                    <ul className="mt-2 flex flex-col gap-[10px] list-none p-0 m-0">
                      {bloque.lista.map(li => (
                        <li key={li} className="flex gap-3 text-[13.5px] leading-[1.6] text-ink-3">
                          <span className="mt-[8px] h-[5px] w-[5px] shrink-0 rounded-full bg-ember" aria-hidden />
                          {li}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.article>
              ))}

              <motion.div
                variants={fadeUp}
                className="rounded-2xl md:rounded-3xl border border-line-2 bg-canvas-2 p-6 md:p-9"
              >
                <h2 className="font-display text-[clamp(19px,2.4vw,26px)] leading-[1.2] text-ink mt-0 mb-4">
                  Contacto
                </h2>
                <p className="text-[14px] leading-[1.7] text-ink-3 mt-0 mb-5">
                  Para ejercer tus derechos o hacernos cualquier consulta sobre esta política:
                </p>
                <div className="flex flex-col gap-2 text-[14px]">
                  <a
                    href={`mailto:${PROVEEDOR.email}`}
                    className="font-semibold text-ink transition-colors hover:text-ember-2"
                  >
                    {PROVEEDOR.email}
                  </a>
                  <a href={PROVEEDOR.telefonoHref} className="text-ink-3 transition-colors hover:text-ember-2">
                    {PROVEEDOR.telefono}
                  </a>
                  <span className="text-ink-3">{PROVEEDOR.domicilio}</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
