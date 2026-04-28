import { formatCurrency } from '@/lib/potes'
import { getCategoryBySlug } from '@/lib/categories'
import type { Transaction } from '@/types'
export default function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) return (
    <div className="text-center py-6">
      <p className="text-gray-500 text-sm">Nenhum lançamento ainda.</p>
      <p className="text-gray-600 text-xs mt-1">Toque no + para registrar</p>
    </div>
  )
  return (
    <div className="bg-card2 rounded-2xl overflow-hidden">
      {transactions.map((t, i) => {
        const cat = getCategoryBySlug(t.categoria)
        return (
          <div key={t.id} className={`flex items-center justify-between px-4 py-3 ${i < transactions.length - 1 ? 'border-b border-[#222]' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{cat?.icon ?? '💸'}</span>
              <div>
                <p className="text-sm text-white font-medium">{t.descricao || cat?.label}</p>
                <p className="text-xs text-gray-400">{(() => { const d = new Date(t.created_at); return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}` })()}</p>
              </div>
            </div>
            <span className={`font-bold text-sm font-display ${t.tipo === 'entrada' ? 'text-verde' : 'text-vermelho'}`}>
              {t.tipo === 'entrada' ? '+' : '-'}{formatCurrency(t.valor)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
