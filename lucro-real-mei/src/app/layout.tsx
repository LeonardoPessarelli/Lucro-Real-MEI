import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lucro Real MEI',
  description: 'Saiba quanto é realmente seu a cada serviço prestado',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
