import type { Lead } from './leads'

export interface MesHistorico {
  mes: string
  faturamento: number
  isCurrent: boolean
}

export interface MetricasLeads {
  totalLeads: number
  negociosAbertos: number
  valorPipeline: number
  taxaConversao: number | null
}

export interface FinanceiroMes {
  total_entradas: number
  pote_custos: number
  pote_reserva: number
  pote_salario: number
  pote_custos_restante: number
  pote_reserva_restante: number
  pote_salario_restante: number
  lucro_pessoal: number
}

const ESTAGIOS_ATIVOS = ['novo', 'negociacao'] as const

export function calcularMetricasLeads(leads: Lead[]): MetricasLeads {
  const ativos = leads.filter(l => (ESTAGIOS_ATIVOS as readonly string[]).includes(l.estagio))
  const ganhos = leads.filter(l => l.estagio === 'ganho').length
  const perdidos = leads.filter(l => l.estagio === 'perdido').length
  const total = ganhos + perdidos

  return {
    totalLeads: leads.length,
    negociosAbertos: ativos.length,
    valorPipeline: ativos.reduce((s, l) => s + (l.valor ?? 0), 0),
    taxaConversao: total === 0 ? null : Math.round((ganhos / total) * 100),
  }
}

