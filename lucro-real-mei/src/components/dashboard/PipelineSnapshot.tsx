import { formatCurrency } from '@/lib/potes'
import { STAGE_CONFIG, STAGE_ORDER, type Lead } from '@/lib/leads'

interface Props {
  leads: Lead[]
}

export default function PipelineSnapshot({ leads }: Props) {
  const porEstagio = STAGE_ORDER.map(estagio => {
    const grupo = leads.filter(l => l.estagio === estagio)
    return {
      estagio,
      label: STAGE_CONFIG[estagio].label,
      color: STAGE_CONFIG[estagio].color,
      count: grupo.length,
      valor: grupo.reduce((s, l) => s + l.valor, 0),
    }
  })

  const maxValor = Math.max(...porEstagio.map(e => e.valor), 1)

  return (
    <div className="bg-card2 rounded-2xl p-4">
      <p className="text-gray-400 text-xs uppercase tracking-wider mb-4">Pipeline por estágio</p>
      <div className="space-y-3">
        {porEstagio.map(({ estagio, label, color, count, valor }) => {
          const pct = Math.round((valor / maxValor) * 100)
          return (
            <div key={estagio}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-200 font-medium">{label}</span>
                <span className="text-gray-400">
                  {count} lead{count !== 1 ? 's' : ''} · {formatCurrency(valor)}
                </span>
              </div>
              <div className="bg-[#1a1a1a] rounded-full h-1.5">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
