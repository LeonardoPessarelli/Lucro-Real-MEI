'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function revalidateHome() {
  revalidatePath('/')
}

// Processa leads em Ganho há mais de 3 dias que ainda não foram lançados como receita.
// Chamada a cada carregamento do Início — idempotente graças ao filtro lancado_em IS NULL.
export async function processarLancamentosGanho() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()
  if (!member) return

  const tresDiasAtras = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

  const { data: leads } = await supabase
    .from('leads')
    .select('id, nome, servico, valor')
    .eq('workspace_id', member.workspace_id)
    .eq('estagio', 'ganho')
    .lte('updated_at', tresDiasAtras)
    .is('lancado_em', null)

  if (!leads || leads.length === 0) return

  const agora = new Date().toISOString()

  for (const lead of leads) {
    if (!lead.valor || lead.valor <= 0) continue

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      tipo: 'entrada',
      valor: lead.valor,
      categoria: 'servico',
      tipo_gasto: null,
      descricao: lead.servico || lead.nome,
    })

    if (!error) {
      await supabase
        .from('leads')
        .update({ lancado_em: agora })
        .eq('id', lead.id)
    }
  }

  revalidatePath('/')
}

