import AssinaturaButtons from '@/components/assinatura/AssinaturaButtons'

export default async function AssinaturaPage() {
  const plans = [
    { id: 'monthly' as const, label: 'Mensal', price: 'R$ 19,90/mês', badge: '7 dias grátis' },
    { id: 'annual' as const, label: 'Anual', price: 'R$ 97,00/ano', badge: 'Economize 59%' },
  ]

  async function handleAssinar(plan: 'monthly' | 'annual') {
    'use server'
    // MODO TESTE — sem API real
    console.log(`[TESTE] Plano selecionado: ${plan}`)
  }

  return (
    <div className="px-4 pt-8">
      <div className="mb-6 text-center">
        <div className="inline-block bg-ambar/10 text-ambar text-xs font-bold px-3 py-1 rounded-full mb-4">
          MODO TESTE — dono do produto
        </div>
        <h1 className="text-2xl font-bold mb-2">Lucro Real MEI</h1>
        <p className="text-gray-400 text-sm">Escolha um plano para continuar</p>
      </div>

      <AssinaturaButtons plans={plans} handleAssinar={handleAssinar} />

      <div className="mt-8 bg-card2 rounded-2xl p-4 space-y-2">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Simulação de estado</p>
        <SimularAtivo />
      </div>
    </div>
  )
}

function SimularAtivo() {
  return (
    <div className="space-y-2 text-sm text-gray-300">
      <p>• Clicar em <strong className="text-white">Mensal</strong> ou <strong className="text-white">Anual</strong> registra no console (sem cobrar)</p>
      <p>• Integração real com Asaas será ativada na fase de produção</p>
      <p>• Supabase e autenticação: ativos normalmente</p>
    </div>
  )
}
