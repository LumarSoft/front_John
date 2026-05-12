import { Nav } from '@/src/features/landing/components/nav'
import { Hero } from '@/src/features/landing/components/hero'
import { Credenciales } from '@/src/features/landing/components/credenciales'
import { Cotizador } from '@/src/features/landing/components/cotizador'
import { Carta } from '@/src/features/landing/components/carta'
import { Companias } from '@/src/features/landing/components/companias'
import { CtaSection } from '@/src/features/landing/components/cta-section'
import { Footer } from '@/src/features/landing/components/footer'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Credenciales />
        <Cotizador />
        <Carta />
        <Companias />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
