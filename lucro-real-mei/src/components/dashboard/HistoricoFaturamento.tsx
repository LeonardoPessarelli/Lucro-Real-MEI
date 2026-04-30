import { formatCurrency } from '@/lib/potes'
import type { MesHistorico } from '@/lib/dashboard-mock'

interface Props {
  historico: MesHistorico[]
}

export default function HistoricoFaturamento({ historico }: Props) {
  const maxFaturamento = Math.max(...historico.map(m => m.faturamento), 1)
  const BAR_MAX_HEIGHT = 120
  const BAR_WIDTH = 32
  const GAP = 16
  const LABEL_HEIGHT = 40
  const VALUE_HEIGHT = 20
  const totalWidth = historico.length * (BAR_WIDTH + GAP) - GAP
  const svgHeight = BAR_MAX_HEIGHT + LABEL_HEIGHT + VALUE_HEIGHT

  return (
    <div className="bg-card2 rounded-2xl p-4">
      <p className="text-gray-400 text-xs uppercase tracking-wider mb-6">
        Faturamento — últimos 6 meses
      </p>
      <svg
        viewBox={`0 0 ${totalWidth} ${svgHeight}`}
        width="100%"
        className="overflow-visible"
      >
        {historico.map((mes, i) => {
          const barHeight = Math.max(4, Math.round((mes.faturamento / maxFaturamento) * BAR_MAX_HEIGHT))
          const x = i * (BAR_WIDTH + GAP)
          const barY = VALUE_HEIGHT + (BAR_MAX_HEIGHT - barHeight)
          const opacity = mes.isCurrent ? '1' : '0.45'

          return (
            <g key={mes.mes}>
              {/* valor acima da barra */}
              <text
                x={x + BAR_WIDTH / 2}
                y={VALUE_HEIGHT + (BAR_MAX_HEIGHT - barHeight) - 6}
                textAnchor="middle"
                fontSize="9"
                fill={mes.isCurrent ? '#4ade80' : '#9ca3af'}
              >
                {(mes.faturamento / 1000).toFixed(1)}k
              </text>

              {/* barra */}
              <rect
                x={x}
                y={barY}
                width={BAR_WIDTH}
                height={barHeight}
                rx="6"
                fill="#4ade80"
                opacity={opacity}
              />

              {/* label do mês */}
              <text
                x={x + BAR_WIDTH / 2}
                y={VALUE_HEIGHT + BAR_MAX_HEIGHT + 18}
                textAnchor="middle"
                fontSize="10"
                fill={mes.isCurrent ? '#ffffff' : '#6b7280'}
                fontWeight={mes.isCurrent ? '700' : '400'}
              >
                {mes.mes}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="mt-4 pt-4 border-t border-[#1a1a1a] flex justify-between text-xs text-gray-400">
        <span>Mês atual</span>
        <span className="text-white font-bold">
          {formatCurrency(historico.find(m => m.isCurrent)?.faturamento ?? 0)}
        </span>
      </div>
    </div>
  )
}
