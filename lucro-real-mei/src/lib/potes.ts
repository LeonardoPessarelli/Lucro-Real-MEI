import type { PotesSummary } from '@/types'

interface TransactionInput {
  tipo: 'entrada' | 'saida'
  valor: number
  tipo_gasto: 'empresa' | 'pessoal' | null
  categoria: string
}

interface PotesConfig {
  custos_pct: number
  reserva_pct: number
  salario_pct: number
}

export function calcularPotes(
  transactions: TransactionInput[],
  config: PotesConfig
): PotesSummary {
  const total_entradas = transactions
    .filter(t => t.tipo === 'entrada')
    .reduce((sum, t) => sum + t.valor, 0)

  const total_saidas = transactions
    .filter(t => t.tipo === 'saida')
    .reduce((sum, t) => sum + t.valor, 0)

  const saidas_empresa = transactions
    .filter(t => t.tipo === 'saida' && t.tipo_gasto === 'empresa')
    .reduce((sum, t) => sum + t.valor, 0)

  const saidas_pessoal = transactions
    .filter(t => t.tipo === 'saida' && t.tipo_gasto === 'pessoal')
    .reduce((sum, t) => sum + t.valor, 0)

  const pote_custos = (total_entradas * config.custos_pct) / 100
  const pote_reserva = (total_entradas * config.reserva_pct) / 100
  const pote_salario = (total_entradas * config.salario_pct) / 100

  // quanto cada pote ficou negativo (overflow que precisa vir da reserva)
  const reserva_usada_empresa = Math.max(0, saidas_empresa - pote_custos)
  const reserva_usada_pessoal = Math.max(0, saidas_pessoal - pote_salario)
  const total_reserva_usada = reserva_usada_empresa + reserva_usada_pessoal

  const pote_custos_restante = Math.max(0, pote_custos - saidas_empresa)
  const pote_salario_restante = Math.max(0, pote_salario - saidas_pessoal)
  const pote_reserva_restante = Math.max(0, pote_reserva - total_reserva_usada)

  // lucro pessoal = o que sobrou no salário, descontando o que a reserva cobriu do pessoal
  const lucro_pessoal = pote_salario_restante

  return {
    total_entradas,
    total_saidas,
    pote_custos,
    pote_reserva,
    pote_salario,
    pote_custos_restante,
    pote_salario_restante,
    lucro_pessoal,
    saidas_empresa,
    saidas_pessoal,
    reserva_usada_empresa,
    reserva_usada_pessoal,
    pote_reserva_restante,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function calcularPotesComLeads(
  transactions: TransactionInput[],
  config: PotesConfig,
  totalLeadsGanhos: number
): PotesSummary {
  const base = calcularPotes(transactions, config)
  const extra_custos = (totalLeadsGanhos * config.custos_pct) / 100
  const extra_reserva = (totalLeadsGanhos * config.reserva_pct) / 100
  const extra_salario = (totalLeadsGanhos * config.salario_pct) / 100
  return {
    ...base,
    total_entradas: base.total_entradas + totalLeadsGanhos,
    pote_custos: base.pote_custos + extra_custos,
    pote_reserva: base.pote_reserva + extra_reserva,
    pote_salario: base.pote_salario + extra_salario,
    pote_custos_restante: base.pote_custos_restante + extra_custos,
    pote_reserva_restante: base.pote_reserva_restante + extra_reserva,
    pote_salario_restante: base.pote_salario_restante + extra_salario,
    lucro_pessoal: base.lucro_pessoal + extra_salario,
  }
}
