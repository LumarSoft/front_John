'use client'

import type { CotizarVehiculoResponse } from '@/src/types/api/cotizador'
import { buildCoverageCards, formatARS, type CoverageCard } from '../lib/coverages'

const Check = () => (
  <svg
    className="shrink-0 mt-[3px]"
    width="13"
    height="13"
    viewBox="0 0 14 14"
    fill="none"
    stroke="var(--color-ember)"
    strokeWidth="2"
  >
    <path d="M2.5 7.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

interface CotizacionResultadosProps {
  result: CotizarVehiculoResponse
  onSelect: (card: CoverageCard) => void
  onReset: () => void
}

export function CotizacionResultados({ result, onSelect, onReset }: Readonly<CotizacionResultadosProps>) {
  const cards = buildCoverageCards(result.coverages)

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <h3 className="font-display text-[26px] text-ink m-0">No encontramos coberturas disponibles</h3>
        <p className="text-[14px] text-ink-3 leading-[1.65] max-w-[380px]">
          No pudimos cotizar este vehículo de forma online. Escribinos y lo cotizamos manualmente a la brevedad.
        </p>
        {result.messages.length > 0 && (
          <p className="text-[12px] text-faint leading-[1.5] max-w-[380px] m-0">{result.messages.join(' · ')}</p>
        )}
        <button
          onClick={onReset}
          className="text-[12px] tracking-[-0.005em] font-semibold text-ember-2 hover:text-ember transition-colors duration-[180ms] bg-transparent border-none cursor-pointer"
        >
          ← Intentar con otro vehículo
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="text-center">
        <h3 className="font-display text-[26px] text-ink m-0 mb-2">Elegí tu cobertura</h3>
        <p className="text-[13px] text-faint tracking-[0.02em]">
          {result.quoteNumber && (
            <>
              Presupuesto Nro. <span className="text-ink font-semibold">{result.quoteNumber}</span>
            </>
          )}
          {result.quoteNumber && result.validUntil && ' · '}
          {result.validUntil && <>Válido hasta el {result.validUntil}</>}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-[14px] items-stretch max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
        {cards.map((card, i) => (
          <div
            key={card.code}
            style={{ animationDelay: `${i * 80}ms` }}
            className={`relative flex flex-col gap-4 rounded-2xl border p-5 bg-paper transition-[border-color,box-shadow,transform] duration-[220ms] hover:-translate-y-[3px] animate-[step-in_0.5s_cubic-bezier(0.22,1,0.36,1)_both] ${
              card.tier.highlighted
                ? 'border-ember shadow-[0_12px_32px_-12px_rgba(232,168,32,0.35)] hover:shadow-[0_18px_40px_-12px_rgba(232,168,32,0.45)]'
                : 'border-line-2 hover:border-line-strong hover:shadow-[0_14px_32px_-16px_rgba(15,13,10,0.25)]'
            }`}
          >
            {card.tier.highlighted && (
              <span className="absolute -top-[10px] left-1/2 -translate-x-1/2 bg-ember text-paper text-[9.5px] tracking-[0.18em] uppercase font-semibold px-3 py-[3px] rounded-full whitespace-nowrap">
                Recomendada
              </span>
            )}

            <div>
              <div className="text-[10.5px] tracking-[0.2em] uppercase text-faint font-semibold mb-1">
                Cobertura {card.code}
              </div>
              <div className="font-display text-[18px] text-ink leading-tight">{card.tier.name}</div>
              {card.tier.tagline && <div className="text-[12px] text-ink-3 mt-1 leading-snug">{card.tier.tagline}</div>}
            </div>

            <div>
              <div className="font-display text-[24px] text-ink leading-none">{formatARS(card.displayPrice)}</div>
              <div className="text-[11px] text-faint mt-[6px] tracking-[0.02em]">Premio contado</div>
            </div>

            {card.paymentOptions.length > 1 && (
              <ul className="flex flex-col gap-[5px] m-0 p-0 list-none border-t border-line pt-3">
                {card.paymentOptions.map(p => (
                  <li key={p.code} className="flex items-baseline justify-between gap-2 text-[11.5px]">
                    <span className="text-faint">{p.name}</span>
                    <span className="text-ink-3 font-semibold whitespace-nowrap">{formatARS(p.premium)}</span>
                  </li>
                ))}
              </ul>
            )}

            {card.tier.benefits.length > 0 && (
              <ul className="flex flex-col gap-[7px] m-0 p-0 list-none border-t border-line pt-3">
                {card.tier.benefits.map(benefit => (
                  <li key={benefit} className="flex items-start gap-2 text-[12px] text-ink-3 leading-snug">
                    <Check />
                    {benefit}
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={() => onSelect(card)}
              className={`mt-auto w-full py-[11px] rounded-full text-[12.5px] font-semibold tracking-[-0.005em] cursor-pointer transition-[background-color,border-color,color,box-shadow] duration-[180ms] ${
                card.tier.highlighted
                  ? 'bg-ember text-paper border-none hover:bg-ember-2 hover:shadow-[0_10px_24px_-8px_rgba(232,168,32,0.55)]'
                  : 'bg-transparent text-ink border border-line-strong hover:border-ember hover:text-ember-2'
              }`}
            >
              Elegir esta cobertura
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-[13px] text-ink-3 leading-[1.65] max-w-[440px] m-0">
          Elegí una cobertura para definir el inicio de vigencia y completar tus datos.
        </p>
        <button
          onClick={onReset}
          className="text-[12px] tracking-[-0.005em] font-semibold text-ember-2 hover:text-ember transition-colors duration-[180ms] bg-transparent border-none cursor-pointer"
        >
          Nueva cotización →
        </button>
      </div>
    </div>
  )
}
