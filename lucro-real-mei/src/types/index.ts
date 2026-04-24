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
  pote_custos: number
  pote_reserva: number
  pote_salario: number
  lucro_pessoal: number
  saidas_empresa: number
  saidas_pessoal: number
}
