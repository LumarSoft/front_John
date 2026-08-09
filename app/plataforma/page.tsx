import type { Metadata } from 'next'
import { Nav } from '@/src/features/landing/components/nav'
import { Footer } from '@/src/features/landing/components/footer'
import { PlataformaHero } from '@/src/features/plataforma/components/hero'
import { Servicio } from '@/src/features/plataforma/components/servicio'
import { Panel } from '@/src/features/plataforma/components/panel'
import { Asesores } from '@/src/features/plataforma/components/asesores'
import { Datos } from '@/src/features/plataforma/components/datos'

export const metadata: Metadata = {
  title: 'Plataforma de WhatsApp para productoras · John Pellegrini Management Group',
  description:
    'Asistente de WhatsApp, base de datos de cartera y panel de administración para productoras de seguros. Desarrollado y operado por John Pellegrini Management Group S.R.L.',
  alternates: { canonical: '/plataforma' },
  openGraph: {
    title: 'Plataforma de WhatsApp para productoras de seguros',
    description:
      'Un asistente que atiende a los asegurados las 24 horas, la cartera sincronizada y un panel donde cada asesor ve lo suyo.',
    url: '/plataforma',
    type: 'website',
  },
}

export default function Plataforma() {
  return (
    <>
      <Nav />
      <main>
        <PlataformaHero />
        <Servicio />
        <Panel />
        <Asesores />
        <Datos />
      </main>
      <Footer />
    </>
  )
}
