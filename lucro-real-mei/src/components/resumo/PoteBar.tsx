import { formatCurrency } from '@/lib/potes'
interface Props { icon: string; label: string; value: number; total: number; color: string; barColor: string }
export default function PoteBar({ icon, label, value, total, color, barColor }: Props) {
  const pct = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-200 text-sm font-medium">{icon} {label}</span>
        <span className={`font-bold text-sm font-display ${color}`}>{formatCurrency(value)}</span>
      </div>
      <div className="bg-card2 rounded-full h-2">
        <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
