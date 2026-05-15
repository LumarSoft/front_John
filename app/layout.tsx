import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import { ThemeProvider } from '@/src/components/theme-provider'
import { WhatsAppFab } from '@/src/components/whatsapp-fab'
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
    <html lang="es" className={manrope.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <WhatsAppFab />
        </ThemeProvider>
      </body>
    </html>
  )
}
