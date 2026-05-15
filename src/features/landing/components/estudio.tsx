export function Estudio() {
  return (
    <section id="estudio" className="border-t border-line-2">
      <div className="container py-[120px]">
        <div className="grid grid-cols-2 gap-16 items-start max-[880px]:grid-cols-1 max-[880px]:gap-10">
          <div>
            <div className="text-[11px] tracking-[0.32em] uppercase text-amber font-medium mb-7">Dónde estamos</div>
            <h2 className="font-bold text-[clamp(36px,4.8vw,60px)] leading-[1.02] tracking-[-0.045em] text-cream m-0 mb-10">
              Visitanos en <em className="not-italic text-amber">Rosario.</em>
            </h2>

            <div className="flex flex-col gap-8">
              <div>
                <div className="text-[10px] tracking-[0.24em] uppercase text-muted font-medium mb-[10px]">
                  Dirección
                </div>
                <div className="text-[17px] text-cream font-semibold tracking-[-0.02em]">Blvd. 27 de Febrero 275</div>
                <div className="text-[14px] text-cream-2 mt-1">Rosario, Santa Fe, Argentina</div>
              </div>

              <div>
                <div className="text-[10px] tracking-[0.24em] uppercase text-muted font-medium mb-[10px]">
                  Horario de atención
                </div>
                <div className="text-[17px] text-cream font-semibold tracking-[-0.02em]">
                  Lunes a viernes · 9 a 18 hs
                </div>
                <div className="text-[14px] text-cream-2 mt-1">
                  Siniestros: <span className="text-amber font-medium">atención 24 hs</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] tracking-[0.24em] uppercase text-muted font-medium mb-[10px]">
                  Contacto directo
                </div>
                <div className="flex flex-col gap-[6px]">
                  <a
                    href="tel:+541148150099"
                    className="text-[17px] text-cream font-semibold tracking-[-0.02em] hover:text-amber transition-colors"
                  >
                    +54 11 4815-0099
                  </a>
                  <a
                    href="https://wa.me/5491162341198"
                    className="text-[14px] text-cream-2 hover:text-amber transition-colors"
                  >
                    WhatsApp · +54 9 11 6234-1198
                  </a>
                  <a
                    href="mailto:hola@jpellegrini.ar"
                    className="text-[14px] text-cream-2 hover:text-amber transition-colors"
                  >
                    hola@jpellegrini.ar
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-line-2 h-[440px] max-[880px]:h-[300px]">
            <iframe
              src="https://maps.google.com/maps?q=Boulevard+27+de+Febrero+275,+Rosario,+Santa+Fe,+Argentina&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación del estudio John Pellegrini & Asoc."
            />
          </div>
        </div>
      </div>
    </section>
  )
}
