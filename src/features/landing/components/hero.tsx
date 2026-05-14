export function Hero() {
  return (
    <section className="container pt-[60px] pb-[80px] border-b border-line-2">
      <div className="grid grid-cols-[1.15fr_1fr] gap-16 items-start max-[960px]:grid-cols-1 max-[960px]:gap-10">
        <div>
          <div className="text-[11px] tracking-[0.32em] uppercase text-amber mb-7 font-medium">
            Productores Asesores · Rosario, Argentina
          </div>
          <h1 className="font-bold text-[clamp(54px,7.2vw,108px)] leading-[0.98] tracking-[-0.05em] text-cream mb-7 mt-0">
            Coberturas
            <br />
            que <em className="italic text-amber">responden</em>
            <br />
            <span className="text-[0.62em] tracking-[-0.01em]">cuando más importa.</span>
          </h1>
          <p className="text-[17px] text-cream-2 max-w-[520px] leading-[1.6] mb-9 mt-0">
            Asesoramos a personas, familias y empresas en la elección de coberturas patrimoniales. Cotizamos el mismo
            día y acompañamos cada siniestro de principio a fin — sin intermediarios, sin derivaciones.
          </p>
          <div className="flex items-center gap-[14px] pt-7 border-t border-line-2">
            <div>
              <div className="text-[11px] tracking-[0.22em] uppercase text-muted font-medium">
                Un interlocutor para todo
              </div>
              <div className="text-[15px] text-cream tracking-[-0.015em] font-medium">
                John Pellegrini, productor matriculado SSN 64.231.
              </div>
            </div>
          </div>
          <div className="mt-8 border border-line-2 p-6 grid grid-cols-[1fr_1fr_1fr_auto] gap-6 items-center bg-[linear-gradient(180deg,rgba(217,164,65,0.05)_0%,transparent_100%)] max-[720px]:grid-cols-[1fr_1fr] max-[720px]:gap-[18px]">
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-muted mb-2 font-medium">Pólizas activas</div>
              <div className="text-[19px] text-cream tracking-[-0.03em] font-semibold">2.418</div>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-muted mb-2 font-medium">Cotización</div>
              <div className="text-[19px] text-cream tracking-[-0.03em] font-semibold">
                <em className="not-italic text-amber">En el día</em>
              </div>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-muted mb-2 font-medium">Siniestros</div>
              <div className="text-[19px] text-cream tracking-[-0.03em] font-semibold">Los resolvemos nosotros</div>
            </div>
            <button className="bg-cream text-ink border-none px-7 py-[18px] text-[13px] font-bold tracking-[0.06em] uppercase transition-colors hover:bg-amber">
              Cotizar →
            </button>
          </div>
        </div>

        <div>
          <figure className="relative border border-line-2 aspect-[4/5] bg-surface overflow-hidden grid place-items-center m-0 [background-image:repeating-linear-gradient(45deg,rgba(232,223,199,0.02)_0px,rgba(232,223,199,0.02)_12px,transparent_12px,transparent_24px)]">
            <div className="text-[11.5px] text-muted tracking-[0.24em] uppercase text-center leading-[1.7] font-medium">
              [ fotografía editorial ]
              <br />
              cliente · vehículo · familia
            </div>
            <figcaption className="absolute bottom-0 left-0 right-0 bg-[rgba(11,11,12,0.86)] backdrop-blur-[6px] px-[22px] py-[18px] flex justify-between items-end border-t border-line-2 gap-[18px]">
              <span className="text-[13.5px] text-cream leading-[1.45] max-w-[340px] tracking-[-0.005em]">
                &ldquo;Tuvimos granizo en Pilar. En 72 horas estaba la indemnización liquidada.&rdquo;
              </span>
              <span className="text-[10px] tracking-[0.24em] text-amber uppercase font-medium whitespace-nowrap">
                Caso 4781
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
