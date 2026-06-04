import type { Metadata } from 'next'
import { Manrope, Inter } from 'next/font/google'
import { ThemeProvider } from '@/src/components/ui/theme-provider'
import { WhatsAppFab } from '@/src/components/ui/whatsapp-fab'
import { Providers } from './providers'
import './globals.css'

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
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
    <html lang="es" className={`${manrope.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeProvider>
            {children}
            <WhatsAppFab />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
