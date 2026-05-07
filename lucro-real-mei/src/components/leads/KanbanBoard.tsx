'use client'
import { useState, useTransition } from 'react'
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import KanbanColumn from './KanbanColumn'
import LeadModal from './LeadModal'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { STAGE_ORDER } from '@/lib/leads'
import { moveLeadEstagioAction } from '@/lib/actions/leads'

interface Props {
  initialLeads: Lead[]
}

export default function KanbanBoard({ initialLeads }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [editando, setEditando] = useState<Lead | undefined>()
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const leadId = active.id as string
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return

    // over.id pode ser um estagio (coluna) ou um lead.id (card dentro de coluna)
    const targetEstagio = STAGE_ORDER.includes(over.id as LeadEstagio)
      ? (over.id as LeadEstagio)
      : leads.find(l => l.id === over.id)?.estagio

    if (!targetEstagio || targetEstagio === lead.estagio) return

    // Atualização otimista
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, estagio: targetEstagio } : l))

    startTransition(async () => {
      const { error } = await moveLeadEstagioAction(leadId, targetEstagio)
      if (error) {
        // Reverte em caso de erro
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, estagio: lead.estagio } : l))
      }
    })
  }

  function onSaved(updated: Lead) {
    startTransition(() => {
      setLeads(prev => {
        const idx = prev.findIndex(l => l.id === updated.id)
        if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next }
        return [updated, ...prev]
      })
    })
  }

  function onDeleted(id: string) {
    startTransition(() => setLeads(prev => prev.filter(l => l.id !== id)))
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-4">
          {STAGE_ORDER.map(estagio => (
            <KanbanColumn
              key={estagio}
              estagio={estagio}
              leads={leads.filter(l => l.estagio === estagio)}
              onEdit={lead => setEditando(lead)}
            />
          ))}
        </div>
      </DndContext>

      {editando && (
        <LeadModal
          lead={editando}
          onClose={() => setEditando(undefined)}
          onSaved={onSaved}
          onDeleted={onDeleted}
        />
      )}
    </>
  )
}
