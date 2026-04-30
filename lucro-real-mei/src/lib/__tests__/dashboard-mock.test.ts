// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  calcularMetricasLeads,
  HISTORICO_MOCK,
  FINANCEIRO_MES_MOCK,
} from '../dashboard-mock'
import { MOCK_LEADS } from '../leads'

describe('calcularMetricasLeads', () => {
  it('conta total de leads', () => {
    const m = calcularMetricasLeads(MOCK_LEADS)
    expect(m.totalLeads).toBe(MOCK_LEADS.length)
  })

  it('conta negócios abertos (novo + proposta + negociacao)', () => {
    const m = calcularMetricasLeads(MOCK_LEADS)
    const esperado = MOCK_LEADS.filter(l =>
      ['novo', 'proposta', 'negociacao'].includes(l.estagio)
    ).length
    expect(m.negociosAbertos).toBe(esperado)
  })

  it('soma valor do pipeline (leads ativos)', () => {
    const m = calcularMetricasLeads(MOCK_LEADS)
    const esperado = MOCK_LEADS.filter(l =>
      ['novo', 'proposta', 'negociacao'].includes(l.estagio)
    ).reduce((s, l) => s + l.valor, 0)
    expect(m.valorPipeline).toBe(esperado)
  })

  it('calcula taxa de conversão', () => {
    const m = calcularMetricasLeads(MOCK_LEADS)
    const ganhos = MOCK_LEADS.filter(l => l.estagio === 'ganho').length
    const perdidos = MOCK_LEADS.filter(l => l.estagio === 'perdido').length
    const esperado = Math.round((ganhos / (ganhos + perdidos)) * 100)
    expect(m.taxaConversao).toBe(esperado)
  })

  it('retorna null para taxa quando não há ganho nem perdido', () => {
    const leads = MOCK_LEADS.filter(l => l.estagio === 'novo')
    const m = calcularMetricasLeads(leads)
    expect(m.taxaConversao).toBeNull()
  })

  it('HISTORICO_MOCK tem exatamente 6 meses', () => {
    expect(HISTORICO_MOCK).toHaveLength(6)
  })

  it('HISTORICO_MOCK tem exatamente 1 mês atual', () => {
    expect(HISTORICO_MOCK.filter(m => m.isCurrent)).toHaveLength(1)
  })

  it('FINANCEIRO_MES_MOCK tem total_entradas positivo', () => {
    expect(FINANCEIRO_MES_MOCK.total_entradas).toBeGreaterThan(0)
  })
})
