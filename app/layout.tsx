import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Amambaí F.C. — Bolão Copa do Mundo',
  description: 'O bolão do Praça Amambaí Futebol Clube. Meier, 1993.',
  manifest: '/manifest.json',
  authors: [{ name: 'Marcus Paulo', url: 'https://github.com/marcuspbq' }],
}

export const viewport: Viewport = {
  themeColor: '#0e1a10',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
