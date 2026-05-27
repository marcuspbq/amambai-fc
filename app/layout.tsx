import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
})

const barlow = Barlow({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-barlow',
})

const barlowCondensed = Barlow_Condensed({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-condensed',
})

export const metadata: Metadata = {
  title: 'Amambaí F.C. — Bolão Copa do Mundo',
  description:
    'O bolão do Praça Amambaí Futebol Clube. 3 competições: Campeão Geral, Rei dos Artilheiros e Trader da Copa.',
  manifest: '/manifest.json',
  icons: { icon: '/escudo.svg', apple: '/escudo.svg' },
  authors: [{ name: 'Marcus Paulo', url: 'https://github.com/marcuspbq' }],
}

export const viewport: Viewport = {
  themeColor: '#0e1a10',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${bebasNeue.variable} ${barlow.variable} ${barlowCondensed.variable}`}
      >
        {children}
      </body>
    </html>
  )
}
