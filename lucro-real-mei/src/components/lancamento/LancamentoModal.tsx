'use client'
import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createTransactionAction } from '@/lib/actions/transactions'
import CategoriaSelector from './CategoriaSelector'
import DivisaoPreview from './DivisaoPreview'
import type { TipoGasto } from '@/types'

interface Props { onClose: () => void }

function formatarCentavos(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function LancamentoModal({ onClose }: Props) {
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada')
  const [centavos, setCentavos] = useState(0)
  const [categoria, setCategoria] = useState<string | null>(null)
  const [tipoGasto, setTipoGasto] = useState<TipoGasto | null>(null)
  const [descricao, setDescricao] = useState('')
  const [isPending, startTransition] = useTransition()
  const [erroSalvar, setErroSalvar] = useState('')
  const [profile, setProfile] = useState<{ pote_custos_pct: number; pote_reserva_pct: number; pote_salario_pct: number } | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const valor = centavos / 100

  function handleValor(e: React.ChangeEvent<HTMLInputElement>) {
    const digitos = e.target.value.replace(/\D/g, '')
    setCentavos(Math.min(Number(digitos) || 0, 99999999))
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase.from('profiles').select('pote_custos_pct, pote_reserva_pct, pote_salario_pct')
        .eq('id', session.user.id).single().then(({ data }) => setProfile(data))
    })
  }, [])

  function handleCategoria(slug: string, tg: TipoGasto | null) { setCategoria(slug || null); setTipoGasto(tg) }

  async function confirmar() {
    if (!categoria || valor <= 0) return
    setErroSalvar('')
    startTransition(async () => {
      const result = await createTransactionAction({ tipo, valor, categoria, tipo_gasto: tipoGasto, descricao: descricao || null })
      if (result.error) { setErroSalvar(result.error); return }
      router.refresh(); onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-bg w-full max-w-md rounded-t-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <button onClick={onClose} className="text-gray-500 text-sm">Cancelar</button>
          <h2 className="font-bold">Novo Lançamento</h2>
          <div className="w-16" />
        </div>
        <div className="flex bg-card2 rounded-xl p-1">
          {(['entrada', 'saida'] as const).map(t => (
            <button key={t} onClick={() => { setTipo(t); setCategoria(null); setTipoGasto(null); setCentavos(0) }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tipo === t ? (t === 'entrada' ? 'bg-verde-dark text-white' : 'bg-red-900 text-vermelho') : 'text-gray-500'}`}>
              {t === 'entrada' ? '💰 Entrada' : '🔴 Saída'}
            </button>
          ))}
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-xs mb-1">Valor</p>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0,00"
            value={centavos > 0 ? formatarCentavos(centavos) : ''}
            onChange={handleValor}
            className={`text-4xl font-black text-center bg-transparent w-full outline-none ${tipo === 'entrada' ? 'text-verde' : 'text-vermelho'}`}
          />
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">{tipo === 'entrada' ? 'Tipo de entrada' : 'Tipo de gasto'}</p>
          <CategoriaSelector tipo={tipo} selected={categoria} onSelect={handleCategoria} />
        </div>
        {tipo === 'entrada' && profile && <DivisaoPreview valor={valor} custos_pct={profile.pote_custos_pct} reserva_pct={profile.pote_reserva_pct} salario_pct={profile.pote_salario_pct} />}
        <input type="text" placeholder="Descrição (opcional)" value={descricao} onChange={e => setDescricao(e.target.value)}
          className="w-full bg-card2 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none placeholder:text-gray-600" />
        {erroSalvar && <p className="text-vermelho text-xs text-center">{erroSalvar}</p>}
        <button onClick={confirmar} disabled={!categoria || valor <= 0 || isPending}
          className="w-full bg-verde text-black py-4 rounded-2xl font-bold text-sm disabled:opacity-40">
          {isPending ? 'Salvando...' : 'Confirmar lançamento'}
        </button>
      </div>
    </div>
  )
}
