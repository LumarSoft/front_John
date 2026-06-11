'use client'

import { Chevron, inputClass, labelClass } from './form-controls'
import { addDaysISO, formatDisplayDate } from '../lib/dates'

interface VigenciaStepProps {
  startDate: string
  minDate: string
  maxDate: string
  endDate: string | null
  onChangeStartDate: (iso: string) => void
  onContinue: () => void
  onBack: () => void
}

export function VigenciaStep({
  startDate,
  minDate,
  maxDate,
  endDate,
  onChangeStartDate,
  onContinue,
  onBack,
}: Readonly<VigenciaStepProps>) {
  const quickOptions = [
    { label: 'Hoy', iso: minDate },
    { label: 'Mañana', iso: addDaysISO(minDate, 1) },
    { label: 'En una semana', iso: addDaysISO(minDate, 7) },
  ].filter(option => option.iso <= maxDate)

  return (
    <div className="flex flex-col">
      <div className="text-[10.5px] tracking-[0.24em] uppercase text-faint font-semibold mb-[6px]">
        Inicio de la cobertura
      </div>
      <h3 className="font-display text-[24px] text-ink m-0 mb-2">¿Desde cuándo te cubrimos?</h3>
      <p className="text-[13px] text-ink-3 leading-[1.65] m-0 mb-6 max-w-[420px]">
        Elegí la fecha en la que querés que empiece la vigencia. La cobertura dura un año y se renueva mes a mes.
      </p>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        {quickOptions.map(option => {
          const selected = option.iso === startDate
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onChangeStartDate(option.iso)}
              className={`py-[8px] px-4 rounded-full text-[12px] font-semibold tracking-[-0.005em] cursor-pointer transition-[background-color,border-color,color] duration-[180ms] ${
                selected
                  ? 'bg-ember text-paper border border-ember'
                  : 'bg-paper text-ink-3 border border-line-2 hover:border-ember hover:text-ember-2'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-[7px] max-w-[280px]">
        <label className={labelClass} htmlFor="coverage-start-date">
          Fecha de inicio
        </label>
        <div className="relative">
          <input
            id="coverage-start-date"
            type="date"
            className={inputClass}
            value={startDate}
            min={minDate}
            max={maxDate}
            onChange={e => onChangeStartDate(e.target.value)}
          />
          <Chevron />
        </div>
      </div>

      {endDate && (
        <p className="text-[12.5px] text-ink-3 leading-[1.6] m-0 mt-4 animate-[step-in_0.35s_ease-out_both]">
          Tu cobertura va a estar vigente hasta el{' '}
          <span className="text-ink font-semibold">{formatDisplayDate(endDate)}</span>.
        </p>
      )}

      <div className="flex items-center gap-5 mt-8 flex-wrap">
        <button
          type="button"
          onClick={onContinue}
          disabled={!startDate}
          className="btn-shimmer inline-flex items-center gap-2 bg-ember text-paper border-none py-[14px] px-6 rounded-full font-semibold text-[13.5px] tracking-[-0.005em] cursor-pointer transition-[background-color,box-shadow,opacity] duration-[180ms] hover:bg-ember-2 hover:shadow-[0_12px_32px_-8px_rgba(232,168,32,0.55)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-[12px] tracking-[-0.005em] font-semibold text-ember-2 hover:text-ember transition-colors duration-[180ms] bg-transparent border-none cursor-pointer"
        >
          ← Volver a coberturas
        </button>
      </div>
    </div>
  )
}
