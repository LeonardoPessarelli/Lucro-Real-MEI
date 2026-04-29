'use client'
import { useState } from 'react'
import { MOCK_LEADS, type Lead, type LeadEstagio } from '@/lib/leads'
import LeadCard from '@/components/leads/LeadCard'
import StageFilter from '@/components/leads/StageFilter'
import LeadModal from '@/components/leads/LeadModal'
import EmptyState from '@/components/ui/EmptyState'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS)
  const [filtro, setFiltro] = useState<LeadEstagio | 'todos'>('todos')
  const [editando, setEditando] = useState<Lead | null | 'novo'>(null)

  const filtered = filtro === 'todos' ? leads : leads.filter(l => l.estagio === filtro)

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
      <StageFilter selected={filtro} onChange={setFiltro} />

      {filtered.length === 0 ? (
        leads.length === 0 ? (
          <EmptyState
            icon="👥"
            title="Nenhum lead ainda"
            description="Toque em + para adicionar seu primeiro lead."
          />
        ) : (
          <p className="text-gray-500 text-sm text-center pt-8">Nenhum lead neste estágio</p>
        )
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => setEditando(lead)}
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
