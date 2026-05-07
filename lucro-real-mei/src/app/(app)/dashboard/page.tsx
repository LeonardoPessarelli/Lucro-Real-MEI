import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calcularPotes } from '@/lib/potes'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { STAGE_CONFIG, STAGE_ORDER } from '@/lib/leads'

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function MetricCard({ label, value, sub, color = 'text-gray-100' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-card2 rounded-2xl p-4">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const inicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [{ data: profile }, { data: transactions }, { data: member }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('transactions').select('*').eq('user_id', user.id).gte('created_at', inicio),
    supabase.from('workspace_members').select('workspace_id').eq('user_id', user.id).limit(1).single(),
  ])

  if (!profile?.setup_completo) redirect('/config')

  const config = { custos_pct: profile.pote_custos_pct, reserva_pct: profile.pote_reserva_pct, salario_pct: profile.pote_salario_pct }
  const summary = calcularPotes(transactions ?? [], config)

  let leads: Lead[] = []
  if (member) {
    const { data } = await supabase.from('leads').select('*').eq('workspace_id', member.workspace_id)
    leads = (data ?? []) as Lead[]
  }

  const leadsAtivos = leads.filter(l => l.estagio !== 'perdido' && l.estagio !== 'ganho')
  const leadsGanhos = leads.filter(l => l.estagio === 'ganho')
  const taxaFechamento = leads.length > 0
    ? Math.round((leadsGanhos.length / leads.length) * 100)
    : 0

  const countsPorEstagio = STAGE_ORDER.reduce((acc, e) => {
    acc[e] = leads.filter(l => l.estagio === e).length
    return acc
  }, {} as Record<LeadEstagio, number>)

  return (
    <div className="px-4 pt-8 pb-28 space-y-6">
      <h1 className="text-xl font-bold">Dashboard</h1>

      <section className="space-y-2">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Financeiro — mês atual</p>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Entradas" value={`R$ ${fmt(summary.total_entradas)}`} color="text-verde" />
          <MetricCard label="Saídas" value={`R$ ${fmt(summary.total_saidas)}`} color="text-vermelho" />
          <MetricCard label="Lucro pessoal" value={`R$ ${fmt(summary.lucro_pessoal)}`} color="text-verde" />
          <MetricCard label="Reserva restante" value={`R$ ${fmt(summary.pote_reserva_restante)}`} color="text-roxo" />
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Pipeline de leads</p>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Total de leads" value={String(leads.length)} />
          <MetricCard label="Em negociação" value={String(leadsAtivos.length)} sub="ativos no pipeline" />
          <MetricCard label="Ganhos" value={String(leadsGanhos.length)} color="text-verde" />
          <MetricCard label="Taxa de ganho" value={`${taxaFechamento}%`} color={taxaFechamento >= 30 ? 'text-verde' : 'text-ambar'} />
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Leads por estágio</p>
        <div className="bg-card2 rounded-2xl p-4 space-y-3">
          {STAGE_ORDER.map(estagio => {
            const count = countsPorEstagio[estagio]
            const pct = leads.length > 0 ? (count / leads.length) * 100 : 0
            const cfg = STAGE_CONFIG[estagio]
            return (
              <div key={estagio}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{cfg.label}</span>
                  <span className="text-gray-500">{count}</span>
                </div>
                <div className="h-1.5 bg-card rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cfg.color }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
