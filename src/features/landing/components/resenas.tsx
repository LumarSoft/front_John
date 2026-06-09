import { SectionMark } from './section-mark'

const REVIEWS = [
  {
    author: 'Adrian Ferreyra',
    text: 'Productor de Seguros con amplia trayectoria en el rubro. La atención de todo el personal es de calidad y profesional. Ante distintos siniestros que tuve los resolvieron rápidamente. Altamente recomendable.',
  },
  {
    author: 'Marcelo Gomez',
    text: 'Más de 20 años es mi productor de seguros.',
  },
  {
    author: 'Trapani Vidrios',
    text: 'Desde hace más de 15 años me siento seguro con John.',
  },
  {
    author: 'Carlos Basso',
    text: 'Muy buena atención.',
  },
  {
    author: 'Hugo Colombo',
    text: 'Esmerada atención y rapidez.',
  },
  {
    author: 'Walter Gazitano',
    text: 'Muy buena atención.',
  },
]

function Stars({ size = 13 }: { size?: number }) {
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 14 14" fill="currentColor" className="text-amber">
          <path d="M7 1l1.545 3.09L12 4.635l-2.5 2.41.59 3.41L7 8.9l-3.09 1.555.59-3.41L2 4.635l3.455-.545L7 1z" />
        </svg>
      ))}
    </div>
  )
}

function Avatar({ name, idx }: { name: string; idx: number }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const palette = [
    'bg-ember text-paper',
    'bg-ink text-paper',
    'bg-amber text-ink',
    'bg-canvas-3 text-ink',
    'bg-ink-2 text-paper',
    'bg-ember-2 text-paper',
  ]
  return (
    <div
      className={`w-[36px] h-[36px] rounded-full flex items-center justify-center text-[11.5px] font-bold shrink-0 ${palette[idx % palette.length]}`}
    >
      {initials}
    </div>
  )
}

function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0" aria-label="Google">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function Resenas() {
  return (
    <section id="resenas" className="relative bg-paper border-t border-line">
      <div className="container py-[clamp(64px,10vw,140px)]">
        <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between mb-10 md:mb-12">
          <div className="max-w-[600px]">
            <div className="mb-5 md:mb-6">
              <SectionMark index="04" label="Reseñas" />
            </div>
            <h2 className="font-display text-[clamp(30px,5.6vw,64px)] leading-[0.98] text-ink m-0">
              Lo que dicen <span className="text-ember-2">quienes ya confían</span> en nosotros.
            </h2>
          </div>

          <div className="flex items-center gap-4 md:gap-5 rounded-2xl md:rounded-3xl bg-canvas-2 border border-line px-5 md:px-6 py-4 md:py-5 shrink-0">
            <GoogleIcon size={20} />
            <div className="flex flex-col gap-[4px]">
              <div className="flex items-center gap-[10px]">
                <span className="font-display text-[30px] md:text-[36px] text-ink leading-none">4.7</span>
                <Stars size={14} />
              </div>
              <span className="text-[10.5px] md:text-[11px] text-faint tracking-[0.02em]">Reseñas de Google</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className="group relative bg-canvas-2 border border-line rounded-2xl md:rounded-3xl p-6 md:p-7 flex flex-col hover:border-ember/30 hover:bg-canvas transition-[border-color,background-color] duration-[250ms]"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <svg
                  width="26"
                  height="20"
                  viewBox="0 0 32 26"
                  fill="currentColor"
                  className="text-ember/40 shrink-0 mt-[2px] group-hover:text-ember/70 transition-colors duration-[250ms]"
                  aria-hidden="true"
                >
                  <path d="M0 26V14.4C0 9.6 1.6 5.8 4.8 3 8 1 12 0 16.8 0v5c-3.2 0-5.6.8-7.2 2.4C8 9 7.2 11.2 7.2 14H13V26H0zm18.4 0V14.4C18.4 9.6 20 5.8 23.2 3c3.2-2 7.2-3 12-3v5c-3.2 0-5.6.8-7.2 2.4-1.6 1.6-2.4 3.8-2.4 6.6H32V26H18.4z" />
                </svg>
                <Stars />
              </div>

              <p className="text-[14.5px] font-medium text-ink leading-[1.6] tracking-[-0.005em] m-0 flex-1 mb-6">
                {r.text}
              </p>

              <div className="flex items-center gap-3 pt-5 border-t border-line">
                <Avatar name={r.author} idx={i} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-ink tracking-[-0.01em] truncate">{r.author}</div>
                  <div className="text-[11px] text-faint mt-[2px]">Cliente verificado</div>
                </div>
                <GoogleIcon size={15} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
