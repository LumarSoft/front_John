import type { Metadata } from 'next'
import { Nav } from '@/src/features/landing/components/nav'
import { Footer } from '@/src/features/landing/components/footer'
import { CoberturasPage } from '@/src/features/coberturas/components/coberturas-page'

export const metadata: Metadata = {
  title: 'Coberturas · John Pellegrini & Asoc.',
  description:
    'Ocho líneas de cobertura patrimonial: automotor, hogar, comercio, bicicletas, personas y más. Cotizá con John Pellegrini, productor matriculado SSN 64.231.',
}

export default function Coberturas() {
  return (
    <>
      <Nav />
      <main>
        <CoberturasPage />
      </main>
      <Footer />
    </>
  )
}
