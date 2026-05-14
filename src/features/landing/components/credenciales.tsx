import type { ReactNode } from 'react'

interface CredItem {
  k: ReactNode
  v: string
}

const ITEMS: CredItem[] = [
  {
    k: (
      <>
        52 <em className="not-italic text-amber">años</em>
      </>
    ),
    v: 'Asesorando familias y empresas desde 1974 en Rosario, Santa Fe.',
  },
  {
    k: (
      <>
        En el <em className="not-italic text-amber">día</em>
      </>
    ),
    v: 'Recibís tu cotización detallada el mismo día que consultás, sin excepciones.',
  },
  {
    k: (
      <>
        100<em className="not-italic text-amber">%</em>
      </>
    ),
    v: 'Atención directa con el productor. No tercerizamos ningún siniestro.',
  },
  {
    k: (
      <>
        SSN <em className="not-italic text-amber">64.231</em>
      </>
    ),
    v: 'Matrícula vigente ante la Superintendencia de Seguros de la Nación.',
  },
]

export function Credenciales() {
  return (
    <section className="container">
      <div className="grid grid-cols-4 max-[880px]:grid-cols-2">
        {ITEMS.map((item, i) => (
          <div
            key={i}
            className={`pt-12 pb-12 pr-8 border-r border-b border-line [&:nth-child(4n)]:border-r-0 max-[880px]:[&:nth-child(4n)]:border-r max-[880px]:[&:nth-child(4n)]:border-line max-[880px]:[&:nth-child(2n)]:border-r-0 max-[880px]:pt-9 max-[880px]:pb-9 max-[880px]:pr-6 ${i > 0 ? 'pl-8 max-[880px]:pl-0' : ''}`}
          >
            <div className="font-bold text-[40px] tracking-[-0.045em] text-cream leading-none mb-[14px]">{item.k}</div>
            <div className="text-[12.5px] text-cream-2 tracking-[0.01em] leading-[1.5] max-w-[240px]">{item.v}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
