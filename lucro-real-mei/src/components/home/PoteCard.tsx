import { formatCurrency } from '@/lib/potes'
interface Props { icon: string; label: string; value: number; total: number; color: string; barColor: string }
export default function PoteCard({ icon, label, value, total, color, barColor }: Props) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0
  return (
    <div className="bg-card2 rounded-2xl p-4">
      <div className="flex justify-between items-start mb-3">
        <p className="text-gray-400 text-xs uppercase tracking-wider">{icon} {label}</p>
        <span className={`text-lg font-bold ${color}`}>{formatCurrency(value)}</span>
      </div>
      <div className="bg-[#111] rounded-full h-1">
        <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
