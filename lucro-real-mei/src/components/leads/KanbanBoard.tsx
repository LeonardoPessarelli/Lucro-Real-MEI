'use client'
import { useState } from 'react'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { STAGE_ORDER, STAGE_CONFIG } from '@/lib/leads'
import { useLeads } from '@/hooks/useLeads'
import KanbanColumn from './KanbanColumn'
import NegocioModal from './NegocioModal'

function StatBox({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="pipeline-stat">
      <p className="pipeline-stat-label">{label}</p>
      <p className="pipeline-stat-value" style={{ color: accent }}>{value}</p>
      {sub && <p className="pipeline-stat-sub">{sub}</p>}
    </div>
  )
}

export default function KanbanBoard() {
  const { leads, loading, createLead, updateLead, deleteLead, moveEstagio } = useLeads()
  const [modal, setModal] = useState<
    { mode: 'new'; estagio: LeadEstagio } | { mode: 'edit'; lead: Lead } | null
  >(null)

  const abertos  = leads.filter(l => l.estagio !== 'perdido' && l.estagio !== 'ganho')
  const fechados = leads.filter(l => l.estagio === 'ganho')
  const totalAberto  = abertos.reduce((s, l) => s + l.valor, 0)
  const totalFechado = fechados.reduce((s, l) => s + l.valor, 0)
  const totalGeral   = leads.filter(l => l.estagio !== 'perdido').reduce((s, l) => s + l.valor, 0)
  const totalConcluidosOuPerdidos = leads.filter(l => l.estagio === 'ganho' || l.estagio === 'perdido').length
  const winRate = totalConcluidosOuPerdidos > 0
    ? Math.round((fechados.length / totalConcluidosOuPerdidos) * 100)
    : 0

  function fmt(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  }

  async function handleSave(data: Omit<Lead, 'id' | 'created_at' | 'workspace_id'>) {
    if (!modal) return
    if (modal.mode === 'new') {
      await createLead({ ...data, estagio: modal.estagio ?? data.estagio } as Omit<Lead, 'id' | 'created_at'>)
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
    <div className="pipeline-root">
      <div className="pipeline-header">
        <div className="pipeline-header-stats">
          <StatBox
            label="Pipeline aberto"
            value={fmt(totalAberto)}
            sub={`${abertos.length} negócio${abertos.length !== 1 ? 's' : ''}`}
          />
          <div className="pipeline-stat-divider" />
          <StatBox
            label="Ganhos (mês)"
            value={fmt(totalFechado)}
            sub={`${fechados.length} negócio${fechados.length !== 1 ? 's' : ''}`}
            accent="#4ade80"
          />
          <div className="pipeline-stat-divider" />
          <StatBox
            label="Win rate"
            value={`${winRate}%`}
            sub={`${fechados.length}/${totalConcluidosOuPerdidos} fechados`}
            accent={winRate >= 50 ? '#4ade80' : '#f59e0b'}
          />
        </div>

        <div className="pipeline-global-bar">
          {STAGE_ORDER.filter(s => s !== 'perdido').map(estagio => {
            const stageVal = leads.filter(l => l.estagio === estagio).reduce((s, l) => s + l.valor, 0)
            const pct = totalGeral > 0 ? (stageVal / totalGeral) * 100 : 0
            const stage = STAGE_CONFIG[estagio]
            return pct > 0 ? (
              <div
                key={estagio}
                className="pipeline-global-bar-segment"
                style={{ width: `${pct}%`, backgroundColor: stage.color }}
                title={`${stage.label}: ${Math.round(pct)}%`}
              />
            ) : null
          })}
        </div>

        <button
          className="pipeline-new-btn"
          onClick={() => setModal({ mode: 'new', estagio: 'novo' })}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Novo negócio
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm text-center py-12">Carregando...</p>
      ) : (
        <div className="px-4 pb-8 space-y-3 mt-2">
          {STAGE_ORDER.map((estagio, i) => (
            <KanbanColumn
              key={estagio}
              estagio={estagio}
              leads={leads.filter(l => l.estagio === estagio)}
              totalPipeline={totalAberto}
              isFirst={i === 0}
              isLast={i === STAGE_ORDER.length - 1}
              onEdit={lead => setModal({ mode: 'edit', lead })}
              onAddNew={est => setModal({ mode: 'new', estagio: est })}
              onMover={moveEstagio}
            />
          ))}
        </div>
      )}

      {modal && (
        <NegocioModal
          mode={modal.mode}
          lead={modal.mode === 'edit' ? modal.lead : undefined}
          defaultEstagio={modal.mode === 'new' ? modal.estagio : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
