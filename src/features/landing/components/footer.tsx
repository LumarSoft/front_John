import Image from 'next/image'
import { AttentionHoursText } from '@/src/components/ui/attention-hours-text'

export function Footer() {
  return (
    <footer className="bg-ink text-paper border-t border-line-dark-2 pb-[calc(96px+env(safe-area-inset-bottom,0px))] md:pb-0">
      <div className="container py-12 md:py-16">
        {/* Big wordmark */}
        <div className="border-b border-line-dark-2 pb-8 md:pb-10 mb-8 md:mb-10">
          <div className="text-[10.5px] md:text-[11px] uppercase tracking-[0.24em] md:tracking-[0.28em] text-paper/50 font-semibold leading-[1.5]">
            Productores Asesores de Seguros · Matr. SSN 64.231
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 text-[12.5px] text-paper/65">
          <div>
            <h5 className="text-[10.5px] tracking-[0.24em] uppercase text-paper/50 mb-4 mt-0 font-semibold">
              Coberturas
            </h5>
            <a href="/#coberturas" className="block py-1 hover:text-ember transition-colors">
              Auto
            </a>
            <a href="/#coberturas" className="block py-1 hover:text-ember transition-colors">
              Moto
            </a>
            <a href="/#coberturas" className="block py-1 hover:text-ember transition-colors">
              Bicicletas
            </a>
            <a href="/#coberturas" className="block py-1 hover:text-ember transition-colors">
              Hogar
            </a>
            <a href="/#coberturas" className="block py-1 hover:text-ember transition-colors">
              Comercio e Industria
            </a>
            <a href="/#coberturas" className="block py-1 hover:text-ember transition-colors">
              Personas · Praxis · Bolso
            </a>
          </div>
          <div>
            <h5 className="text-[10.5px] tracking-[0.24em] uppercase text-paper/50 mb-4 mt-0 font-semibold">
              Pellegrini
            </h5>
            <a href="/#carta" className="block py-1 hover:text-ember transition-colors">
              La diferencia
            </a>
            <a href="/#companias" className="block py-1 hover:text-ember transition-colors">
              Compañías
            </a>
            <a href="/#resenas" className="block py-1 hover:text-ember transition-colors">
              Reseñas
            </a>
            <a href="/coberturas" className="block py-1 hover:text-ember transition-colors">
              Cotizar online
            </a>
          </div>
          <div>
            <h5 className="text-[10.5px] tracking-[0.24em] uppercase text-paper/50 mb-4 mt-0 font-semibold">
              Contacto
            </h5>
            <a href="tel:+541148150099" className="block py-1 hover:text-ember transition-colors">
              +54 11 4815-0099
            </a>
            <a href="mailto:hola@jpellegrini.ar" className="block py-1 hover:text-ember transition-colors">
              hola@jpellegrini.ar
            </a>
            <a className="block py-1">Blvd. 27 de Febrero 275, Rosario</a>
            <a className="block py-1">
              <AttentionHoursText />
            </a>
          </div>
          <div>
            <h5 className="text-[10.5px] tracking-[0.24em] uppercase text-paper/50 mb-4 mt-0 font-semibold">
              Sucursales
            </h5>
            <a href="/#estudio" className="block py-1 hover:text-ember transition-colors">
              Rosario · Casa Central
            </a>
            <a href="/#estudio" className="block py-1 hover:text-ember transition-colors">
              Funes
            </a>
            <a href="/#estudio" className="block py-1 hover:text-ember transition-colors">
              Pueblo Esther
            </a>
          </div>
        </div>

        <div className="mt-10 md:mt-12 p-5 md:p-6 border border-line-dark rounded-2xl bg-ink-2/60">
          <p className="text-[10.5px] md:text-[11px] text-paper/55 leading-[1.65] m-0">
            La entidad aseguradora dispone de un Servicio de Atención al Asegurado. En caso de que existiera un reclamo
            ante la entidad aseguradora y que el mismo no haya sido resuelto o haya sido desestimado, total o
            parcialmente, o que haya sido denegada su admisión, podrá comunicarse con la Superintendencia de Seguros de
            la Nación por teléfono al 0800-666-8400, correo electrónico a consultas@ssn.gob.ar o a través de la página
            web www.argentina.gob.ar/ssn
          </p>
        </div>

        <div className="mt-8 md:mt-10 pt-6 border-t border-line-dark flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-5 md:gap-6 text-[10.5px] md:text-[11px] text-paper/45 tracking-[0.14em] uppercase">
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
