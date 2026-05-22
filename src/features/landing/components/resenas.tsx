'use client'

import { motion } from 'framer-motion'
import { fadeUp, stagger, viewport } from '@/src/lib/motion'

const REVIEWS = [
  {
    author: 'Adrian Ferreyra',
    date: 'Hace 7 años',
    text: 'Productor de Seguros con amplia trayectoria en el rubro. La atención de todo el personal es de calidad y profesional. Ante distintos siniestros que tuve lo resolvieron rápidamente. Altamente recomendable.',
  },
  {
    author: 'Marcelo Gomez',
    date: 'Hace 2 años',
    text: 'Más de 20 años es mi productor de seguros.',
  },
  {
    author: 'Trapani Vidrios',
    date: 'Hace 4 años',
    text: 'Desde hace más de 15 años me siento seguro con John.',
  },
  {
    author: 'Carlos Basso',
    date: 'Hace 6 años',
    text: 'Muy buena atención.',
  },
  {
    author: 'Hugo Colombo',
    date: 'Hace 7 años',
    text: 'Esmerada atención y rapidez.',
  },
  {
    author: 'Walter Gazitano',
    date: 'Hace 7 años',
    text: 'Muy buena atención.',
  },
]

function Stars() {
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="text-amber">
          <path d="M7 1l1.545 3.09L12 4.635l-2.5 2.41.59 3.41L7 8.9l-3.09 1.555.59-3.41L2 4.635l3.455-.545L7 1z" />
        </svg>
      ))}
    </div>
  )
}

export function Resenas() {
  return (
    <section className="container py-[120px] border-t border-line-2">
      <motion.div
        className="grid grid-cols-2 gap-16 items-end mb-16 max-[880px]:grid-cols-1 max-[880px]:gap-6 max-[880px]:mb-10"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={stagger(0.12)}
      >
        <motion.div variants={fadeUp}>
          <h2 className="font-bold text-[clamp(40px,5.4vw,68px)] leading-[1.02] tracking-[-0.045em] text-cream m-0">
            Lo que dicen <em className="not-italic text-amber">nuestros clientes.</em>
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <span className="font-bold text-[48px] tracking-[-0.04em] text-cream leading-none">4.7</span>
            <Stars />
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-3 gap-5 max-[960px]:grid-cols-2 max-[560px]:grid-cols-1"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={stagger(0.07)}
      >
        {REVIEWS.map((r, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="border border-line-2 rounded-2xl p-7 flex flex-col gap-5 bg-ink-2"
          >
            <Stars />
            <p className="text-[15px] text-cream leading-[1.65] tracking-[-0.01em] m-0 flex-1">
              &ldquo;{r.text}&rdquo;
            </p>
            <div className="pt-5 border-t border-line-2 flex items-center justify-between gap-3">
              <div>
                <div className="text-[13px] font-semibold text-cream tracking-[-0.01em]">{r.author}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0" aria-label="Google">
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
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
