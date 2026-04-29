'use client'
import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { STAGE_ORDER } from '@/lib/leads'
import KanbanColumn from './KanbanColumn'
import LeadModal from './LeadModal'

interface Props {
  initialLeads: Lead[]
}

export default function KanbanBoard({ initialLeads }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [editando, setEditando] = useState<Lead | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeLead = leads.find(l => l.id === activeId)
    if (!activeLead) return

    // over é uma coluna (estagio)
    if (STAGE_ORDER.includes(overId as LeadEstagio)) {
      const newEstagio = overId as LeadEstagio
      if (activeLead.estagio !== newEstagio) {
        setLeads(prev => prev.map(l => l.id === activeId ? { ...l, estagio: newEstagio } : l))
      }
      return
    }

    // over é outro card — mover para o mesmo estágio do card alvo
    const overLead = leads.find(l => l.id === overId)
    if (!overLead) return
    if (activeLead.estagio !== overLead.estagio) {
      setLeads(prev => prev.map(l => l.id === activeId ? { ...l, estagio: overLead.estagio } : l))
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeLead = leads.find(l => l.id === activeId)
    const overLead = leads.find(l => l.id === overId)

    if (activeLead && overLead && activeLead.estagio === overLead.estagio) {
      setLeads(prev => {
        const stageLeads = prev.filter(l => l.estagio === activeLead.estagio)
        const others     = prev.filter(l => l.estagio !== activeLead.estagio)
        const oldIndex = stageLeads.findIndex(l => l.id === activeId)
        const newIndex = stageLeads.findIndex(l => l.id === overId)
        return [...others, ...arrayMove(stageLeads, oldIndex, newIndex)]
      })
    }
  }

  function handleSave(data: Omit<Lead, 'id' | 'created_at'>) {
    if (!editando) return
    setLeads(prev => prev.map(l => l.id === editando.id ? { ...l, ...data } : l))
  }

  function handleDelete(id: string) {
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  return (
    <>
      <DndContext sensors={sensors} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-120px)] px-4">
          {STAGE_ORDER.map(estagio => (
            <KanbanColumn
              key={estagio}
              estagio={estagio}
              leads={leads.filter(l => l.estagio === estagio)}
              onEdit={setEditando}
            />
          ))}
        </div>
      </DndContext>

      {editando && (
        <LeadModal
          lead={editando}
          onClose={() => setEditando(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}
