'use client'
import { useState } from 'react'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { STAGE_CONFIG } from '@/lib/leads'
import LeadCard from './LeadCard'

function fmt(v: number) {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

interface Props {
  estagio: LeadEstagio
  leads: Lead[]
  totalPipeline: number
  isFirst: boolean
  isLast: boolean
  onEdit: (lead: Lead) => void
  onAddNew: (estagio: LeadEstagio) => void
  onMover: (id: string, direcao: 'subir' | 'descer') => void
}

export default function KanbanColumn({
  estagio, leads, totalPipeline, isFirst, isLast, onEdit, onAddNew, onMover,
}: Props) {
  const [aberto, setAberto] = useState(true)
  const stage = STAGE_CONFIG[estagio]
  const isPerdido = estagio === 'perdido'
  const isGanho = estagio === 'ganho'
  const totalValor = leads.reduce((acc, l) => acc + (l.valor ?? 0), 0)
  const pct = totalPipeline > 0 ? Math.round((totalValor / totalPipeline) * 100) : 0

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${stage.color}25`, backgroundColor: 'rgba(255,255,255,0.02)' }}
    >
      {/* ── Header (toque para colapsar) ──────────────────────── */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        style={{ borderBottom: aberto ? `1px solid ${stage.color}20` : 'none' }}
        onClick={() => setAberto(a => !a)}
      >
        {/* barra de cor lateral */}
        <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: stage.color }}>{stage.label}</span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: stage.bgColor, color: stage.color }}
            >
              {leads.length}
            </span>
          </div>
          {leads.length > 0 && (
            <p className="text-xs mt-0.5" style={{ color: isGanho ? '#4ade80' : isPerdido ? '#6b7280' : '#9ca3af' }}>
              {fmt(totalValor)}{!isPerdido && !isGanho && pct > 0 ? ` · ${pct}% do pipeline` : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* botão + */}
          <div
            role="button"
            onClick={e => { e.stopPropagation(); onAddNew(estagio) }}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: stage.bgColor }}
          >
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke={stage.color} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          {/* chevron */}
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ transform: aberto ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', color: '#6b7280' }}
          >
            <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* ── Cards ─────────────────────────────────────────────── */}
      {aberto && (
        <div className="px-3 py-2 space-y-2">
          {leads.length === 0 ? (
            <p className="text-gray-600 text-xs text-center py-4">Nenhum lead aqui</p>
          ) : (
            leads.map(lead => (
              <div key={lead.id} className="flex items-stretch gap-2">
                {/* Card clicável */}
                <div className="flex-1 min-w-0">
                  <LeadCard lead={lead} onClick={() => onEdit(lead)} />
                </div>

                {/* Setas de mover */}
                <div className="flex flex-col gap-1 justify-center shrink-0">
                  <button
                    disabled={isFirst}
                    onClick={() => onMover(lead.id, 'subir')}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors disabled:opacity-20"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    title="Mover para estágio anterior"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 8l4-4 4 4" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    disabled={isLast}
                    onClick={() => onMover(lead.id, 'descer')}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors disabled:opacity-20"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    title="Mover para próximo estágio"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
