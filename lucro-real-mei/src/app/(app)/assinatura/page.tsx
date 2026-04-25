import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createAsaasCustomer, getPaymentLink } from '@/lib/asaas'

export default async function AssinaturaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, trial_ends_at, asaas_id')
    .eq('user_id', user.id)
    .single()

  const isActive = sub?.status === 'active'
  const diasRestantes = sub?.status === 'trial'
    ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  async function handleAssinar(plan: 'monthly' | 'annual') {
    'use server'
    const supabaseSrv = await createClient()
    const { data: { user: actionUser } } = await supabaseSrv.auth.getUser()
    if (!actionUser) return

    const service = createServiceClient()
    const { data: subscription } = await service
      .from('subscriptions')
      .select('asaas_id')
      .eq('user_id', actionUser.id)
      .single()

    let asaasId = subscription?.asaas_id
    if (!asaasId) {
      asaasId = await createAsaasCustomer(actionUser.email!, actionUser.user_metadata?.full_name ?? 'MEI')
      await service.from('subscriptions').update({ asaas_id: asaasId }).eq('user_id', actionUser.id)
    }

    const url = await getPaymentLink(asaasId, plan)
    redirect(url)
  }

  const plans = [
    { id: 'monthly' as const, label: 'Mensal', price: 'R$ 19,90/mês', badge: null },
    { id: 'annual' as const, label: 'Anual', price: 'R$ 97,00/ano', badge: 'Economize 59%' },
  ]

  return (
    <div className="px-4 pt-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Lucro Real MEI</h1>
        {diasRestantes !== null && (
          <p className="text-ambar text-sm">
            {diasRestantes > 0 ? `${diasRestantes} dias restantes no período grátis` : 'Período grátis encerrado'}
          </p>
        )}
        {isActive && <p className="text-verde text-sm">✅ Assinatura ativa</p>}
      </div>

      {!isActive && (
        <div className="space-y-4">
          {plans.map((plan) => (
            <form key={plan.id} action={handleAssinar.bind(null, plan.id)}>
              <button
                type="submit"
                className="w-full bg-card2 border-2 border-card2 hover:border-verde rounded-2xl p-5 text-left transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-white">{plan.label}</p>
                    <p className="text-verde font-black text-xl mt-1">{plan.price}</p>
                  </div>
                  {plan.badge && (
                    <span className="bg-verde/10 text-verde text-xs font-bold px-2 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  )
}
