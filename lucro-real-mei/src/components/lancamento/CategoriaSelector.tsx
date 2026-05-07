'use client'
import { useState } from 'react'
import { CATEGORIAS_ENTRADA, CATEGORIAS_EMPRESA, CATEGORIAS_PESSOAL } from '@/lib/categories'
import type { Category } from '@/lib/categories'
import type { TipoGasto } from '@/types'

interface Props { tipo: 'entrada' | 'saida'; selected: string | null; onSelect: (slug: string, tipoGasto: TipoGasto | null) => void }

export default function CategoriaSelector({ tipo, selected, onSelect }: Props) {
  const [tipoGasto, setTipoGasto] = useState<TipoGasto | null>(null)

  if (tipo === 'entrada') return (
    <div className="grid grid-cols-3 gap-2">
      {CATEGORIAS_ENTRADA.map(cat => <Chip key={cat.slug} cat={cat} selected={selected === cat.slug} onClick={() => onSelect(cat.slug, null)} />)}
    </div>
  )

  if (!tipoGasto) return (
    <div className="grid grid-cols-2 gap-3">
      <button onClick={() => setTipoGasto('empresa')} className="bg-[#1c1400] border-2 border-ambar rounded-2xl p-4 text-center">
        <p className="text-2xl mb-1">💼</p><p className="text-ambar font-bold text-sm">Empresa</p>
        <p className="text-gray-500 text-xs mt-1">Sai do gráfico de Custos</p>
      </button>
      <button onClick={() => setTipoGasto('pessoal')} className="bg-card2 border-2 border-card2 rounded-2xl p-4 text-center">
        <p className="text-2xl mb-1">🏠</p><p className="text-gray-300 font-bold text-sm">Pessoal</p>
        <p className="text-gray-500 text-xs mt-1">Sai do seu pró-labore</p>
      </button>
    </div>
  )

  const cats = tipoGasto === 'empresa' ? CATEGORIAS_EMPRESA : CATEGORIAS_PESSOAL
  const badgeClass = tipoGasto === 'empresa' ? 'bg-[#1c1400] border-ambar text-ambar' : 'bg-card2 border-card2 text-gray-300'
  return (
    <div>
      <button onClick={() => { setTipoGasto(null); onSelect('', null) }} className={`inline-flex items-center gap-1 text-xs border rounded-full px-3 py-1 mb-3 ${badgeClass}`}>
        {tipoGasto === 'empresa' ? '💼 Empresa' : '🏠 Pessoal'} ←
      </button>
      <div className="grid grid-cols-4 gap-2">
        {cats.map(cat => <Chip key={cat.slug} cat={cat} selected={selected === cat.slug} onClick={() => onSelect(cat.slug, tipoGasto)} compact />)}
      </div>
    </div>
  )
}

function Chip({ cat, selected, onClick, compact }: { cat: Category; selected: boolean; onClick: () => void; compact?: boolean }) {
  return (
    <button onClick={onClick} className={`rounded-xl p-2 text-center border-2 transition-colors ${selected ? 'border-verde bg-verde/10' : 'border-card2 bg-card2'}`}>
      <p className={compact ? 'text-xl' : 'text-2xl'}>{cat.icon}</p>
      <p className={`text-gray-400 leading-tight mt-1 ${compact ? 'text-[9px]' : 'text-xs'}`}>{cat.label}</p>
    </button>
  )
}
