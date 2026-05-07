import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import KanbanBoard from '@/components/leads/KanbanBoard'
import type { Lead } from '@/lib/leads'

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const leads = (data ?? []) as Lead[]

  return (
    <div className="pt-8 pb-28">
      <div className="px-4 mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Pipeline</h1>
        <p className="text-xs text-gray-500">{leads.length} lead{leads.length !== 1 ? 's' : ''}</p>
      </div>
      <KanbanBoard initialLeads={leads} />
    </div>
  )
}
