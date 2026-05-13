export function CtaSection() {
  return (
    <section id="contacto" className="container pt-[140px] pb-[60px]">
      <h2 className="font-bold text-[clamp(48px,7.6vw,116px)] leading-[0.98] tracking-[-0.05em] text-cream m-0">
        Cotice su próxima
        <br />
        <em className="not-italic text-amber">póliza</em> con un
        <br />
        productor de <em className="not-italic text-amber">verdad.</em>
      </h2>
      <div className="grid grid-cols-4 gap-8 mt-20 pt-12 border-t border-line-2 max-[760px]:grid-cols-2 max-[760px]:gap-6">
        <div>
          <div className="text-[11px] tracking-[0.24em] uppercase text-muted mb-[10px] font-medium">Teléfono</div>
          <div className="text-[18px] text-cream font-semibold tracking-[-0.025em] leading-[1.35]">
            +54 11 4815-0099
          </div>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.24em] uppercase text-muted mb-[10px] font-medium">WhatsApp</div>
          <div className="text-[18px] text-cream font-semibold tracking-[-0.025em] leading-[1.35]">
            +54 9 11 6234-1198
          </div>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.24em] uppercase text-muted mb-[10px] font-medium">Correo</div>
          <div className="text-[18px] text-cream font-semibold tracking-[-0.025em] leading-[1.35]">
            hola@<em className="not-italic text-amber">jpellegrini</em>.ar
          </div>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.24em] uppercase text-muted mb-[10px] font-medium">Estudio</div>
          <div className="text-[18px] text-cream font-semibold tracking-[-0.025em] leading-[1.35]">
            Blvd. 27 de Febrero 275,
            <br />
            Rosario, Santa Fe
          </div>
        </div>
      </div>
    </section>
  )
}
