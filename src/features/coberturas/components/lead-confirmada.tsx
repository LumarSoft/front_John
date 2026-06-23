'use client'

interface LeadConfirmadaProps {
  name: string
  productLabel: string
  planName?: string
  onReset: () => void
}

export function LeadConfirmada({ name, productLabel, planName, onReset }: Readonly<LeadConfirmadaProps>) {
  return (
    <div className="flex flex-col items-start gap-5 py-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ember/15 text-ember">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <h3 className="font-display text-[clamp(22px,3vw,30px)] leading-tight text-ink m-0">
          {name ? `¡Gracias, ${name}!` : '¡Gracias!'}
        </h3>
        <p className="mt-3 max-w-[440px] text-[14.5px] text-ink-3 leading-[1.6]">
          Recibimos tu solicitud de <span className="text-ink font-semibold">{productLabel}</span>
          {planName ? (
            <>
              {' '}
              con el plan <span className="text-ink font-semibold">{planName}</span>
            </>
          ) : null}
          . Un asesor te va a contactar con la propuesta el mismo día hábil (Lun a Vie de 8 a 16 hs).
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 bg-canvas-2 text-ink border border-line py-[12px] px-5 rounded-full font-semibold text-[13px] cursor-pointer transition-colors hover:bg-paper"
      >
        Hacer otra solicitud
      </button>
    </div>
  )
}
