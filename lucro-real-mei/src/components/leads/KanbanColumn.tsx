'use client'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { STAGE_CONFIG } from '@/lib/leads'
import LeadCard from './LeadCard'

// ─── Sortable wrapper ────────────────────────────────────────────────────────
function SortableLeadCard({
  lead,
  onEdit,
}: {
  lead: Lead
  onEdit: (l: Lead) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      <LeadCard lead={lead} compact onClick={() => onEdit(lead)} />
    </div>
  )
}

// ─── Column ──────────────────────────────────────────────────────────────────
interface Props {
  estagio: LeadEstagio
  leads: Lead[]
  onEdit: (lead: Lead) => void
  onAddNew: (estagio: LeadEstagio) => void
  totalPipeline: number   // soma de TODOS os negócios abertos — para a barra %
  animationDelay?: number
}

function fmt(v: number) {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export default function KanbanColumn({
  estagio,
  leads,
  onEdit,
  onAddNew,
  totalPipeline,
  animationDelay = 0,
}: Props) {
  const stage = STAGE_CONFIG[estagio]
  const { setNodeRef, isOver } = useDroppable({ id: estagio })

  const totalValor = leads.reduce((acc, l) => acc + l.valor, 0)
  const pct = totalPipeline > 0 ? Math.round((totalValor / totalPipeline) * 100) : 0
  const isPerdido = estagio === 'perdido'
  const isFechado = estagio === 'fechado'

  return (
    <div
      className="pipeline-column"
      style={{
        animation: 'fadeSlideUp 0.35s ease both',
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="pipeline-col-header"
        style={{ borderTopColor: stage.color }}
      >
        {/* linha de cor no topo */}
        <div
          className="pipeline-col-topbar"
          style={{ backgroundColor: stage.color }}
        />

        <div className="pipeline-col-header-inner">
          {/* label + count */}
          <div className="pipeline-col-title-row">
            <span
              className="pipeline-col-label"
              style={{ color: isPerdido ? '#6b7280' : stage.color }}
            >
              {stage.label}
            </span>
            <span
              className="pipeline-col-count"
              style={{ backgroundColor: stage.bgColor, color: stage.color }}
            >
              {leads.length}
            </span>
          </div>

          {/* valor total + % do pipeline */}
          <div className="pipeline-col-value-row">
            <span
              className="pipeline-col-value"
              style={{
                color: isFechado ? '#4ade80' : isPerdido ? '#6b7280' : '#e5e7eb',
              }}
            >
              {leads.length > 0 ? fmt(totalValor) : '—'}
            </span>
            {!isPerdido && !isFechado && leads.length > 0 && (
              <span className="pipeline-col-pct">{pct}%</span>
            )}
          </div>

          {/* mini barra de progresso */}
          {!isPerdido && !isFechado && (
            <div className="pipeline-col-bar-track">
              <div
                className="pipeline-col-bar-fill"
                style={{
                  width: `${pct}%`,
                  backgroundColor: stage.color,
                  opacity: 0.7,
                }}
              />
            </div>
          )}
        </div>

        {/* Botão + */}
        <button
          className="pipeline-col-add-btn"
          onClick={() => onAddNew(estagio)}
          title={`Novo negócio em ${stage.label}`}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── Drop zone ──────────────────────────────────────────── */}
      <div
        ref={setNodeRef}
        className="pipeline-col-dropzone"
        style={{
          borderColor: isOver ? `${stage.color}60` : 'rgba(255,255,255,0.05)',
          backgroundColor: isOver
            ? `${stage.color}06`
            : isFechado
            ? 'rgba(74,222,128,0.015)'
            : 'rgba(255,255,255,0.008)',
        }}
      >
        <SortableContext
          items={leads.map(l => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.length === 0 ? (
            <div className="pipeline-col-empty">
              <div
                className="pipeline-col-empty-icon"
                style={{ borderColor: `${stage.color}30` }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stage.color} strokeWidth="1.5" opacity="0.4">
                  <circle cx="12" cy="12" r="9" strokeDasharray="4 3"/>
                  <path d="M12 8v8M8 12h8" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="pipeline-col-empty-text">Solte aqui</p>
            </div>
          ) : (
            <div className="pipeline-col-cards">
              {leads.map(lead => (
                <SortableLeadCard key={lead.id} lead={lead} onEdit={onEdit} />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
