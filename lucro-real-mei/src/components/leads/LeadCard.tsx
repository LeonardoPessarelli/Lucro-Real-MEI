'use client'
import type { Lead } from '@/lib/leads'
import { STAGE_CONFIG } from '@/lib/leads'

function diasAtras(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function prazoInfo(prazoStr: string | null): { label: string; urgente: boolean; vencido: boolean } | null {
  if (!prazoStr) return null
  // YYYY-MM-DD (UTC meia-noite) — interpretar como fim do dia local usando T23:59:59
  const prazoDate = new Date(prazoStr.length === 10 ? prazoStr + 'T23:59:59' : prazoStr)
  const diff = Math.floor((prazoDate.getTime() - Date.now()) / 86400000)
  if (diff < 0)  return { label: `Venceu há ${Math.abs(diff)}d`, urgente: true, vencido: true }
  if (diff === 0) return { label: 'Vence hoje', urgente: true, vencido: false }
  if (diff <= 3)  return { label: `${diff}d restantes`, urgente: true, vencido: false }
  return { label: `${diff}d restantes`, urgente: false, vencido: false }
}

function iniciais(nome: string): string {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

interface Props {
  lead: Lead
  onClick?: () => void
  compact?: boolean   // true = modo kanban, false = modo lista
}

export default function LeadCard({ lead, onClick, compact = false }: Props) {
  const stage = STAGE_CONFIG[lead.estagio]
  const dias = diasAtras(lead.created_at)
  const isPerdido = lead.estagio === 'perdido'
  const isFechado = lead.estagio === 'ganho'
  const isStale = dias >= 7 && !isFechado && !isPerdido
  const prazo = prazoInfo(lead.prazo)

  if (compact) {
    // ── MODO KANBAN ─────────────────────────────────────────────────
    return (
      <button
        onClick={onClick}
        className="kanban-card w-full text-left group"
        style={{ opacity: isPerdido ? 0.5 : 1 }}
      >
        {/* borda esquerda colorida */}
        <span
          className="kanban-card-stripe"
          style={{ backgroundColor: stage.color }}
        />

        <div className="kanban-card-body">
          {/* Título do negócio */}
          <p className="kanban-card-title">{lead.servico}</p>

          {/* Lead / empresa */}
          <p className="kanban-card-lead">{lead.nome}</p>

          {/* Linha inferior: valor + responsável */}
          <div className="kanban-card-footer">
            <span
              className="kanban-card-valor"
              style={{ color: isFechado ? '#4ade80' : '#e5e7eb' }}
            >
              {(lead.valor ?? 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                maximumFractionDigits: 0,
              })}
            </span>

            <div className="kanban-card-meta">
              {prazo && (
                <span
                  className="kanban-card-prazo"
                  style={{
                    color: prazo.vencido ? '#f87171' : prazo.urgente ? '#fb923c' : '#6b7280',
                    backgroundColor: prazo.urgente ? (prazo.vencido ? 'rgba(248,113,113,0.1)' : 'rgba(249,115,22,0.1)') : 'transparent',
                  }}
                >
                  {prazo.label}
                </span>
              )}
              {isStale && !prazo && (
                <span className="kanban-card-stale">{dias}d parado</span>
              )}
              {/* Avatar do responsável */}
              <span className="kanban-card-avatar">
                {iniciais(lead.responsavel ?? '')}
              </span>
            </div>
          </div>
        </div>
      </button>
    )
  }

  // ── MODO LISTA ───────────────────────────────────────────────────
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl overflow-hidden transition-all duration-150"
      style={{
        backgroundColor: isFechado ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeftColor: stage.color,
        borderLeftWidth: 2,
        opacity: isPerdido ? 0.55 : 1,
      }}
    >
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-[13px] leading-tight truncate"
            style={{ color: isFechado ? '#86efac' : '#f3f4f6' }}>
            {lead.nome}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 uppercase tracking-wide"
            style={{ color: stage.color, backgroundColor: stage.bgColor }}
          >
            {stage.label}
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1 truncate">{lead.servico}</p>
        <div className="flex items-center justify-between mt-1.5 gap-1">
          <span className="text-[11px] text-gray-600 truncate">{lead.origem}</span>
          <div className="flex items-center gap-1 ml-auto shrink-0">
            {isStale && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: 'rgba(249,115,22,0.15)', color: '#fb923c' }}>
                {dias}d parado
              </span>
            )}
            {!isStale && (
              <span className="text-[10px] text-gray-600 tabular-nums">
                {dias === 0 ? 'hoje' : dias === 1 ? 'ontem' : `${dias}d`}
              </span>
            )}
          </div>
        </div>
        <p className="text-[13px] font-bold mt-1.5 tabular-nums"
          style={{ color: isFechado ? '#4ade80' : '#9ca3af' }}>
          {(lead.valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
    </button>
  )
}
