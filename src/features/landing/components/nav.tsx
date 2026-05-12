import { Strip } from './strip'

export function Nav() {
  return (
    <header>
      <Strip />
      <nav className="nav">
        <div className="container nav-inner">
          <div className="nav-left">
            <a href="#coberturas">Coberturas</a>
            <a href="#carta">El productor</a>
            <a href="#companias">Compañías</a>
            <a href="#contacto">Contacto</a>
          </div>
          <div className="nav-mid">
            <div className="nav-wordmark">
              John Pellegrini <span className="amp">&amp;</span> Asoc.
            </div>
            <div className="nav-sub">Productores asesores de seguros · Matr. 64.231</div>
          </div>
          <div className="nav-right">
            <div className="nav-phone" style={{ textAlign: 'right' }}>
              <span>Línea directa</span>
              +54 11 4815-0099
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
