import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const tresDiasAtras = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, workspace_id, nome, servico, valor')
    .eq('estagio', 'ganho')
    .eq('lancamento_criado', false)
    .not('ganho_em', 'is', null)
    .lte('ganho_em', tresDiasAtras)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!leads || leads.length === 0) return NextResponse.json({ processados: 0 })

  let processados = 0

  for (const lead of leads) {
    if (!lead.valor) continue

    const { data: member } = await supabase
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', lead.workspace_id)
      .limit(1)
      .single()

    if (!member) continue

    const descricao = lead.servico ? `${lead.nome} — ${lead.servico}` : lead.nome

    const { error: txErr } = await supabase.from('transactions').insert({
      user_id: member.user_id,
      tipo: 'entrada',
      valor: lead.valor,
      categoria: 'servico',
      tipo_gasto: null,
      descricao,
    })

    if (txErr) continue

    await supabase
      .from('leads')
      .update({ lancamento_criado: true })
      .eq('id', lead.id)

    processados++
  }

  return NextResponse.json({ processados })
}
