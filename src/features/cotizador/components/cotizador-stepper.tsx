'use client'

import { Fragment } from 'react'
import type { CotizadorStep } from '../hooks/use-cotizador-flow'

const STEPS: { id: CotizadorStep; label: string }[] = [
  { id: 'vehicle', label: 'Vehículo' },
  { id: 'coverage', label: 'Cobertura' },
  { id: 'startDate', label: 'Vigencia' },
  { id: 'personal', label: 'Tus datos' },
  { id: 'payment', label: 'Pago' },
]

const Check = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M2.5 7.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

interface CotizadorStepperProps {
  current: CotizadorStep
  onStepClick: (step: CotizadorStep) => void
}

export function CotizadorStepper({ current, onStepClick }: Readonly<CotizadorStepperProps>) {
  const currentIndex = STEPS.findIndex(s => s.id === current)
  // 'done' is not a visible step — it renders every step as completed
  const activeIndex = currentIndex === -1 ? STEPS.length : currentIndex

  return (
    <div className="flex items-start w-full max-w-[580px] mx-auto" aria-label="Progreso de la cotización">
      {STEPS.map((step, i) => {
        const completed = i < activeIndex
        const active = i === activeIndex
        const clickable = completed && current !== 'done'

        return (
          <Fragment key={step.id}>
            {i > 0 && (
              <div className="flex-1 h-[2px] mt-[13px] mx-2 rounded-full bg-line-2 overflow-hidden">
                <div
                  className={`h-full bg-ember rounded-full transition-[width] duration-500 ease-out ${
                    i <= activeIndex ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            )}

            <button
              type="button"
              disabled={!clickable}
              onClick={() => onStepClick(step.id)}
              className={`group flex flex-col items-center gap-2 bg-transparent border-none p-0 ${
                clickable ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full border transition-[background-color,border-color,color] duration-300 ${
                  completed
                    ? 'bg-ember border-ember text-paper group-hover:bg-ember-2 group-hover:border-ember-2'
                    : active
                      ? 'bg-paper border-ember text-ember animate-[pulse-ring_1.6s_ease-out_infinite]'
                      : 'bg-paper border-line-2 text-faint'
                }`}
              >
                {completed ? (
                  <Check />
                ) : (
                  <span className={`w-2 h-2 rounded-full ${active ? 'bg-ember' : 'bg-line-2'}`} />
                )}
              </span>
              <span
                className={`text-[10px] tracking-[0.16em] uppercase font-semibold transition-colors duration-300 whitespace-nowrap ${
                  active ? 'text-ink' : completed ? 'text-ink-3 group-hover:text-ember-2' : 'text-faint'
                }`}
              >
                {step.label}
              </span>
            </button>
          </Fragment>
        )
      })}
    </div>
  )
}
