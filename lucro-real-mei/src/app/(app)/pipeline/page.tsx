import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PipelineClient from '@/components/leads/PipelineClient'
import type { Lead } from '@/lib/leads'

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: member }, { data: profile }] = await Promise.all([
    supabase.from('workspace_members').select('workspace_id').eq('user_id', user.id).limit(1).single(),
    supabase.from('profiles').select('pote_custos_pct, pote_reserva_pct, pote_salario_pct').eq('id', user.id).single(),
  ])

  const leads: Lead[] = member ? (await supabase
    .from('leads')
    .select('*')
    .eq('workspace_id', member.workspace_id)
    .order('created_at', { ascending: false })
  ).data as Lead[] ?? [] : []

  return (
    <div className="px-4 pt-8 pb-28">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Pipeline</h1>
        <p className="text-xs text-gray-500">{leads.length} lead{leads.length !== 1 ? 's' : ''}</p>
      </div>
      <PipelineClient
        initialLeads={leads}
        custosPct={profile?.pote_custos_pct ?? 30}
        reservaPct={profile?.pote_reserva_pct ?? 20}
        salarioPct={profile?.pote_salario_pct ?? 50}
      />
    </div>
  )
}
