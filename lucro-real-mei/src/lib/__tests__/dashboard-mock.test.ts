// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { calcularMetricasLeads } from '../dashboard-mock'
import type { Lead } from '../leads'

const makeLeads = (estagios: Lead['estagio'][]): Lead[] =>
  estagios.map((estagio, i) => ({
    id: String(i),
    workspace_id: 'ws-test',
    nome: `Lead ${i}`,
    colaborador: null,
    contato: '',
    valor: 1000,
    origem: 'Site',
    servico: 'Serviço',
    anotacoes: null,
    estagio,
    responsavel: '',
    prazo: null,
    ganho_em: null,
    lancamento_criado: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

describe('calcularMetricasLeads', () => {
  it('conta total de leads', () => {
    const leads = makeLeads(['novo', 'negociacao', 'ganho'])
    expect(calcularMetricasLeads(leads).totalLeads).toBe(3)
  })

  it('conta negócios abertos (novo + negociacao)', () => {
    const leads = makeLeads(['novo', 'negociacao', 'ganho', 'perdido'])
    expect(calcularMetricasLeads(leads).negociosAbertos).toBe(2)
  })

  it('soma valor do pipeline (leads ativos)', () => {
    const leads = makeLeads(['novo', 'negociacao', 'ganho'])
    expect(calcularMetricasLeads(leads).valorPipeline).toBe(2000)
  })

  it('calcula taxa de conversão', () => {
    const leads = makeLeads(['ganho', 'ganho', 'ganho', 'perdido'])
    expect(calcularMetricasLeads(leads).taxaConversao).toBe(75)
  })

  it('retorna null para taxa quando não há ganho nem perdido', () => {
    const leads = makeLeads(['novo', 'negociacao'])
    expect(calcularMetricasLeads(leads).taxaConversao).toBeNull()
  })

  it('retorna zeros para lista vazia', () => {
    const m = calcularMetricasLeads([])
    expect(m.totalLeads).toBe(0)
    expect(m.negociosAbertos).toBe(0)
    expect(m.valorPipeline).toBe(0)
    expect(m.taxaConversao).toBeNull()
  })
})
