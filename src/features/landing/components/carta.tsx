export function Carta() {
  return (
    <section id="carta" className="paper">
      <div className="container carta">
        <div className="carta-grid">
          <figure className="carta-portrait" style={{ margin: 0 }}>
            <div className="carta-portrait-corner">Retrato</div>
            <div className="carta-portrait-frame" />
            <div className="carta-portrait-cap">
              [ fotografía del productor ]
              <br />
              —<br />
              John Pellegrini
            </div>
            <div className="carta-portrait-foot">
              <span>Buenos Aires</span>
              <span>MMXXVI</span>
            </div>
          </figure>
          <div className="carta-body">
            <div className="section-num">§ II.</div>
            <h2 className="section-title">
              Carta del <em>productor.</em>
            </h2>
            <p className="carta-lede">
              Más que vender pólizas, construimos relaciones de largo plazo. Cada cliente tiene un único interlocutor, y
              ese interlocutor conoce su patrimonio como propio.
            </p>
            <div className="carta-cols">
              <p>
                John Pellegrini Management Group nació en 1998 como un estudio familiar de productores de seguros. Tres
                décadas después seguimos operando bajo la misma idea: la cobertura adecuada no se compra online en cinco
                minutos, se diseña a medida y se acompaña en el tiempo.
              </p>
              <p>
                Trabajamos exclusivamente con compañías de primera línea y acompañamos cada siniestro de principio a
                fin. No tercerizamos llamadas, no derivamos peritajes, no escondemos cláusulas. Si pasa algo, atendemos
                nosotros mismos —en muchos casos antes que la compañía haga el primer contacto.
              </p>
              <p>
                Nuestra cartera incluye familias que aseguran su auto, comercios que cubren su mercadería, profesionales
                que protegen su responsabilidad y empresas que necesitan coberturas industriales a medida. Cada caso
                entra por la misma puerta.
              </p>
            </div>
            <div className="carta-sig">
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
                <div className="carta-sig-name">John Pellegrini</div>
                <div className="carta-sig-line">Productor asesor · matr. 64.231</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
