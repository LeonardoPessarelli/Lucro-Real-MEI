'use client'
import { useState } from 'react'
import { type Lead, type LeadEstagio } from '@/lib/leads'
import { useLeads } from '@/hooks/useLeads'
import LeadCard from '@/components/leads/LeadCard'
import StageFilter from '@/components/leads/StageFilter'
import NegocioModal from '@/components/leads/NegocioModal'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'

export default function LeadsPage() {
  const { leads, loading, createLead, updateLead, deleteLead } = useLeads()
  const [filtro, setFiltro] = useState<LeadEstagio | 'todos'>('todos')
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState<{ mode: 'new' } | { mode: 'edit'; lead: Lead } | null>(null)

  const filtered = leads
    .filter(l => filtro === 'todos' || l.estagio === filtro)
    .filter(l =>
      l.nome.toLowerCase().includes(busca.toLowerCase()) ||
      l.servico.toLowerCase().includes(busca.toLowerCase())
    )

  async function handleSave(data: Omit<Lead, 'id' | 'created_at' | 'workspace_id'>) {
    if (!modal) return
    if (modal.mode === 'new') {
      await createLead(data as Omit<Lead, 'id' | 'created_at'>)
    } else {
      await updateLead(modal.lead.id, data)
    }
    setModal(null)
  }

  async function handleDelete(id: string) {
    await deleteLead(id)
    setModal(null)
  }

  return (
    <div className="px-4 pt-6 space-y-4 pb-8">
      <PageHeader
        title="Leads"
        action={
          <button
            onClick={() => setModal({ mode: 'new' })}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-verde text-black text-xl font-bold leading-none"
          >
            +
          </button>
        }
      />

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

      {loading ? (
        <p className="text-gray-500 text-sm text-center pt-8">Carregando...</p>
      ) : filtered.length === 0 ? (
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
              onClick={() => setModal({ mode: 'edit', lead })}
            />
          ))}
        </div>
      )}

      {modal && (
        <NegocioModal
          mode={modal.mode}
          lead={modal.mode === 'edit' ? modal.lead : undefined}
          defaultEstagio="novo"
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
