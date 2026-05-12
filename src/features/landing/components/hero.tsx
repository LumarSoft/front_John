export function Hero() {
  return (
    <section className="container hero">
      <div className="hero-grid">
        <div>
          <div className="hero-eyebrow">Productores Asesores · Desde 1998</div>
          <h1 className="hero-title">
            Patrimonios
            <br />
            bajo <em className="italic">cuidado</em>
            <br />
            <span className="small">desde hace 27 años.</span>
          </h1>
          <p className="hero-lead">
            John Pellegrini Management Group asesora a personas, profesionales y empresas en la elección y gestión de
            coberturas patrimoniales. Cotizamos en las principales compañías del país y acompañamos cada siniestro de
            principio a fin.
          </p>
          <div className="hero-byline">
            <div>
              <div className="hero-byline-cap">Atendido personalmente por</div>
              <div className="hero-byline-sig">John Pellegrini, productor matriculado.</div>
            </div>
          </div>

          <div className="hero-ticket">
            <div>
              <div className="hero-ticket-k">Pólizas vigentes</div>
              <div className="hero-ticket-v">2.418</div>
            </div>
            <div>
              <div className="hero-ticket-k">Compañías</div>
              <div className="hero-ticket-v">Triunfo · Sancor</div>
            </div>
            <div>
              <div className="hero-ticket-k">Cobertura</div>
              <div className="hero-ticket-v">
                <em>Nacional</em>
              </div>
            </div>
            <button className="hero-ticket-cta">Cotizar →</button>
          </div>
        </div>

        <div>
          <figure className="hero-photo" style={{ margin: 0 }}>
            <div className="hero-photo-corner">Fig. 1</div>
            <div className="hero-photo-placeholder">
              [ fotografía editorial ]
              <br />
              cliente · vehículo · familia
            </div>
            <figcaption className="hero-photo-tag">
              <span className="hero-photo-cap">
                &ldquo;Tuvimos granizo en Pilar. En 72 horas estaba la indemnización liquidada.&rdquo;
              </span>
              <span className="hero-photo-num">Caso 4781</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
