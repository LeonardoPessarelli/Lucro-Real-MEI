import { formatCurrency } from '@/lib/potes'
export default function AlertaGastos({ saidasPessoal }: { saidasPessoal: number }) {
  if (saidasPessoal <= 0) return null
  return (
    <div className="bg-vermelho/10 border border-vermelho/20 rounded-2xl p-4 flex gap-3">
      <span className="text-xl">⚠️</span>
      <div>
        <p className="text-vermelho font-semibold text-sm">Atenção nos gastos pessoais</p>
        <p className="text-gray-400 text-xs mt-1">Você gastou {formatCurrency(saidasPessoal)} do seu salário em despesas pessoais este mês.</p>
      </div>
    </div>
  )
}
