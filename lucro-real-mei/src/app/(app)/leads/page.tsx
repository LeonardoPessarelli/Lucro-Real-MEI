import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Lead } from '@/lib/leads'
import LeadsClient from '@/components/leads/LeadsClient'

export default async function LeadsPage() {
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

  return <LeadsClient leads={leads} />
}
