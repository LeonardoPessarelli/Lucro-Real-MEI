import { formatCurrency } from '@/lib/potes'
import { STAGE_CONFIG, type Lead } from '@/lib/leads'

interface Props {
  leads: Lead[]
}

function diasRestantes(prazo: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const data = new Date(prazo)
  data.setHours(0, 0, 0, 0)
  return Math.round((data.getTime() - hoje.getTime()) / 86400000)
}

export default function NegociosPrazo({ leads }: Props) {
  const comPrazo = leads
    .filter(l => l.prazo && l.estagio !== 'ganho' && l.estagio !== 'perdido')
    .map(l => ({ ...l, dias: diasRestantes(l.prazo!) }))
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 5)

  if (comPrazo.length === 0) return null

  return (
    <div className="bg-card2 rounded-2xl p-4">
      <p className="text-gray-400 text-xs uppercase tracking-wider mb-4">Negócios por prazo</p>
      <div className="space-y-3">
        {comPrazo.map(lead => {
          const urgente = lead.dias <= 3
          const config = STAGE_CONFIG[lead.estagio]
          return (
            <div key={lead.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">{lead.nome}</p>
                <p className="text-xs" style={{ color: config.color }}>{config.label}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-200">{formatCurrency(lead.valor)}</p>
                <p className={`text-xs font-medium ${urgente ? 'text-red-400' : 'text-gray-400'}`}>
                  {lead.dias === 0 ? 'Hoje' : lead.dias === 1 ? 'Amanhã' : `${lead.dias}d`}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
