import { formatCurrency } from '@/lib/potes'
import { getCategoryBySlug } from '@/lib/categories'
import type { Transaction } from '@/types'

function groupByDay(txs: Transaction[]) {
  const groups: Record<string, Transaction[]> = {}
  for (const t of txs) {
    const d = new Date(t.created_at)
    const day = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`
    if (!groups[day]) groups[day] = []
    groups[day].push(t)
  }
  return groups
}

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) return <p className="text-center text-gray-500 text-sm py-8">Nenhum lançamento este mês.</p>
  const groups = groupByDay(transactions)
  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([day, txs]) => (
        <div key={day}>
          <p className="text-gray-500 text-xs capitalize mb-2">{day}</p>
          <div className="bg-card2 rounded-2xl overflow-hidden">
            {txs.map((t, i) => {
              const cat = getCategoryBySlug(t.categoria)
              return (
                <div key={t.id} className={`flex items-center justify-between px-4 py-3 ${i < txs.length - 1 ? 'border-b border-[#222]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat?.icon ?? '💸'}</span>
                    <div>
                      <p className="text-sm text-white">{t.descricao || cat?.label}</p>
                      {t.tipo_gasto && <span className={`text-[10px] ${t.tipo_gasto === 'empresa' ? 'text-ambar' : 'text-gray-500'}`}>{t.tipo_gasto === 'empresa' ? 'Empresa' : 'Pessoal'}</span>}
                    </div>
                  </div>
                  <span className={`font-bold text-sm font-display ${t.tipo === 'entrada' ? 'text-verde' : 'text-vermelho'}`}>
                    {t.tipo === 'entrada' ? '+' : '-'}{formatCurrency(t.valor)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
