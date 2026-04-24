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
  const lucro_pessoal = pote_salario - saidas_pessoal

  return {
    total_entradas,
    total_saidas,
    pote_custos,
    pote_reserva,
    pote_salario,
    lucro_pessoal,
    saidas_empresa,
    saidas_pessoal,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
