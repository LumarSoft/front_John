import type { Metadata } from 'next'
import { Nav } from '@/src/features/landing/components/nav'
import { Footer } from '@/src/features/landing/components/footer'
import { CotizadorForm } from '@/src/features/cotizador/components/cotizador-form'

export const metadata: Metadata = {
  title: 'Cotizador de motos · John Pellegrini & Asoc.',
  description:
    'Cotizá tu seguro de moto con John Pellegrini. Buscá tu moto, elegí la cobertura y recibí tu cotización en el día.',
}

export default function CotizadorMotoPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="pt-[100px] pb-[100px] border-b border-line-2">
          <div className="container text-center flex flex-col items-center">
            <div className="text-[10.5px] tracking-[0.36em] uppercase text-amber font-medium mb-7">
              Cotizador · Moto
            </div>
            <h1 className="font-bold text-[clamp(52px,8vw,110px)] leading-[0.97] tracking-[-0.05em] text-cream m-0 mb-7">
              Cotizá tu <em className="italic text-amber">moto.</em>
            </h1>
            <p className="text-[16px] text-cream-2 leading-[1.65] max-w-[480px] m-0">
              Buscá tu moto, completá los datos y te enviamos la cotización detallada en el día.
            </p>
          </div>
        </section>

        <section className="pt-[72px] pb-[120px]">
          <div className="container" style={{ maxWidth: 760 }}>
            <div className="mb-10 pb-8 border-b border-line-2">
              <div className="text-[10.5px] tracking-[0.32em] uppercase text-amber font-medium mb-[10px]">
                Cotizador
              </div>
              <h2 className="font-bold text-[clamp(32px,4vw,48px)] tracking-[-0.04em] leading-[1.02] text-cream m-0 mb-2">
                Seguro de moto
              </h2>
              <p className="text-[14px] text-faint leading-[1.55] m-0">
                Todo riesgo · Terceros completo · Atención de siniestros sin franquicia variable
              </p>
            </div>

            <CotizadorForm vehicleType="moto" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
