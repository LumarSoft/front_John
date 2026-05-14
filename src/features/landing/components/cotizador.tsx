'use client'

import { useRouter } from 'next/navigation'
import { PRODUCTS } from '../data/products'

export function Cotizador() {
  const router = useRouter()

  return (
    <section id="coberturas" className="container py-[120px] border-b border-line-2">
      <div className="grid grid-cols-2 gap-16 items-end mb-16 max-[880px]:grid-cols-1 max-[880px]:gap-6">
        <div>
          <h2 className="font-bold text-[clamp(40px,5.4vw,68px)] leading-[1.02] tracking-[-0.045em] text-cream m-0">
            Sumario de <em className="not-italic text-amber">coberturas.</em>
          </h2>
        </div>
        <p className="text-[15.5px] text-cream-2 leading-[1.6] max-w-[440px] m-0">
          Ocho líneas de producto, dos compañías de primera línea y un solo interlocutor. Elija el bien o la persona a
          proteger; le respondemos con cotización detallada en el día.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 max-[1080px]:grid-cols-3 max-[720px]:grid-cols-2 max-[420px]:grid-cols-1">
        {PRODUCTS.map(item => {
          const ItemIcon = item.Icon
          return (
            <button
              key={item.id}
              onClick={() => router.push(`/coberturas?coverage=${item.id}`)}
              className="group flex flex-col gap-6 p-7 border border-line-2 bg-ink-2 text-left cursor-pointer transition-[background-color,border-color] duration-200 hover:bg-surface hover:border-amber"
            >
              <div className="text-muted transition-colors duration-200 group-hover:text-amber">
                <ItemIcon size={34} />
              </div>
              <div>
                <div className="text-[17px] font-semibold tracking-[-0.02em] text-cream mb-[6px]">{item.label}</div>
                <div className="text-[12.5px] text-muted leading-[1.5] tracking-[0.01em]">{item.sub}</div>
              </div>
              <div className="mt-auto flex items-center gap-[6px] text-[11.5px] tracking-[0.06em] uppercase font-semibold text-muted transition-colors duration-200 group-hover:text-amber">
                Cotizar
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
