import { formatCurrency } from '@/lib/potes'

interface Props {
  reservaUsadaEmpresa: number
  reservaUsadaPessoal: number
}

export default function AlertaGastos({ reservaUsadaEmpresa, reservaUsadaPessoal }: Props) {
  const total = reservaUsadaEmpresa + reservaUsadaPessoal
  if (total <= 0) return null

  return (
    <div className="bg-vermelho/10 border border-vermelho/20 rounded-2xl p-4 flex gap-3">
      <span className="text-xl">⚠️</span>
      <div>
        <p className="text-vermelho font-semibold text-sm">Reserva sendo usada</p>
        <p className="text-gray-400 text-xs mt-1">
          {formatCurrency(total)} saíram da sua reserva este mês.
        </p>
        {reservaUsadaEmpresa > 0 && (
          <p className="text-gray-500 text-xs mt-0.5">
            · {formatCurrency(reservaUsadaEmpresa)} para cobrir custos do negócio
          </p>
        )}
        {reservaUsadaPessoal > 0 && (
          <p className="text-gray-500 text-xs mt-0.5">
            · {formatCurrency(reservaUsadaPessoal)} para cobrir seu salário
          </p>
        )}
      </div>
    </div>
  )
}
