import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'John Pellegrini & Asoc. · Productores Asesores de Seguros',
  description:
    'John Pellegrini Management Group asesora a personas, profesionales y empresas en la elección y gestión de coberturas patrimoniales. Matr. SSN 64.231.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={manrope.variable}>
      <body>{children}</body>
    </html>
  )
}
