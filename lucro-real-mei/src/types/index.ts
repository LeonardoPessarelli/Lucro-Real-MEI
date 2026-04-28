export type SubscriptionStatus = 'trial' | 'active' | 'expired'
export type TipoTransaction = 'entrada' | 'saida'
export type TipoGasto = 'empresa' | 'pessoal'

export interface Profile {
  id: string
  nome: string | null
  pote_custos_pct: number
  pote_reserva_pct: number
  pote_salario_pct: number
  setup_completo: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  tipo: TipoTransaction
  valor: number
  descricao: string | null
  categoria: string
  tipo_gasto: TipoGasto | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  status: SubscriptionStatus
  trial_ends_at: string
  asaas_id: string | null
  plan: 'monthly' | 'annual' | null
  created_at: string
}

export interface PotesSummary {
  total_entradas: number
  total_saidas: number
  // alocado (baseado nas % dos potes × entradas)
  pote_custos: number
  pote_reserva: number
  pote_salario: number
  // restante após gastos diretos
  pote_custos_restante: number
  pote_salario_restante: number
  lucro_pessoal: number
  saidas_empresa: number
  saidas_pessoal: number
  // overflow coberto pela reserva
  reserva_usada_empresa: number
  reserva_usada_pessoal: number
  pote_reserva_restante: number
}
