import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PotesSliders from '@/components/config/PotesSliders'

export default async function ConfigPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles').select('pote_custos_pct, pote_reserva_pct')
    .eq('id', session.user.id).single()
  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Meus Potes</h1>
        <p className="text-gray-400 text-sm">Como cada real que você recebe é dividido</p>
      </div>
      <PotesSliders initialCustos={profile?.pote_custos_pct} initialReserva={profile?.pote_reserva_pct} />
    </div>
  )
}
