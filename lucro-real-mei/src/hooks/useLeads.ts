'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { revalidateHome } from '@/app/actions'

export type LeadsState = {
  leads: Lead[]
  loading: boolean
  error: string | null
  createLead: (data: Omit<Lead, 'id' | 'created_at'>) => Promise<void>
  updateLead: (id: string, data: Partial<Omit<Lead, 'id' | 'created_at'>>) => Promise<void>
  deleteLead: (id: string) => Promise<void>
  moveEstagio: (id: string, direcao: 'subir' | 'descer') => Promise<void>
}

const STAGE_ORDER: LeadEstagio[] = ['novo', 'proposta', 'negociacao', 'ganho', 'perdido']

// Converte Row do Supabase (snake_case, tipos exatos) para o tipo Lead do app
function rowToLead(row: Record<string, unknown>): Lead {
  return {
    id:          row.id as string,
    workspace_id: row.workspace_id as string,
    nome:         row.nome as string,
    contato:      (row.contato ?? '') as string,
    valor:        (row.valor as number) ?? 0,
    origem:       (row.origem ?? '') as string,
    servico:      (row.servico ?? '') as string,
    anotacoes:    (row.anotacoes ?? null) as string | null,
    estagio:      row.estagio as LeadEstagio,
    responsavel:  (row.responsavel ?? '') as string,
    prazo:        (row.prazo ?? null) as string | null,
    created_at:   row.created_at as string,
  }
}

export function useLeads(): LeadsState {
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Busca workspace_id do usuário e depois os leads
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Não autenticado')

        const { data: member, error: mErr } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
          .limit(1)
          .single()

        if (mErr || !member) throw new Error('Workspace não encontrado')

        if (!cancelled) setWorkspaceId(member.workspace_id)

        const { data: rows, error: lErr } = await supabase
          .from('leads')
          .select('*')
          .eq('workspace_id', member.workspace_id)
          .order('created_at', { ascending: false })

        if (lErr) throw lErr
        if (!cancelled) setLeads((rows ?? []).map(rowToLead))
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erro ao carregar leads')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const createLead = useCallback(async (data: Omit<Lead, 'id' | 'created_at'>) => {
    if (!workspaceId) return
    const { data: row, error: e } = await supabase
      .from('leads')
      .insert({ ...data, workspace_id: workspaceId })
      .select()
      .single()
    if (e) throw e
    setLeads(prev => [rowToLead(row), ...prev])
  }, [workspaceId])

  const updateLead = useCallback(async (id: string, data: Partial<Omit<Lead, 'id' | 'created_at'>>) => {
    const prev_lead = leads.find(l => l.id === id)
    const { data: row, error: e } = await supabase
      .from('leads')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (e) throw e
    setLeads(prev => prev.map(l => l.id === id ? rowToLead(row) : l))
    // Revalida o Início se o estágio ganho foi afetado
    if (data.estagio !== undefined && (data.estagio === 'ganho' || prev_lead?.estagio === 'ganho')) {
      await revalidateHome()
    }
  }, [leads])

  const deleteLead = useCallback(async (id: string) => {
    const { error: e } = await supabase.from('leads').delete().eq('id', id)
    if (e) throw e
    setLeads(prev => prev.filter(l => l.id !== id))
  }, [])

  const moveEstagio = useCallback(async (id: string, direcao: 'subir' | 'descer') => {
    const lead = leads.find(l => l.id === id)
    if (!lead) return
    const idx = STAGE_ORDER.indexOf(lead.estagio)
    const nextIdx = direcao === 'subir' ? idx - 1 : idx + 1
    if (nextIdx < 0 || nextIdx >= STAGE_ORDER.length) return
    const nextEstagio = STAGE_ORDER[nextIdx]
    await updateLead(id, { estagio: nextEstagio })
    // Revalida o Início sempre que ganho entra ou sai do cálculo
    if (lead.estagio === 'ganho' || nextEstagio === 'ganho') {
      await revalidateHome()
    }
  }, [leads, updateLead])

  return { leads, loading, error, createLead, updateLead, deleteLead, moveEstagio }
}
