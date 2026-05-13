import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Lead } from '@/lib/leads'
import KanbanBoard from '@/components/leads/KanbanBoard'

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const leads: Lead[] = []

  if (member) {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('workspace_id', member.workspace_id)
      .order('created_at', { ascending: false })

    if (data) leads.push(...(data as Lead[]))
  }

  return (
    <div className="pt-4">
      <KanbanBoard leads={leads} />
    </div>
  )
}
