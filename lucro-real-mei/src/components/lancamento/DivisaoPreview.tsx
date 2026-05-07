import { formatCurrency } from '@/lib/potes'
interface Props { valor: number; custos_pct: number; reserva_pct: number; salario_pct: number }
export default function DivisaoPreview({ valor, custos_pct, reserva_pct, salario_pct }: Props) {
  if (valor <= 0) return null
  const items = [
    { label: 'Custos (empresa)', pct: custos_pct, color: 'text-ambar', icon: '💼' },
    { label: 'Reserva', pct: reserva_pct, color: 'text-roxo', icon: '🏦' },
    { label: 'Pró-Labore', pct: salario_pct, color: 'text-verde', icon: '✅' },
  ]
  return (
    <div className="bg-card2 rounded-2xl p-4 space-y-2">
      <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Divisão automática</p>
      {items.map(({ label, pct, color, icon }) => (
        <div key={label} className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">{icon} {label} ({pct}%)</span>
          <span className={`font-bold text-sm ${color}`}>{formatCurrency((valor * pct) / 100)}</span>
        </div>
      ))}
    </div>
  )
}
