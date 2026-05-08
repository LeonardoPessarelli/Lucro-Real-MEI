'use client'
import { useState, useTransition } from 'react'
import LeadModal from './LeadModal'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { STAGE_ORDER, STAGE_CONFIG } from '@/lib/leads'
import { moveLeadEstagioAction } from '@/lib/actions/leads'

interface Props {
  initialLeads: Lead[]
  custosPct: number
  reservaPct: number
  salarioPct: number
}

function fmtValor(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function diasEmGanho(ganho_em: string | null): number {
  if (!ganho_em) return 0
  return Math.floor((Date.now() - new Date(ganho_em).getTime()) / 86400000)
}

function PotesPreview({ valor, custosPct, reservaPct, salarioPct }: { valor: number; custosPct: number; reservaPct: number; salarioPct: number }) {
  const custos = (valor * custosPct) / 100
  const reserva = (valor * reservaPct) / 100
  const salario = (valor * salarioPct) / 100
  return (
    <div className="mt-2 pt-2 border-t border-white/5 grid grid-cols-3 gap-1">
      <div className="text-center">
        <p className="text-[9px] text-gray-500 mb-0.5">💼 Custos</p>
        <p className="text-[11px] font-bold text-ambar">R$ {fmtValor(custos)}</p>
      </div>
      <div className="text-center">
        <p className="text-[9px] text-gray-500 mb-0.5">🏦 Reserva</p>
        <p className="text-[11px] font-bold text-roxo">R$ {fmtValor(reserva)}</p>
      </div>
      <div className="text-center">
        <p className="text-[9px] text-gray-500 mb-0.5">💰 Pró-labore</p>
        <p className="text-[11px] font-bold text-verde">R$ {fmtValor(salario)}</p>
      </div>
    </div>
  )
}

export default function PipelineClient({ initialLeads, custosPct, reservaPct, salarioPct }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [editando, setEditando] = useState<Lead | undefined>()
  const [, startTransition] = useTransition()

  function onSaved(updated: Lead) {
    startTransition(() => {
      setLeads(prev => {
        const idx = prev.findIndex(l => l.id === updated.id)
        if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next }
        return [updated, ...prev]
      })
    })
  }

  function onDeleted(id: string) {
    startTransition(() => setLeads(prev => prev.filter(l => l.id !== id)))
  }

  function moverEstagio(lead: Lead, direcao: 'up' | 'down') {
    if (lead.lancamento_criado) return
    const idx = STAGE_ORDER.indexOf(lead.estagio)
    const novoIdx = direcao === 'up' ? idx - 1 : idx + 1
    if (novoIdx < 0 || novoIdx >= STAGE_ORDER.length) return
    const novoEstagio = STAGE_ORDER[novoIdx]
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, estagio: novoEstagio } : l))
    startTransition(async () => {
      const { error } = await moveLeadEstagioAction(lead.id, novoEstagio)
      if (error) {
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, estagio: lead.estagio } : l))
      }
    })
  }

  return (
    <>
      <div className="space-y-3">
        {STAGE_ORDER.map(estagio => {
          const cfg = STAGE_CONFIG[estagio]
          const grupo = leads.filter(l => l.estagio === estagio)
          const totalValor = grupo.reduce((s, l) => s + (l.valor ?? 0), 0)
          return (
            <div key={estagio}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cfg.color }} />
                <p className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
                <span className="text-xs text-gray-500">{grupo.length} · {totalValor > 0 ? `R$ ${fmtValor(totalValor)}` : '—'}</span>
              </div>

              <div className="space-y-2">
                {grupo.length === 0 ? (
                  <div className="flex items-stretch gap-2">
                    <div className="flex-1 bg-card2 rounded-2xl px-4 py-3 flex items-center min-w-0"
                      style={{ borderLeft: `3px solid ${cfg.color}` }}>
                      <p className="text-xs text-gray-600">Nenhum lead neste estágio</p>
                    </div>
                    <div className="w-8" />
                  </div>
                ) : grupo.map(lead => {
                  const stageIdx = STAGE_ORDER.indexOf(estagio)
                  const canUp = stageIdx > 0 && !lead.lancamento_criado
                  const canDown = stageIdx < STAGE_ORDER.length - 1 && !lead.lancamento_criado
                  const isGanho = estagio === 'ganho'
                  const dias = isGanho ? diasEmGanho(lead.ganho_em) : 0
                  const restam = Math.max(0, 3 - dias)

                  return (
                    <div key={lead.id} className="flex items-stretch gap-2">
                      <button onClick={() => setEditando(lead)}
                        className="flex-1 text-left bg-card2 rounded-2xl px-4 py-3 min-w-0"
                        style={{ borderLeft: `3px solid ${cfg.color}` }}>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-100 truncate">{lead.nome}</p>
                            {lead.servico && <p className="text-xs text-gray-400 truncate">{lead.servico}</p>}
                          </div>
                          <div className="text-right shrink-0">
                            {lead.valor != null && (
                              <p className="text-sm font-bold" style={{ color: cfg.color }}>
                                R$ {fmtValor(lead.valor)}
                              </p>
                            )}
                            {lead.lancamento_criado && (
                              <span className="text-[10px] bg-verde/20 text-verde px-2 py-0.5 rounded-full">✓ Confirmado</span>
                            )}
                            {isGanho && !lead.lancamento_criado && (
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {restam === 0 ? 'Processando...' : `Lança em ${restam}d`}
                              </p>
                            )}
                          </div>
                        </div>

                        {isGanho && lead.valor != null && (
                          <PotesPreview
                            valor={lead.valor}
                            custosPct={custosPct}
                            reservaPct={reservaPct}
                            salarioPct={salarioPct}
                          />
                        )}
                      </button>

                      <div className="flex flex-col gap-1 justify-center">
                        <button onClick={() => moverEstagio(lead, 'up')}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors
                            ${canUp ? 'bg-card2 text-gray-400 hover:text-gray-100' : 'opacity-0 pointer-events-none'}`}>
                          ↑
                        </button>
                        <button onClick={() => moverEstagio(lead, 'down')}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors
                            ${canDown ? 'bg-card2 text-gray-400 hover:text-gray-100' : 'opacity-0 pointer-events-none'}`}>
                          ↓
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {editando && (
        <LeadModal
          lead={editando}
          onClose={() => setEditando(undefined)}
          onSaved={onSaved}
          onDeleted={onDeleted}
        />
      )}
    </>
  )
}
