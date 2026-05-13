'use client'

import { PRODUCTS } from '../data/products'
import { useCotizador } from '../hooks/use-cotizador'
import { IconArrow } from './icons'

export function Cotizador() {
  const { activeId, activeProduct, setActiveId } = useCotizador()
  const Icon = activeProduct.Icon

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

      <div className="grid grid-cols-[1.1fr_1fr] gap-20 items-start max-[980px]:grid-cols-1 max-[980px]:gap-10">
        <div className="border-t border-line-2">
          {PRODUCTS.map(item => {
            const ItemIcon = item.Icon
            const isActive = activeId === item.id
            return (
              <div
                key={item.id}
                className={`group grid grid-cols-[54px_56px_1fr_auto] gap-5 items-center py-[22px] border-b border-line cursor-pointer transition-[background,padding-left] duration-200 ${isActive ? 'pl-2 bg-[linear-gradient(90deg,rgba(217,164,65,0.08),transparent_70%)]' : 'hover:pl-2 hover:bg-[linear-gradient(90deg,rgba(217,164,65,0.04),transparent_60%)]'}`}
                onClick={() => setActiveId(item.id)}
              >
                <div
                  className={`text-[13px] tracking-[0.04em] font-medium tabular-nums ${isActive ? 'text-amber' : 'text-muted'}`}
                >
                  {item.n}.
                </div>
                <div className={`transition-colors ${isActive ? 'text-amber' : 'text-cream-2 group-hover:text-amber'}`}>
                  <ItemIcon size={36} />
                </div>
                <div>
                  <div className="text-[26px] font-semibold tracking-[-0.03em] text-cream">{item.label}</div>
                  <div className="text-[12.5px] text-muted tracking-[0.01em] mt-1">{item.sub}</div>
                </div>
                <div
                  className={`transition-all duration-[250ms] ${isActive ? 'opacity-100 translate-x-0 text-amber' : 'opacity-0 -translate-x-[6px] text-muted group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-amber'}`}
                >
                  <IconArrow />
                </div>
              </div>
            )
          })}
        </div>

        <aside className="sticky top-12 border border-line-2 p-9">
          <div className="text-[10.5px] tracking-[0.32em] uppercase text-amber mb-[18px] font-medium">Ficha</div>
          <div className="flex items-start justify-between gap-5 mb-2">
            <h3 className="font-bold text-[42px] tracking-[-0.045em] leading-[1.02] text-cream m-0">
              {activeProduct.label}
            </h3>
            <div className="text-amber">
              <Icon size={42} />
            </div>
          </div>
          <p className="text-[15px] text-cream-2 leading-[1.6] m-0 mb-7">{activeProduct.desc}</p>
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-line mb-[30px]">
            <div>
              <h4 className="text-[10.5px] tracking-[0.24em] uppercase text-muted mb-[14px] mt-0 font-medium">
                Incluye
              </h4>
              <ul className="m-0 p-0 list-none">
                {activeProduct.incl.map((x, i) => (
                  <li
                    key={i}
                    className="text-[13.5px] text-cream leading-[1.45] py-[6px] flex gap-[10px] items-baseline before:content-[''] before:block before:w-[5px] before:h-[5px] before:bg-amber before:rounded-full before:shrink-0 before:-translate-y-[2px]"
                  >
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10.5px] tracking-[0.24em] uppercase text-muted mb-[14px] mt-0 font-medium">
                No incluye
              </h4>
              <ul className="m-0 p-0 list-none">
                {activeProduct.excl.map((x, i) => (
                  <li
                    key={i}
                    className="text-[13.5px] text-cream leading-[1.45] py-[6px] flex gap-[10px] items-baseline before:content-[''] before:block before:w-[5px] before:h-[5px] before:bg-muted-2 before:rounded-full before:shrink-0 before:-translate-y-[2px]"
                  >
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex justify-between items-center gap-[14px] flex-wrap">
            <div className="text-[11px] text-muted not-italic tracking-[0.18em] uppercase font-medium">
              Prima orientativa
              <b className="block text-cream text-[20px] not-italic tracking-[-0.03em] mt-[6px] font-bold normal-case">
                {activeProduct.price}
              </b>
            </div>
            <button className="bg-amber text-ink border-none py-[14px] px-[22px] text-[12.5px] tracking-[0.06em] uppercase font-bold transition-colors hover:bg-[#e5b450]">
              Solicitar cotización →
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}
