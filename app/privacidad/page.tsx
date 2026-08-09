import type { Metadata } from 'next'
import { Nav } from '@/src/features/landing/components/nav'
import { Footer } from '@/src/features/landing/components/footer'
import { PrivacidadPage } from '@/src/features/plataforma/components/privacidad-page'

export const metadata: Metadata = {
  title: 'Política de privacidad · John Pellegrini Management Group',
  description:
    'Qué datos personales trata John Pellegrini Management Group S.R.L., con qué finalidad, con quién se comparten y cómo ejercer tus derechos de acceso, rectificación y supresión.',
  alternates: { canonical: '/privacidad' },
}

export default function Privacidad() {
  return (
    <>
      <Nav />
      <main>
        <PrivacidadPage />
      </main>
      <Footer />
    </>
  )
}
