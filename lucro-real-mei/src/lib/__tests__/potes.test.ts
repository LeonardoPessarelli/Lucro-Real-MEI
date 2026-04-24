// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { calcularPotes } from '../potes'

const config = { custos_pct: 40, reserva_pct: 20, salario_pct: 40 }

describe('calcularPotes', () => {
  it('retorna zeros sem transações', () => {
    const result = calcularPotes([], config)
    expect(result.total_entradas).toBe(0)
    expect(result.lucro_pessoal).toBe(0)
  })

  it('divide entrada de R$1000 corretamente', () => {
    const result = calcularPotes(
      [{ tipo: 'entrada', valor: 1000, tipo_gasto: null, categoria: 'servico' }],
      config
    )
    expect(result.pote_custos).toBe(400)
    expect(result.pote_reserva).toBe(200)
    expect(result.pote_salario).toBe(400)
    expect(result.lucro_pessoal).toBe(400)
  })

  it('desconta saída pessoal do lucro pessoal', () => {
    const result = calcularPotes(
      [
        { tipo: 'entrada', valor: 1000, tipo_gasto: null, categoria: 'servico' },
        { tipo: 'saida', valor: 100, tipo_gasto: 'pessoal', categoria: 'mercado' },
      ],
      config
    )
    expect(result.lucro_pessoal).toBe(300)
    expect(result.saidas_pessoal).toBe(100)
  })

  it('saída de empresa não afeta lucro pessoal', () => {
    const result = calcularPotes(
      [
        { tipo: 'entrada', valor: 1000, tipo_gasto: null, categoria: 'servico' },
        { tipo: 'saida', valor: 200, tipo_gasto: 'empresa', categoria: 'material' },
      ],
      config
    )
    expect(result.lucro_pessoal).toBe(400)
    expect(result.saidas_empresa).toBe(200)
  })

  it('soma múltiplas entradas', () => {
    const result = calcularPotes(
      [
        { tipo: 'entrada', valor: 500, tipo_gasto: null, categoria: 'servico' },
        { tipo: 'entrada', valor: 500, tipo_gasto: null, categoria: 'venda' },
      ],
      config
    )
    expect(result.total_entradas).toBe(1000)
    expect(result.pote_salario).toBe(400)
  })
})
