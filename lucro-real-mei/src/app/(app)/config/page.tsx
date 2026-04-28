import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PotesSliders from '@/components/config/PotesSliders'
import LogoutButton from '@/components/ui/LogoutButton'

export default async function ConfigPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles').select('pote_custos_pct, pote_reserva_pct, pote_salario_pct, setup_completo')
    .eq('id', user.id).single()
  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Meus Potes</h1>
          <p className="text-gray-400 text-sm">Como cada real que você recebe é dividido</p>
        </div>
        <LogoutButton />
      </div>
      <PotesSliders
        initialCustos={profile?.pote_custos_pct}
        initialReserva={profile?.pote_reserva_pct}
        isSetup={!profile?.setup_completo}
      />
    </div>
  )
}
