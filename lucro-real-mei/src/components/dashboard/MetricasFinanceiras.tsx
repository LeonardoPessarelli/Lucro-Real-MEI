import { formatCurrency } from '@/lib/potes'
import type { FinanceiroMes } from '@/lib/dashboard-mock'

interface PoteRowProps {
  icon: string
  label: string
  value: number
  total: number
  color: string
  barColor: string
}

function PoteRow({ icon, label, value, total, color, barColor }: PoteRowProps) {
  const pct = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-200 text-sm font-medium">{icon} {label}</span>
        <span className={`font-bold text-sm ${color}`}>{formatCurrency(value)}</span>
      </div>
      <div className="bg-[#1a1a1a] rounded-full h-2">
        <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

interface Props {
  financeiro: FinanceiroMes
}

export default function MetricasFinanceiras({ financeiro }: Props) {
  return (
    <div className="bg-card2 rounded-2xl p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Faturamento do mês</p>
          <p className="text-3xl font-black text-white">{formatCurrency(financeiro.total_entradas)}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Lucro pessoal</p>
          <p className="text-xl font-black text-[#4ade80]">{formatCurrency(financeiro.lucro_pessoal)}</p>
        </div>
      </div>
      <div className="space-y-3 pt-1">
        <PoteRow
          icon="💼" label="Custos do Negócio"
          value={financeiro.pote_custos_restante} total={financeiro.pote_custos}
          color="text-[#f59e0b]" barColor="bg-[#f59e0b]"
        />
        <PoteRow
          icon="🏦" label="Reserva de Oportunidade"
          value={financeiro.pote_reserva_restante} total={financeiro.pote_reserva}
          color="text-[#818cf8]" barColor="bg-[#818cf8]"
        />
        <PoteRow
          icon="✅" label="Pró-Labore"
          value={financeiro.pote_salario_restante} total={financeiro.pote_salario}
          color="text-[#4ade80]" barColor="bg-[#4ade80]"
        />
      </div>
    </div>
  )
}
