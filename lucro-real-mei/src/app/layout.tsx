import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lucro Real MEI',
  description: 'Saiba quanto é realmente seu a cada serviço prestado',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg text-white min-h-screen">{children}</body>
    </html>
  )
}
