interface Step {
  n: string
  title: string
  desc: string
}

const STEPS: Step[] = [
  {
    n: '01',
    title: 'Cotizás',
    desc: 'Completás el formulario con los datos del bien a asegurar. Recibís una cotización detallada ese mismo día hábil.',
  },
  {
    n: '02',
    title: 'Elegís tu cobertura',
    desc: 'Te explicamos cada opción sin tecnicismos y encontramos juntos la cobertura que se adapta a tu situación y presupuesto.',
  },
  {
    n: '03',
    title: 'Quedás cubierto',
    desc: 'Emitimos la póliza al instante. Toda la documentación en regla desde el primer día, sin trámites innecesarios.',
  },
  {
    n: '04',
    title: 'Te acompañamos siempre',
    desc: 'Si ocurre un siniestro, lo gestionamos nosotros de principio a fin. Sin derivaciones, sin demoras, sin sorpresas.',
  },
]

export function Carta() {
  return (
    <section className="paper">
      <div className="container py-[120px]">
        <div className="grid grid-cols-2 gap-16 items-end mb-16 max-[880px]:grid-cols-1 max-[880px]:gap-6">
          <div>
            <h2 className="font-bold text-[clamp(40px,5.4vw,68px)] leading-[1.02] tracking-[-0.045em] text-paper-ink m-0">
              Así es cómo <em className="not-italic text-amber-2">trabajamos.</em>
            </h2>
          </div>
          <p className="text-[15.5px] text-paper-ink leading-[1.6] max-w-[440px] m-0 opacity-70">
            Cuatro pasos, un solo interlocutor. Desde que consultás hasta que resolvemos el último trámite — siempre con
            la misma persona al teléfono.
          </p>
        </div>

        <div className="grid grid-cols-4 border-t border-l border-line-paper max-[880px]:grid-cols-2 max-[480px]:grid-cols-1">
          {STEPS.map(step => (
            <div key={step.n} className="border-r border-b border-line-paper p-9 flex flex-col gap-5 max-[880px]:p-7">
              <div className="text-[11px] tracking-[0.3em] uppercase text-amber-2 font-semibold">{step.n}.</div>
              <div>
                <div className="text-[20px] font-bold tracking-[-0.03em] text-paper-ink mb-3 leading-[1.15]">
                  {step.title}
                </div>
                <div className="text-[14px] leading-[1.65] text-paper-ink opacity-65">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
