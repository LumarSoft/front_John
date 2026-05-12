import { IconArrow } from './icons'
import type { Company } from '../types'

const COMPANIES: Company[] = [
  {
    rom: 'i.',
    name: 'Triunfo Seguros',
    founded: 'Fundada 1971',
    rating: 'Rating AA-',
    blurb:
      'Compañía argentina de seguros patrimoniales con presencia nacional. La elegimos para coberturas de movilidad y hogar por sus tiempos de gestión.',
    lines: ['Automotor', 'Motovehículos', 'Bicicletas', 'Hogar'],
  },
  {
    rom: 'ii.',
    name: 'Sancor Seguros',
    founded: 'Fundada 1945',
    rating: 'Rating AA',
    blurb:
      'Una de las cooperativas de seguros más antiguas de Argentina. Operamos con ella las líneas de patrimonio empresarial, vida y responsabilidad profesional.',
    lines: ['Comercio e Industria', 'Personas', 'Praxis', 'Bolso'],
  },
]

export function Companias() {
  return (
    <section id="companias" className="container comp">
      <div className="cot-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="section-num">§ III.</div>
          <h2 className="section-title">
            Compañías <em>representadas.</em>
          </h2>
        </div>
        <p className="section-blurb">
          Operamos con dos compañías de las más sólidas del sistema asegurador argentino. La elección no es casual: cada
          una nos da la mejor relación entre cobertura y servicio para las líneas que trabajamos.
        </p>
      </div>
      <div className="comp-list">
        {COMPANIES.map((c, i) => (
          <div key={i} className="comp-row">
            <div className="comp-roman">{c.rom}</div>
            <div>
              <div className="comp-name">{c.name}</div>
              <div className="comp-meta">
                <span>{c.founded}</span>
                <span>{c.rating}</span>
              </div>
            </div>
            <div className="comp-blurb">{c.blurb}</div>
            <div className="comp-lines">
              <b>Líneas que operamos</b>
              {c.lines.join(' · ')}
            </div>
            <div className="comp-arrow">
              <IconArrow />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
