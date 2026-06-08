import type { Metadata } from 'next'
import { Nav } from '@/src/features/landing/components/nav'
import { Footer } from '@/src/features/landing/components/footer'
import { CoberturasPage } from '@/src/features/coberturas/components/coberturas-page'
import { PRODUCTS } from '@/src/features/landing/data/products'

export const metadata: Metadata = {
  title: 'Coberturas · John Pellegrini & Asoc.',
  description:
    'Ocho líneas de cobertura patrimonial: auto, hogar, comercio, bicicletas, personas y más. Cotizá con John Pellegrini, productor matriculado SSN 64.231.',
}

export default async function Coberturas({ searchParams }: { searchParams: Promise<{ coverage?: string }> }) {
  const params = await searchParams
  const initialCoverageId = PRODUCTS.find(p => p.id === params.coverage)?.id ?? PRODUCTS[0].id

  return (
    <>
      <Nav />
      <main>
        <CoberturasPage initialCoverageId={initialCoverageId} />
      </main>
      <Footer />
    </>
  )
}
