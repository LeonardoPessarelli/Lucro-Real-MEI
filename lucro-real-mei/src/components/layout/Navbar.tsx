'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useDrawer } from './DrawerProvider'
import LancamentoModal from '@/components/lancamento/LancamentoModal'

const PAGE_TITLES: Record<string, string> = {
  '/':          'Início',
  '/resumo':    'Resumo',
  '/leads':     'Leads',
  '/pipeline':  'Pipeline',
  '/config':    'Divisão de Lucros',
  '/assinatura': 'Plano',
}

const PAGES_WITH_LANCAMENTO = ['/', '/resumo']

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/leads/')) return 'Detalhes do Lead'
  return ''
}

export default function Navbar() {
  const { toggleDrawer } = useDrawer()
  const pathname = usePathname()
  const [showLancamento, setShowLancamento] = useState(false)

  const title = getTitle(pathname)
  const showPlus = PAGES_WITH_LANCAMENTO.includes(pathname)

  return (
    <>
      <header className="sticky top-0 z-30 bg-bg border-b border-card2 flex items-center justify-between px-4 h-14">
        <button onClick={toggleDrawer} className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect y="3" width="20" height="2" rx="1"/>
            <rect y="9" width="20" height="2" rx="1"/>
            <rect y="15" width="20" height="2" rx="1"/>
          </svg>
        </button>
        <span className="font-bold text-white">{title}</span>
        {showPlus ? (
          <button onClick={() => setShowLancamento(true)} className="w-10 h-10 flex items-center justify-center text-2xl text-verde font-bold">+</button>
        ) : (
          <div className="w-10" />
        )}
      </header>

      {showLancamento && <LancamentoModal onClose={() => setShowLancamento(false)} />}
    </>
  )
}
