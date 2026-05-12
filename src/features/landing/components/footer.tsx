export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="colophon">
          <div>
            <div className="colophon-mark">
              John Pellegrini <span className="amp">&amp;</span> Asoc.
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
              Productores asesores de seguros
              <br />
              Matrícula SSN 64.231
              <br />
              Buenos Aires, Argentina
            </div>
          </div>
          <div>
            <h5>Coberturas</h5>
            <a href="#coberturas">Automotor</a>
            <a href="#coberturas">Motovehículos</a>
            <a href="#coberturas">Bicicletas</a>
            <a href="#coberturas">Hogar</a>
            <a href="#coberturas">Comercio e Industria</a>
            <a href="#coberturas">Personas · Praxis · Bolso</a>
          </div>
          <div>
            <h5>Estudio</h5>
            <a href="#carta">Carta del productor</a>
            <a href="#companias">Compañías representadas</a>
            <a href="#contacto">Atención de siniestros</a>
            <a href="https://www.ssn.gob.ar" target="_blank" rel="noopener noreferrer">
              Reclamos ante la SSN
            </a>
          </div>
          <div>
            <h5>Contacto directo</h5>
            <a href="tel:+541148150099">+54 11 4815-0099</a>
            <a href="mailto:hola@jpellegrini.ar">hola@jpellegrini.ar</a>
            <a>Av. del Libertador 4720, CABA</a>
            <a>Lunes a viernes · 9 a 18 hs</a>
          </div>
        </div>
        <div className="footer-foot">
          <div>© 1998 — 2026 · John Pellegrini Management Group</div>
          <div>Sup. de Seguros de la Nación · ssn.gob.ar</div>
        </div>
      </div>
    </footer>
  )
}
