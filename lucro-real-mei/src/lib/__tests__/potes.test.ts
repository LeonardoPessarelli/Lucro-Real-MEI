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

  it('saída de empresa reduz pote_custos_restante mas não o lucro pessoal', () => {
    const result = calcularPotes(
      [
        { tipo: 'entrada', valor: 1000, tipo_gasto: null, categoria: 'servico' },
        { tipo: 'saida', valor: 200, tipo_gasto: 'empresa', categoria: 'material' },
      ],
      config
    )
    expect(result.lucro_pessoal).toBe(400)
    expect(result.saidas_empresa).toBe(200)
    expect(result.pote_custos_restante).toBe(200)
    expect(result.pote_salario_restante).toBe(400)
    expect(result.reserva_usada_empresa).toBe(0)
    expect(result.pote_reserva_restante).toBe(200)
  })

  it('saída pessoal reduz pote_salario_restante e lucro pessoal', () => {
    const result = calcularPotes(
      [
        { tipo: 'entrada', valor: 1000, tipo_gasto: null, categoria: 'servico' },
        { tipo: 'saida', valor: 100, tipo_gasto: 'pessoal', categoria: 'mercado' },
      ],
      config
    )
    expect(result.pote_salario_restante).toBe(300)
    expect(result.lucro_pessoal).toBe(300)
    expect(result.pote_custos_restante).toBe(400)
    expect(result.reserva_usada_pessoal).toBe(0)
    expect(result.pote_reserva_restante).toBe(200)
  })

  it('overflow de empresa usa a reserva', () => {
    // R$10k: custos=4k, reserva=2k, salario=4k
    // gastou R$5k empresa → overflow R$1k da reserva
    const result = calcularPotes(
      [
        { tipo: 'entrada', valor: 10000, tipo_gasto: null, categoria: 'servico' },
        { tipo: 'saida', valor: 5000, tipo_gasto: 'empresa', categoria: 'material' },
      ],
      config
    )
    expect(result.pote_custos_restante).toBe(0)
    expect(result.reserva_usada_empresa).toBe(1000)
    expect(result.reserva_usada_pessoal).toBe(0)
    expect(result.pote_reserva_restante).toBe(1000)
  })

  it('overflow de empresa e pessoal descontam da reserva — exemplo do produto', () => {
    // R$10k: custos=4k, reserva=2k, salario=4k
    // gastou R$5k empresa (overflow 1k) + R$4.2k pessoal (overflow 200)
    const result = calcularPotes(
      [
        { tipo: 'entrada', valor: 10000, tipo_gasto: null, categoria: 'servico' },
        { tipo: 'saida', valor: 5000, tipo_gasto: 'empresa', categoria: 'material' },
        { tipo: 'saida', valor: 4200, tipo_gasto: 'pessoal', categoria: 'mercado' },
      ],
      config
    )
    expect(result.reserva_usada_empresa).toBe(1000)
    expect(result.reserva_usada_pessoal).toBe(200)
    expect(result.pote_reserva_restante).toBe(800)
    expect(result.pote_custos_restante).toBe(0)
    expect(result.pote_salario_restante).toBe(0)
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
