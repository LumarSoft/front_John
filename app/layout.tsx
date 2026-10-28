import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { ThemeProvider } from '@/src/components/ui/theme-provider'
import { PANEL_THEME_SCRIPT } from '@/src/features/admin/lib/panel-theme'
import { WhatsAppFab } from '@/src/components/ui/whatsapp-fab'
import { Providers } from './providers'
import './globals.css'

const manrope = localFont({
  src: './fonts/Manrope.ttf',
  variable: '--font-manrope',
  weight: '200 800',
  display: 'swap',
})

const inter = localFont({
  src: './fonts/Inter.ttf',
  variable: '--font-inter',
  weight: '400 900',
  display: 'swap',
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: PANEL_THEME_SCRIPT }} />
      </head>
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
