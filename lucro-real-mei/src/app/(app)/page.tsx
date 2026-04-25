import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calcularPotes } from '@/lib/potes'
import SaldoCard from '@/components/home/SaldoCard'
import PoteCard from '@/components/home/PoteCard'
import RecentTransactions from '@/components/home/RecentTransactions'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('transactions').select('*').eq('user_id', user.id)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .order('created_at', { ascending: false }),
  ])

  if (!profile?.setup_completo) redirect('/config')

  const config = { custos_pct: profile.pote_custos_pct, reserva_pct: profile.pote_reserva_pct, salario_pct: profile.pote_salario_pct }
  const summary = calcularPotes(transactions ?? [], config)
  const recent = (transactions ?? []).slice(0, 3)
  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="px-4 pt-8 space-y-5">
      <div>
        <p className="text-gray-500 text-xs capitalize">{mesAtual}</p>
        <h1 className="text-xl font-bold">Bom dia, {profile.nome?.split(' ')[0] ?? 'MEI'} 👋</h1>
      </div>
      <SaldoCard lucro={summary.lucro_pessoal} totalEntradas={summary.total_entradas} />
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Como o dinheiro foi dividido</p>
        <div className="space-y-3">
          <PoteCard icon="💼" label="Custos do negócio" value={summary.pote_custos} total={summary.total_entradas} color="text-ambar" barColor="bg-ambar" />
          <PoteCard icon="🏦" label="Reserva" value={summary.pote_reserva} total={summary.total_entradas} color="text-roxo" barColor="bg-roxo" />
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Últimos lançamentos</p>
        <RecentTransactions transactions={recent} />
      </div>
    </div>
  )
}
