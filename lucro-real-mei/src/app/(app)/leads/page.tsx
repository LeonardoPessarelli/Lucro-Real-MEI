'use client'
import { useState, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import LeadCard from '@/components/leads/LeadCard'
import LeadModal from '@/components/leads/LeadModal'
import StageFilter from '@/components/leads/StageFilter'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { STAGE_ORDER } from '@/lib/leads'

export default function LeadsPage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<LeadEstagio | 'todos'>('todos')
  const [busca, setBusca] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Lead | undefined>()
  const [, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: member } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!member) { setLoading(false); return }

      const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('workspace_id', member.workspace_id)
        .order('created_at', { ascending: false })

      if (!cancelled) { setLeads((data ?? []) as Lead[]); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const counts = STAGE_ORDER.reduce((acc, e) => {
    acc[e] = leads.filter(l => l.estagio === e).length
    return acc
  }, {} as Record<LeadEstagio, number>)

  const visíveis = leads.filter(l => {
    const passaFiltro = filtro === 'todos' || l.estagio === filtro
    const passaBusca = !busca
      || l.nome.toLowerCase().includes(busca.toLowerCase())
      || (l.servico ?? '').toLowerCase().includes(busca.toLowerCase())
    return passaFiltro && passaBusca
  })

  function onSaved(lead: Lead) {
    startTransition(() => {
      setLeads(prev => {
        const idx = prev.findIndex(l => l.id === lead.id)
        if (idx >= 0) { const next = [...prev]; next[idx] = lead; return next }
        return [lead, ...prev]
      })
    })
  }

  function onDeleted(id: string) {
    startTransition(() => setLeads(prev => prev.filter(l => l.id !== id)))
  }

  return (
    <div className="px-4 pt-8 pb-28 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Leads</h1>
        <button onClick={() => { setEditando(undefined); setModalOpen(true) }}
          className="bg-verde text-black text-sm font-bold px-4 py-2 rounded-xl">
          + Novo
        </button>
      </div>

      <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
        placeholder="Buscar por nome ou serviço..."
        className="w-full bg-card2 rounded-xl px-4 py-3 text-sm text-gray-100 outline-none placeholder:text-gray-600" />

      <StageFilter selected={filtro} onChange={setFiltro} counts={counts} />

      {loading && <p className="text-gray-500 text-sm text-center py-8">Carregando...</p>}

      {!loading && visíveis.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">
            {busca || filtro !== 'todos' ? 'Nenhum lead encontrado.' : 'Nenhum lead ainda. Toque em + para adicionar.'}
          </p>
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {visíveis.map(lead => (
            <LeadCard key={lead.id} lead={lead} onClick={() => { setEditando(lead); setModalOpen(true) }} />
          ))}
        </div>
      )}

      {modalOpen && (
        <LeadModal lead={editando} onClose={() => setModalOpen(false)} onSaved={onSaved} onDeleted={onDeleted} />
      )}
    </div>
  )
}
