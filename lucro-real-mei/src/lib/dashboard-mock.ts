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

const ESTAGIOS_ATIVOS = ['novo', 'proposta', 'negociacao'] as const

export function calcularMetricasLeads(leads: Lead[]): MetricasLeads {
  const ativos = leads.filter(l => (ESTAGIOS_ATIVOS as readonly string[]).includes(l.estagio))
  const ganhos = leads.filter(l => l.estagio === 'ganho').length
  const perdidos = leads.filter(l => l.estagio === 'perdido').length
  const total = ganhos + perdidos

  return {
    totalLeads: leads.length,
    negociosAbertos: ativos.length,
    valorPipeline: ativos.reduce((s, l) => s + l.valor, 0),
    taxaConversao: total === 0 ? null : Math.round((ganhos / total) * 100),
  }
}

export const HISTORICO_MOCK: MesHistorico[] = [
  { mes: 'Nov', faturamento: 8200,  isCurrent: false },
  { mes: 'Dez', faturamento: 11500, isCurrent: false },
  { mes: 'Jan', faturamento: 7800,  isCurrent: false },
  { mes: 'Fev', faturamento: 9400,  isCurrent: false },
  { mes: 'Mar', faturamento: 12300, isCurrent: false },
  { mes: 'Abr', faturamento: 10500, isCurrent: true  },
]

export const FINANCEIRO_MES_MOCK: FinanceiroMes = {
  total_entradas:        10500,
  pote_custos:           4200,
  pote_reserva:          2100,
  pote_salario:          4200,
  pote_custos_restante:  2800,
  pote_reserva_restante: 2100,
  pote_salario_restante: 3150,
  lucro_pessoal:         3150,
}
