'use client'
import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { STAGE_ORDER, STAGE_CONFIG } from '@/lib/leads'
import KanbanColumn from './KanbanColumn'
import NegocioModal from './NegocioModal'
import LeadCard from './LeadCard'

interface Props {
  initialLeads: Lead[]
}

const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.3' } },
  }),
}

function StatBox({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: string
}) {
  return (
    <div className="pipeline-stat">
      <p className="pipeline-stat-label">{label}</p>
      <p className="pipeline-stat-value" style={{ color: accent }}>
        {value}
      </p>
      {sub && <p className="pipeline-stat-sub">{sub}</p>}
    </div>
  )
}

export default function KanbanBoard({ initialLeads }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [modal, setModal] = useState<
    { mode: 'new'; estagio: LeadEstagio } | { mode: 'edit'; lead: Lead } | null
  >(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  const activeLead = activeId ? leads.find(l => l.id === activeId) ?? null : null

  // ── Métricas ────────────────────────────────────────────────────────────────
  const abertos  = leads.filter(l => l.estagio !== 'perdido' && l.estagio !== 'fechado')
  const fechados = leads.filter(l => l.estagio === 'fechado')
  const totalAberto  = abertos.reduce((s, l) => s + l.valor, 0)
  const totalFechado = fechados.reduce((s, l) => s + l.valor, 0)
  const totalGeral   = leads.filter(l => l.estagio !== 'perdido').reduce((s, l) => s + l.valor, 0)

  const totalConcluidosOuPerdidos =
    leads.filter(l => l.estagio === 'fechado' || l.estagio === 'perdido').length
  const winRate =
    totalConcluidosOuPerdidos > 0
      ? Math.round((fechados.length / totalConcluidosOuPerdidos) * 100)
      : 0

  function fmt(v: number) {
    return v.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    })
  }

  // ── DnD handlers ───────────────────────────────────────────────────────────
  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e
    if (!over) return
    const aId = String(active.id)
    const oId = String(over.id)
    const aLead = leads.find(l => l.id === aId)
    if (!aLead) return

    if (STAGE_ORDER.includes(oId as LeadEstagio)) {
      const next = oId as LeadEstagio
      if (aLead.estagio !== next)
        setLeads(prev => prev.map(l => l.id === aId ? { ...l, estagio: next } : l))
      return
    }

    const oLead = leads.find(l => l.id === oId)
    if (!oLead || aLead.estagio === oLead.estagio) return
    setLeads(prev => prev.map(l => l.id === aId ? { ...l, estagio: oLead.estagio } : l))
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const aId = String(active.id)
    const oId = String(over.id)
    if (aId === oId) return
    if (STAGE_ORDER.includes(oId as LeadEstagio)) return // mudança já aplicada no handleDragOver

    const aLead = leads.find(l => l.id === aId)
    const oLead = leads.find(l => l.id === oId)
    if (aLead && oLead && aLead.estagio === oLead.estagio) {
      setLeads(prev => {
        const same   = prev.filter(l => l.estagio === aLead.estagio)
        const others = prev.filter(l => l.estagio !== aLead.estagio)
        return [
          ...others,
          ...arrayMove(same, same.findIndex(l => l.id === aId), same.findIndex(l => l.id === oId)),
        ]
      })
    }
  }

  // ── Modal callbacks ─────────────────────────────────────────────────────────
  function handleSave(data: Omit<Lead, 'id' | 'created_at'>) {
    if (!modal) return
    if (modal.mode === 'new') {
      setLeads(prev => [
        { ...data, id: String(Date.now()), created_at: new Date().toISOString() },
        ...prev,
      ])
    } else {
      setLeads(prev => prev.map(l => l.id === modal.lead.id ? { ...l, ...data } : l))
    }
  }

  function handleDelete(id: string) {
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="pipeline-root">
      {/* ── Header do pipeline ────────────────────────────────── */}
      <div className="pipeline-header">
        <div className="pipeline-header-stats">
          <StatBox
            label="Pipeline aberto"
            value={fmt(totalAberto)}
            sub={`${abertos.length} negócio${abertos.length !== 1 ? 's' : ''}`}
          />
          <div className="pipeline-stat-divider" />
          <StatBox
            label="Fechado (mês)"
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

        {/* Barra de progresso geral do pipeline */}
        <div className="pipeline-global-bar">
          {STAGE_ORDER.filter(s => s !== 'perdido').map(estagio => {
            const stageLeads = leads.filter(l => l.estagio === estagio)
            const stageVal = stageLeads.reduce((s, l) => s + l.valor, 0)
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

      {/* ── Board ─────────────────────────────────────────────── */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="pipeline-board">
          {STAGE_ORDER.map((estagio, i) => (
            <KanbanColumn
              key={estagio}
              estagio={estagio}
              leads={leads.filter(l => l.estagio === estagio)}
              onEdit={lead => setModal({ mode: 'edit', lead })}
              onAddNew={est => setModal({ mode: 'new', estagio: est })}
              totalPipeline={totalAberto}
              animationDelay={i * 55}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeLead ? (
            <div style={{ width: 264, transform: 'rotate(2deg)', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' }}>
              <LeadCard lead={activeLead} compact />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* ── Modal ─────────────────────────────────────────────── */}
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
