'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props { initialCustos?: number; initialReserva?: number; isSetup?: boolean }

export default function PotesSliders({ initialCustos = 40, initialReserva = 20, isSetup = false }: Props) {
  const [custos, setCustos] = useState(initialCustos)
  const [reserva, setReserva] = useState(initialReserva)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()
  const salario = 100 - custos - reserva

  function handleCustos(val: number) { setCustos(Math.min(val, 100 - reserva - 5)) }
  function handleReserva(val: number) { setReserva(Math.min(val, 100 - custos - 5)) }

  async function salvar() {
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('profiles').update({
        pote_custos_pct: custos, pote_reserva_pct: reserva,
        pote_salario_pct: salario, setup_completo: true,
      }).eq('id', user.id)
      router.push('/'); router.refresh()
    })
  }

  const sliders = [
    { label: 'Custos do negócio', icon: '💼', textColor: 'text-ambar', accentColor: '#f59e0b', value: custos, onChange: handleCustos, readOnly: false },
    { label: 'Reserva de emergência', icon: '🏦', textColor: 'text-roxo', accentColor: '#818cf8', value: reserva, onChange: handleReserva, readOnly: false },
    { label: 'Seu salário', icon: '✅', textColor: 'text-verde', accentColor: '#4ade80', value: salario, onChange: () => {}, readOnly: true },
  ]

  return (
    <div className="space-y-4">
      {sliders.map(({ label, icon, textColor, accentColor, value, onChange, readOnly }) => (
        <div key={label} className="bg-card2 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <p className={`font-semibold text-sm ${textColor}`}>{icon} {label}</p>
            <span className={`text-2xl font-bold ${textColor}`}>{value}%</span>
          </div>
          <input type="range" min={5} max={90} value={value} disabled={readOnly}
            onChange={e => onChange(Number(e.target.value))}
            style={{ accentColor }}
            className="w-full h-1 rounded-full disabled:opacity-60" />
        </div>
      ))}
      <button onClick={salvar} disabled={isPending || salario < 5}
        className="w-full bg-verde text-black py-4 rounded-2xl font-bold text-sm disabled:opacity-50 mt-2">
        {isPending ? 'Salvando...' : 'Salvar configuração'}
      </button>
    </div>
  )
}
