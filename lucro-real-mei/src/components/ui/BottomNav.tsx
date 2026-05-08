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
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card border-t border-card2 px-0 py-3 flex items-center justify-evenly z-40">
        <Link href="/" className={`flex flex-col items-center gap-1 text-xs ${pathname === '/' ? 'text-verde' : 'text-gray-500'}`}>
          <span className="text-lg">🏠</span>Início
        </Link>
        <Link href="/leads" className={`flex flex-col items-center gap-1 text-xs ${pathname === '/leads' ? 'text-verde' : 'text-gray-500'}`}>
          <span className="text-lg">👥</span>Leads
        </Link>
        <button onClick={() => setShowModal(true)} className="bg-verde rounded-full w-14 h-14 flex items-center justify-center text-black text-2xl font-bold shadow-[0_0_20px_rgba(74,222,128,0.3)] -mt-6">+</button>
        <Link href="/pipeline" className={`flex flex-col items-center gap-1 text-xs ${pathname === '/pipeline' ? 'text-verde' : 'text-gray-500'}`}>
          <span className="text-lg">📋</span>Pipeline
        </Link>
        <Link href="/dashboard" className={`flex flex-col items-center gap-1 text-xs ${pathname === '/dashboard' ? 'text-verde' : 'text-gray-500'}`}>
          <span className="text-lg">📊</span>Dashboard
        </Link>
      </nav>
      {showModal && <LancamentoModal onClose={() => setShowModal(false)} />}
    </>
  )
}
