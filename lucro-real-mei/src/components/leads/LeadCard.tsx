import type { Lead } from '@/lib/leads'
import { STAGE_CONFIG } from '@/lib/leads'

function diasAtras(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'ontem'
  return `há ${diff} dias`
}

interface Props {
  lead: Lead
  onClick?: () => void
  compact?: boolean
}

export default function LeadCard({ lead, onClick, compact = false }: Props) {
  const stage = STAGE_CONFIG[lead.estagio]

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card rounded-xl overflow-hidden"
      style={{ borderLeft: `3px solid ${stage.color}` }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-white text-sm truncate">{lead.nome}</span>
          {!compact && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
              style={{ color: stage.color, backgroundColor: stage.bgColor }}
            >
              {stage.label}
            </span>
          )}
        </div>
        <p className="text-gray-400 text-xs mt-1">
          💼 {lead.servico} · {lead.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
        {!compact && (
          <p className="text-gray-600 text-xs mt-0.5">
            📍 {lead.origem} · {diasAtras(lead.created_at)}
          </p>
        )}
      </div>
    </button>
  )
}
