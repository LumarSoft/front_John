import { IconArrow } from './icons'
import type { Company } from '../types'

const COMPANIES: Company[] = [
  {
    name: 'Triunfo Seguros',
    rating: 'Rating AA-',
    blurb:
      'La elegimos para coberturas de movilidad y hogar. Destacamos sus tiempos de liquidación de siniestros y la solidez de su red de atención en todo el país.',
    lines: ['Automotor', 'Motovehículos', 'Bicicletas', 'Hogar'],
  },
  {
    name: 'Sancor Seguros',
    rating: 'Rating AA',
    blurb:
      'Nuestra opción para patrimonio empresarial, vida y praxis profesional. Cooperativa con respaldo nacional y cobertura a medida para cada actividad.',
    lines: ['Comercio e Industria', 'Personas', 'Praxis', 'Bolso'],
  },
]

export function Companias() {
  return (
    <section id="companias" className="container py-[120px] border-t border-b border-line-2">
      <div className="grid grid-cols-2 gap-16 items-end max-[880px]:grid-cols-1 max-[880px]:gap-6">
        <div>
          <h2 className="font-bold text-[clamp(40px,5.4vw,68px)] leading-[1.02] tracking-[-0.045em] text-cream m-0">
            Las compañías detrás de <em className="not-italic text-amber">tu cobertura.</em>
          </h2>
        </div>
        <p className="text-[15.5px] text-cream-2 leading-[1.6] max-w-[440px] m-0">
          No trabajamos con cualquier compañía — elegimos dos por su solvencia, sus tiempos de respuesta y porque
          conocemos cómo operan cuando hay un siniestro.
        </p>
      </div>
      <div className="mt-16">
        {COMPANIES.map((c, i) => (
          <div
            key={i}
            className="grid grid-cols-[80px_1fr_1.6fr_1fr_60px] gap-12 items-center py-9 border-t border-line-2 last:border-b last:border-line-2 max-[880px]:grid-cols-1 max-[880px]:gap-[18px] max-[880px]:py-8"
          >
            <div>
              <div className="text-[30px] font-bold tracking-[-0.035em] text-cream leading-[1.05]">{c.name}</div>
              <div className="text-[11.5px] text-muted tracking-[0.16em] uppercase mt-[10px]">{c.rating}</div>
            </div>
            <div className="text-[14.5px] text-cream-2 leading-[1.55]">{c.blurb}</div>
            <div className="text-[13.5px] text-cream leading-[1.55] tracking-[-0.005em]">
              <b className="block text-[10.5px] tracking-[0.22em] uppercase text-muted mb-2 font-medium not-italic">
                Líneas que operamos
              </b>
              {c.lines.join(' · ')}
            </div>
            <div className="grid place-items-center text-cream-2">
              <IconArrow />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
