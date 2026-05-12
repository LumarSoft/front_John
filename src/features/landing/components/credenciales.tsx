import type { ReactNode } from 'react'

interface CredItem {
  n: string
  k: ReactNode
  v: string
}

const ITEMS: CredItem[] = [
  {
    n: 'i.',
    k: (
      <>
        27 <em>años</em>
      </>
    ),
    v: 'Asesorando familias y empresas desde 1998 en Buenos Aires y AMBA.',
  },
  {
    n: 'ii.',
    k: (
      <>
        02 <em>compañías</em>
      </>
    ),
    v: 'Trabajamos con Triunfo y Sancor, ambas con calificación A+.',
  },
  {
    n: 'iii.',
    k: (
      <>
        100<em>%</em>
      </>
    ),
    v: 'Atención directa con el productor. No tercerizamos ningún siniestro.',
  },
  {
    n: 'iv.',
    k: (
      <>
        SSN <em>64.231</em>
      </>
    ),
    v: 'Matrícula vigente ante la Superintendencia de Seguros de la Nación.',
  },
]

export function Credenciales() {
  return (
    <section className="container creds">
      <div className="creds-grid">
        {ITEMS.map((item, i) => (
          <div className="creds-cell" key={i} style={i > 0 ? { paddingLeft: 32 } : {}}>
            <div className="creds-num">{item.n}</div>
            <div className="creds-k serif">{item.k}</div>
            <div className="creds-v">{item.v}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
