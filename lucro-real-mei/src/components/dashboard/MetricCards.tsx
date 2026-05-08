import { formatCurrency } from '@/lib/potes'
import type { MetricasLeads } from '@/lib/dashboard-mock'

interface CardConfig {
  icon: string
  label: string
  value: string
  color: string
}

interface Props {
  metricas: MetricasLeads
}

function buildCards(metricas: MetricasLeads): CardConfig[] {
  return [
    {
      icon: '👥',
      label: 'TOTAL DE LEADS',
      value: String(metricas.totalLeads),
      color: '#818cf8',
    },
    {
      icon: '💼',
      label: 'NEGÓCIOS ABERTOS',
      value: String(metricas.negociosAbertos),
      color: '#3b82f6',
    },
    {
      icon: '💰',
      label: 'VALOR PIPELINE',
      value: formatCurrency(metricas.valorPipeline),
      color: '#22d3ee',
    },
    {
      icon: '📈',
      label: 'TAXA CONVERSÃO',
      value: metricas.taxaConversao === null ? '—' : `${metricas.taxaConversao}%`,
      color: '#4ade80',
    },
  ]
}

export default function MetricCards({ metricas }: Props) {
  const cards = buildCards(metricas)

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-card2 rounded-2xl overflow-hidden">
          <div
            className="h-[3px]"
            style={{ background: `linear-gradient(90deg, ${card.color}, transparent)` }}
          />
          <div className="p-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3"
              style={{ backgroundColor: `${card.color}20` }}
            >
              {card.icon}
            </div>
            <p className="font-black text-2xl leading-none mb-1" style={{ color: card.color }}>
              {card.value}
            </p>
            <p className="text-xs uppercase tracking-wider text-gray-400">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
