import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calcularPotes } from '@/lib/potes'
import SaldoCard from '@/components/home/SaldoCard'
import PoteCard from '@/components/home/PoteCard'
import RecentTransactions from '@/components/home/RecentTransactions'
import Saudacao from '@/components/home/Saudacao'
import LogoutButton from '@/components/ui/LogoutButton'
import { processarLancamentosGanho } from '@/app/actions'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/landing')

  // Lança como receita qualquer lead em Ganho há mais de 3 dias ainda não lançado
  await processarLancamentosGanho()

  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [{ data: profile }, { data: transactions }, { data: member }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('transactions').select('*').eq('user_id', user.id)
      .gte('created_at', inicioMes)
      .order('created_at', { ascending: false }),
    supabase.from('workspace_members').select('workspace_id').eq('user_id', user.id).limit(1).single(),
  ])

  // Leads em Ganho ainda não lançados (< 3 dias) somam como entradas provisórias
  const leadsGanho = member ? await supabase
    .from('leads')
    .select('valor')
    .eq('workspace_id', member.workspace_id)
    .eq('estagio', 'ganho')
    .is('lancado_em', null)
    .then(({ data }) => data ?? []) : []

  // MODO TESTE: setup_completo ignorado para não bloquear navegação

  const config = { custos_pct: profile?.pote_custos_pct ?? 40, reserva_pct: profile?.pote_reserva_pct ?? 20, salario_pct: profile?.pote_salario_pct ?? 40 }
  const txList = transactions ?? []
  const leadsEntradas = leadsGanho.map(l => ({ tipo: 'entrada' as const, valor: Number(l.valor), tipo_gasto: null, categoria: 'servico' }))
  const summary = calcularPotes([...txList, ...leadsEntradas], config)
  const recent = txList.slice(0, 3)
  const hoje = new Date()
  const mesAtual = `${String(hoje.getDate()).padStart(2,'0')}-${String(hoje.getMonth()+1).padStart(2,'0')}-${hoje.getFullYear()}`

  return (
    <div className="px-4 pt-8 space-y-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-xs capitalize">{mesAtual}</p>
          <Saudacao nome={profile?.nome ?? ''} />
        </div>
        <LogoutButton />
      </div>
      <SaldoCard lucro={summary.lucro_pessoal} totalEntradas={summary.total_entradas} />
      <div>
        <p className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-3">Como o dinheiro foi dividido</p>
        <div className="space-y-3">
          <PoteCard icon="💼" label="Custos do Negócio" value={summary.pote_custos_restante} total={summary.pote_custos} color="text-ambar" barColor="bg-ambar" />
          <PoteCard icon="🏦" label="Reserva de Oportunidade" value={summary.pote_reserva_restante} total={summary.pote_reserva} color="text-roxo" barColor="bg-roxo" />
        </div>
      </div>
      <div>
        <p className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-3">Últimos lançamentos</p>
        <RecentTransactions transactions={recent} />
      </div>
    </div>
  )
}
