import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calcularPotes, formatCurrency } from '@/lib/potes'
import PoteBar from '@/components/resumo/PoteBar'
import AlertaGastos from '@/components/resumo/AlertaGastos'
import TransactionList from '@/components/resumo/TransactionList'

export default async function ResumoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('transactions').select('*').eq('user_id', user.id)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .order('created_at', { ascending: false }),
  ])

  const config = { custos_pct: profile?.pote_custos_pct ?? 40, reserva_pct: profile?.pote_reserva_pct ?? 20, salario_pct: profile?.pote_salario_pct ?? 40 }
  const summary = calcularPotes(transactions ?? [], config)
  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="px-4 pt-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resumo</h1>
        <p className="text-gray-500 text-sm capitalize">{mesAtual}</p>
      </div>
      <div className="bg-card2 rounded-2xl p-4">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Faturamento total</p>
        <p className="text-3xl font-black text-white">{formatCurrency(summary.total_entradas)}</p>
      </div>
      <div className="space-y-4">
        <PoteBar icon="💼" label="Custos do negócio" value={summary.pote_custos} total={summary.total_entradas} color="text-ambar" barColor="bg-ambar" />
        <PoteBar icon="🏦" label="Reserva" value={summary.pote_reserva} total={summary.total_entradas} color="text-roxo" barColor="bg-roxo" />
        <PoteBar icon="✅" label="Seu salário" value={summary.pote_salario} total={summary.total_entradas} color="text-verde" barColor="bg-verde" />
      </div>
      <AlertaGastos saidasPessoal={summary.saidas_pessoal} />
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Todos os lançamentos</p>
        <TransactionList transactions={transactions ?? []} />
      </div>
    </div>
  )
}
