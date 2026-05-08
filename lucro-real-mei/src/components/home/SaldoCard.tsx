import { formatCurrency } from '@/lib/potes'
interface Props { lucro: number; totalEntradas: number; totalLeadsGanhos?: number }
export default function SaldoCard({ lucro, totalEntradas, totalLeadsGanhos = 0 }: Props) {
  return (
    <div className="bg-gradient-to-br from-verde-dark to-verde rounded-3xl p-6 text-center">
      <p className="text-black/70 text-xs font-bold uppercase tracking-widest mb-1">Seu lucro pessoal no mês</p>
      <p className="text-black text-4xl font-black my-1 font-display">{formatCurrency(lucro)}</p>
      <p className="text-black/65 text-xs font-medium">do total de <span className="font-display font-bold">{formatCurrency(totalEntradas)}</span> recebidos</p>
      {totalLeadsGanhos > 0 && (
        <p className="text-black/50 text-[11px] mt-1.5">inclui <span className="font-bold">{formatCurrency(totalLeadsGanhos)}</span> em leads ganhos aguardando lançamento</p>
      )}
    </div>
  )
}
