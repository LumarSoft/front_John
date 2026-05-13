export function Carta() {
  return (
    <section id="carta" className="paper">
      <div className="container py-[120px]">
        <div className="grid grid-cols-[0.9fr_1.1fr] gap-20 items-start max-[980px]:grid-cols-1 max-[980px]:gap-12">
          <figure className="aspect-[3/4] bg-paper-2 border border-line-paper-2 relative grid place-items-center overflow-hidden m-0 [background-image:repeating-linear-gradient(45deg,rgba(26,24,18,0.04)_0px,rgba(26,24,18,0.04)_12px,transparent_12px,transparent_24px)]">
            <div className="absolute inset-[14px] border border-line-paper-2" />
            <div className="text-[11.5px] text-paper-ink tracking-[0.24em] uppercase not-italic text-center opacity-60 font-medium leading-[1.7]">
              [ fotografía del productor ]
              <br />
              —<br />
              John Pellegrini
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-[10px] tracking-[0.22em] uppercase text-paper-ink opacity-60">
              <span>Rosario</span>
              <span>2026</span>
            </div>
          </figure>
          <div>
            <h2 className="font-bold text-[clamp(40px,5.4vw,68px)] leading-[1.02] tracking-[-0.045em] text-paper-ink m-0">
              Carta del <em className="not-italic text-amber-2">productor.</em>
            </h2>
            <p className="text-[22px] font-semibold not-italic leading-[1.4] text-paper-ink my-8 border-l-2 border-amber-2 pl-6 tracking-[-0.03em]">
              Más que vender pólizas, construimos relaciones de largo plazo. Cada cliente tiene un único interlocutor, y
              ese interlocutor conoce su patrimonio como propio.
            </p>
            <div className="carta-dropcap columns-2 gap-8 text-[15px] leading-[1.65] text-paper-ink max-[720px]:columns-1">
              <p className="mb-4 mt-0">
                John Pellegrini Management Group nació en 1974 como un estudio familiar de productores de seguros. Cinco
                décadas después seguimos operando bajo la misma idea: la cobertura adecuada no se compra online en cinco
                minutos, se diseña a medida y se acompaña en el tiempo.
              </p>
              <p className="mb-4 mt-0">
                Trabajamos exclusivamente con compañías de primera línea y acompañamos cada siniestro de principio a
                fin. No tercerizamos llamadas, no derivamos peritajes, no escondemos cláusulas. Si pasa algo, atendemos
                nosotros mismos —en muchos casos antes que la compañía haga el primer contacto.
              </p>
              <p className="mb-4 mt-0">
                Nuestra cartera incluye familias que aseguran su auto, comercios que cubren su mercadería, profesionales
                que protegen su responsabilidad y empresas que necesitan coberturas industriales a medida. Cada caso
                entra por la misma puerta.
              </p>
            </div>
            <div className="flex items-center gap-[18px] mt-8 pt-6 border-t border-line-paper">
              <svg
                width="120"
                height="48"
                viewBox="0 0 120 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              >
                <path d="M6 32 C 14 18, 22 14, 28 22 S 38 36, 46 22 S 60 12, 66 26 S 78 38, 88 22 S 104 14, 114 26" />
                <path d="M30 38 L 96 38" strokeOpacity="0.3" />
              </svg>
              <div>
                <div className="font-bold text-[20px] text-paper-ink tracking-[-0.025em]">John Pellegrini</div>
                <div className="text-[11px] tracking-[0.22em] uppercase text-paper-ink opacity-60 mt-1">
                  Productor asesor · matr. 64.231
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
