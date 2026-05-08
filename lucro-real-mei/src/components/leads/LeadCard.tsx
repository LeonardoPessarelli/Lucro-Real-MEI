'use client'
import type { Lead } from '@/lib/leads'
import { STAGE_CONFIG } from '@/lib/leads'

interface Props {
  lead: Lead
  compact?: boolean
  onClick?: () => void
}

function diasAtras(dateStr: string): string {
  const dias = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (dias === 0) return 'hoje'
  if (dias === 1) return 'ontem'
  return `há ${dias} dias`
}

function fmtValor(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function LeadCard({ lead, compact = false, onClick }: Props) {
  const cfg = STAGE_CONFIG[lead.estagio]
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card2 rounded-2xl overflow-hidden"
      style={{ borderLeft: `3px solid ${cfg.color}` }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <p className="font-semibold text-sm text-gray-100 truncate pr-2">{lead.nome}</p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.bg}`}
            style={{ color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
        {(lead.servico || lead.valor != null) && (
          <p className="text-xs text-gray-400 truncate">
            💼 {lead.servico}{lead.servico && lead.valor != null ? ' · ' : ''}
            {lead.valor != null ? `R$ ${fmtValor(lead.valor)}` : ''}
          </p>
        )}
        {!compact && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {lead.origem ? `📍 ${lead.origem} · ` : ''}{diasAtras(lead.created_at)}
          </p>
        )}
        {!compact && lead.prazo && (
          <p className="text-xs text-ambar mt-0.5">⏰ Prazo: {new Date(lead.prazo).toLocaleDateString('pt-BR')}</p>
        )}
      </div>
    </button>
  )
}
