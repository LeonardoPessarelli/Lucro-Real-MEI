import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calcularPotes } from '@/lib/potes'
import SaldoCard from '@/components/home/SaldoCard'
import PoteCard from '@/components/home/PoteCard'
import RecentTransactions from '@/components/home/RecentTransactions'
import Saudacao from '@/components/home/Saudacao'
import LogoutButton from '@/components/ui/LogoutButton'

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
  const hoje = new Date()
  const mesAtual = `${String(hoje.getDate()).padStart(2,'0')}-${String(hoje.getMonth()+1).padStart(2,'0')}-${hoje.getFullYear()}`

  return (
    <div className="px-4 pt-8 space-y-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-xs capitalize">{mesAtual}</p>
          <Saudacao nome={profile.nome} />
        </div>
        <LogoutButton />
      </div>
      <SaldoCard lucro={summary.lucro_pessoal} totalEntradas={summary.total_entradas} />
      <div>
        <p className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-3">Como o dinheiro foi dividido</p>
        <div className="space-y-3">
          <PoteCard icon="💼" label="Custos do negócio" value={summary.pote_custos_restante} total={summary.pote_custos} color="text-ambar" barColor="bg-ambar" />
          <PoteCard icon="🏦" label="Reserva de oportunidade" value={summary.pote_reserva_restante} total={summary.pote_reserva} color="text-roxo" barColor="bg-roxo" />
        </div>
      </div>
      <div>
        <p className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-3">Últimos lançamentos</p>
        <RecentTransactions transactions={recent} />
      </div>
    </div>
  )
}
