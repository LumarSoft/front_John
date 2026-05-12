'use client'

import { PRODUCTS } from '../data/products'
import { useCotizador } from '../hooks/use-cotizador'
import { IconArrow } from './icons'

export function Cotizador() {
  const { activeId, activeProduct, setActiveId } = useCotizador()
  const Icon = activeProduct.Icon

  return (
    <section id="coberturas" className="container cot">
      <div className="cot-head">
        <div>
          <div className="section-num">§ I.</div>
          <h2 className="section-title">
            Sumario de <em>coberturas.</em>
          </h2>
        </div>
        <p className="section-blurb">
          Ocho líneas de producto, dos compañías de primera línea y un solo interlocutor. Elija el bien o la persona a
          proteger; le respondemos con cotización detallada en el día.
        </p>
      </div>

      <div className="cot-body">
        <div className="cot-list">
          {PRODUCTS.map(item => {
            const ItemIcon = item.Icon
            return (
              <div
                key={item.id}
                className={`cot-row ${activeId === item.id ? 'active' : ''}`}
                onClick={() => setActiveId(item.id)}
              >
                <div className="cot-row-num">{item.n}.</div>
                <div className="cot-row-ic">
                  <ItemIcon size={36} />
                </div>
                <div>
                  <div className="cot-row-lbl">{item.label}</div>
                  <div className="cot-row-sub">{item.sub}</div>
                </div>
                <div className="cot-row-arrow">
                  <IconArrow />
                </div>
              </div>
            )
          })}
        </div>

        <aside className="cot-detail">
          <div className="cot-detail-tag">Ficha · {activeProduct.n}</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 20,
              marginBottom: 8,
            }}
          >
            <h3 className="cot-detail-title">{activeProduct.label}</h3>
            <div style={{ color: 'var(--amber)' }}>
              <Icon size={42} />
            </div>
          </div>
          <p className="cot-detail-desc">{activeProduct.desc}</p>
          <div className="cot-detail-cols">
            <div className="cot-detail-col">
              <h4>Incluye</h4>
              <ul>
                {activeProduct.incl.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="cot-detail-col no">
              <h4>No incluye</h4>
              <ul>
                {activeProduct.excl.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="cot-detail-foot">
            <div className="cot-detail-price">
              Prima orientativa
              <b>{activeProduct.price}</b>
            </div>
            <button className="cot-detail-cta">Solicitar cotización →</button>
          </div>
        </aside>
      </div>
    </section>
  )
}
