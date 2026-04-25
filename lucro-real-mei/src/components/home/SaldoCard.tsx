import { formatCurrency } from '@/lib/potes'
interface Props { lucro: number; totalEntradas: number }
export default function SaldoCard({ lucro, totalEntradas }: Props) {
  return (
    <div className="bg-gradient-to-br from-verde-dark to-verde rounded-3xl p-6 text-center">
      <p className="text-black/50 text-xs font-semibold uppercase tracking-widest mb-1">Seu lucro pessoal no mês</p>
      <p className="text-black text-4xl font-black my-1">{formatCurrency(lucro)}</p>
      <p className="text-black/40 text-xs">do total de {formatCurrency(totalEntradas)} recebidos</p>
    </div>
  )
}
