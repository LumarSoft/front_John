import Image from 'next/image'

export function Footer() {
  return (
    <footer className="pt-12 pb-12 border-t border-line-2 bg-ink-2 max-[760px]:pb-[calc(124px+env(safe-area-inset-bottom,0px))]">
      <div className="container">
        <div className="grid grid-cols-4 gap-10 text-[12.5px] text-cream-2 max-[760px]:grid-cols-2 max-[760px]:gap-7">
          <div>
            <div className="font-bold text-[20px] text-cream leading-[1.15] mb-[14px] tracking-[-0.03em]">
              John Pellegrini <span className="text-amber">&amp;</span> Asoc.
            </div>
            <div className="text-[12.5px] text-muted leading-[1.6]">
              Productores asesores de seguros
              <br />
              Matrícula SSN 64.231
              <br />
              Rosario, Santa Fe, Argentina
            </div>
          </div>
          <div>
            <h5 className="text-[10.5px] tracking-[0.24em] uppercase text-muted mb-4 mt-0 font-medium">Coberturas</h5>
            <a href="#coberturas" className="block py-1 hover:text-amber">
              Auto
            </a>
            <a href="#coberturas" className="block py-1 hover:text-amber">
              Moto
            </a>
            <a href="#coberturas" className="block py-1 hover:text-amber">
              Bicicletas
            </a>
            <a href="#coberturas" className="block py-1 hover:text-amber">
              Hogar
            </a>
            <a href="#coberturas" className="block py-1 hover:text-amber">
              Comercio e Industria
            </a>
            <a href="#coberturas" className="block py-1 hover:text-amber">
              Personas · Praxis · Bolso
            </a>
          </div>
          <div>
            <h5 className="text-[10.5px] tracking-[0.24em] uppercase text-muted mb-4 mt-0 font-medium">Estudio</h5>
            <a href="#carta" className="block py-1 hover:text-amber">
              Carta del productor
            </a>
            <a href="#companias" className="block py-1 hover:text-amber">
              Compañías representadas
            </a>
            <a href="#contacto" className="block py-1 hover:text-amber">
              Atención de siniestros
            </a>
            <a
              href="https://www.ssn.gob.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-1 hover:text-amber"
            >
              Reclamos ante la SSN
            </a>
          </div>
          <div>
            <h5 className="text-[10.5px] tracking-[0.24em] uppercase text-muted mb-4 mt-0 font-medium">
              Contacto directo
            </h5>
            <a href="tel:+541148150099" className="block py-1 hover:text-amber">
              +54 11 4815-0099
            </a>
            <a href="mailto:hola@jpellegrini.ar" className="block py-1 hover:text-amber">
              hola@jpellegrini.ar
            </a>
            <a className="block py-1">Blvd. 27 de Febrero 275, Rosario</a>
            <a className="block py-1">Lunes a viernes · 9 a 18 hs</a>
          </div>
        </div>

        <div className="mt-10 p-5 border border-line rounded-2xl">
          <p className="text-[11px] text-muted leading-[1.7] m-0">
            La entidad aseguradora dispone de un Servicio de Atención al Asegurado. En caso de que existiera un reclamo
            ante la entidad aseguradora y que el mismo no haya sido resuelto o haya sido desestimado, total o
            parcialmente, o que haya sido denegada su admisión, podrá comunicarse con la Superintendencia de Seguros de
            la Nación por teléfono al 0800-666-8400, correo electrónico a consultas@ssn.gob.ar o a través de la página
            web www.argentina.gob.ar/ssn
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-line flex justify-between items-center gap-6 flex-wrap text-[11px] text-muted tracking-[0.16em] uppercase">
          <div>© 1974 — 2026 · John Pellegrini Management Group</div>
          <a
            href="https://www.argentina.gob.ar/ssn"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center bg-white px-4 py-2 rounded-sm shrink-0 transition-opacity hover:opacity-85"
            aria-label="Superintendencia de Seguros de la Nación"
          >
            <Image src="/Logos SSN.svg" alt="Superintendencia de Seguros de la Nación" width={180} height={26} />
          </a>
        </div>
      </div>
    </footer>
  )
}
