'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import LancamentoModal from '@/components/lancamento/LancamentoModal'

export default function BottomNav() {
  const pathname = usePathname()
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card border-t border-card2 px-4 py-3 flex items-center justify-around z-40">
        <Link href="/" className={`flex flex-col items-center gap-1 text-xs ${pathname === '/' ? 'text-verde' : 'text-gray-500'}`}>
          <span className="text-lg">🏠</span>Início
        </Link>
        <Link href="/resumo" className={`flex flex-col items-center gap-1 text-xs ${pathname === '/resumo' ? 'text-verde' : 'text-gray-500'}`}>
          <span className="text-lg">🧾</span>Resumo
        </Link>
        <button onClick={() => setShowModal(true)} className="bg-verde rounded-full w-14 h-14 flex items-center justify-center text-black text-2xl font-bold shadow-[0_0_20px_rgba(74,222,128,0.3)] -mt-6">+</button>
        <Link href="/config" className={`flex flex-col items-center gap-1 text-xs ${pathname === '/config' ? 'text-verde' : 'text-gray-500'}`}>
          <span className="text-lg">📊</span>Distribuição
        </Link>
        <Link href="/assinatura" className={`flex flex-col items-center gap-1 text-xs ${pathname === '/assinatura' ? 'text-verde' : 'text-gray-500'}`}>
          <span className="text-lg">⚙️</span>Conta
        </Link>
      </nav>
      {showModal && <LancamentoModal onClose={() => setShowModal(false)} />}
    </>
  )
}
