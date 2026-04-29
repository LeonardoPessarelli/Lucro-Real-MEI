'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_LEADS, type Lead, type LeadEstagio } from '@/lib/leads'
import LeadCard from '@/components/leads/LeadCard'
import StageFilter from '@/components/leads/StageFilter'
import LeadModal from '@/components/leads/LeadModal'
import EmptyState from '@/components/ui/EmptyState'

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS)
  const [filtro, setFiltro] = useState<LeadEstagio | 'todos'>('todos')
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<Lead | null | 'novo'>(null)

  const filtered = leads
    .filter(l => filtro === 'todos' || l.estagio === filtro)
    .filter(l => l.nome.toLowerCase().includes(busca.toLowerCase()) || l.servico.toLowerCase().includes(busca.toLowerCase()))

  function handleSave(data: Omit<Lead, 'id' | 'created_at'>) {
    if (editando === 'novo') {
      setLeads(prev => [{
        ...data,
        id: String(Date.now()),
        created_at: new Date().toISOString(),
      }, ...prev])
    } else if (editando) {
      setLeads(prev => prev.map(l => l.id === editando.id ? { ...l, ...data } : l))
    }
  }

  function handleDelete(id: string) {
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  return (
    <div className="px-4 pt-6 space-y-4 pb-8">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou serviço..."
          className="w-full bg-card2 rounded-xl pl-9 pr-4 py-3 text-sm text-gray-300 outline-none placeholder:text-gray-600"
        />
        {busca && (
          <button onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">✕</button>
        )}
      </div>

      <StageFilter selected={filtro} onChange={setFiltro} />

      {filtered.length === 0 ? (
        leads.length === 0 ? (
          <EmptyState
            icon="👥"
            title="Nenhum lead ainda"
            description="Toque em + para adicionar seu primeiro lead."
          />
        ) : (
          <p className="text-gray-500 text-sm text-center pt-8">Nenhum lead encontrado</p>
        )
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => router.push(`/leads/${lead.id}`)}
            />
          ))}
        </div>
      )}

      {editando !== null && (
        <LeadModal
          lead={editando === 'novo' ? undefined : editando}
          onClose={() => setEditando(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
