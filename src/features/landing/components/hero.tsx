'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeUp, fadeUpBlur, stagger } from '@/src/lib/motion'

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-ink text-paper hero-grain h-[100svh] min-h-[600px] md:h-screen md:min-h-[720px]">
      <div className="absolute inset-0">
        <video
          className="hero-video h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden
        >
          <source src="/chicamanejando.mp4" type="video/mp4" />
        </video>

        {/* Dark grade — anchors the video into the brand ink + lets gold pop */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(15,12,8,0.45) 0%, rgba(15,12,8,0.18) 35%, rgba(10,8,5,0.32) 70%, rgba(8,6,4,0.88) 100%)',
            mixBlendMode: 'multiply',
          }}
        />
        {/* Champagne gold highlight wash */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 35% at 28% 32%, rgba(212,160,74,0.20) 0%, transparent 60%), radial-gradient(70% 50% at 82% 72%, rgba(232,168,32,0.12) 0%, transparent 65%)',
            mixBlendMode: 'screen',
          }}
        />
        <div aria-hidden className="absolute inset-0 hero-vignette" />
      </div>

      {/* Bottom content card — Monarch style */}
      <div className="absolute inset-x-0 bottom-0 px-4 pb-[max(20px,env(safe-area-inset-bottom))] md:px-12 md:pb-14">
        <div className="container px-0">
          <div className="grid grid-cols-12 items-end gap-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger(0.12, 0.35)}
              className="col-span-12 md:col-span-7 lg:col-span-6"
            >
              <div className="relative rounded-[24px] md:rounded-[28px] bg-paper/95 backdrop-blur-xl p-5 sm:p-6 md:p-9 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45),0_0_0_1px_rgba(15,13,10,0.06)]">
                <motion.h1
                  variants={fadeUpBlur}
                  className="font-display text-[clamp(28px,7.2vw,60px)] leading-[0.98] text-ink m-0"
                >
                  Tu <span className="text-ember-2">tranquilidad</span>,
                  <br />
                  más cerca que nunca.
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="mt-4 md:mt-6 max-w-[440px] text-[14px] md:text-[15px] leading-[1.6] text-ink-3"
                >
                  Sabemos el valor que tienen tus cosas. Por eso te acompañamos de cerca: desde una cotización rápida
                  hoy mismo, hasta la resolución total si tenés un problema.
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  className="mt-5 md:mt-7 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3"
                >
                  <Link
                    href="/coberturas"
                    className="btn-shimmer group inline-flex items-center justify-center gap-2 rounded-full bg-ember px-6 py-[13px] md:py-[14px] text-[13.5px] font-semibold tracking-[-0.005em] text-paper transition-[background-color,box-shadow] hover:bg-ember-2 hover:shadow-[0_12px_32px_-8px_rgba(232,168,32,0.55)]"
                  >
                    Cotizar mi seguro
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="transition-transform group-hover:translate-x-[3px]"
                    >
                      <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <a
                    href="#carta"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-line-2 px-6 py-[13px] md:py-[14px] text-[13.5px] font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink"
                  >
                    Conocenos
                  </a>
                </motion.div>

                {/* Inline social proof — mobile only, baked into the card */}
                <motion.div
                  variants={fadeUp}
                  className="md:hidden mt-5 pt-5 border-t border-line flex items-center gap-3"
                >
                  <div className="flex -space-x-2 shrink-0">
                    {['AF', 'MG', 'TV'].map((i, idx) => (
                      <div
                        key={i}
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[9.5px] font-bold ring-2 ring-paper ${
                          idx === 0 ? 'bg-ember text-paper' : idx === 1 ? 'bg-canvas-3 text-ink' : 'bg-ink text-paper'
                        }`}
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-[3px]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={`m-star-${i}`}
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="currentColor"
                        className="text-amber"
                      >
                        <path d="M6 0l1.85 3.75L12 4.3l-3 2.9.71 4.1L6 9.4l-3.71 1.9L3 7.2 0 4.3l4.15-.55L6 0z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-[11.5px] text-ink-3">
                    <span className="font-semibold text-ink">4.7</span> · +1.500 asegurados
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right floating stat capsule — desktop only */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              className="hidden md:flex col-span-12 md:col-span-5 lg:col-span-6 md:justify-end"
            >
              <div className="flex items-center gap-5 rounded-2xl bg-paper/12 backdrop-blur-xl border border-paper/15 px-5 py-4">
                <div className="flex -space-x-2">
                  {['AF', 'MG', 'TV'].map((i, idx) => (
                    <div
                      key={i}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold ring-2 ring-ink/30 ${
                        idx === 0 ? 'bg-ember text-paper' : idx === 1 ? 'bg-canvas text-ink' : 'bg-ink-2 text-paper'
                      }`}
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-1 text-paper">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={`star-${i}`}
                        width="11"
                        height="11"
                        viewBox="0 0 12 12"
                        fill="currentColor"
                        className="text-amber"
                      >
                        <path d="M6 0l1.85 3.75L12 4.3l-3 2.9.71 4.1L6 9.4l-3.71 1.9L3 7.2 0 4.3l4.15-.55L6 0z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-[12.5px] font-semibold">4.7</span>
                  </div>
                  <div className="text-[10.5px] uppercase tracking-[0.18em] text-paper/70 mt-[3px]">
                    Reseñas de Google
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-paper/55"
      >
        <span className="block h-[1px] w-6 bg-paper/40" />
        Mirá más
      </motion.div>
    </section>
  )
}
