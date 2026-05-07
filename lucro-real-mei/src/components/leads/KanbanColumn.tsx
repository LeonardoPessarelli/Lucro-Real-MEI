'use client'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import LeadCard from './LeadCard'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { STAGE_CONFIG } from '@/lib/leads'

function SortableLeadCard({ lead, onEdit }: { lead: Lead; onEdit: (l: Lead) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      {...attributes} {...listeners}>
      <LeadCard lead={lead} compact onClick={() => onEdit(lead)} />
    </div>
  )
}

interface Props {
  estagio: LeadEstagio
  leads: Lead[]
  onEdit: (lead: Lead) => void
}

export default function KanbanColumn({ estagio, leads, onEdit }: Props) {
  const cfg = STAGE_CONFIG[estagio]
  const { setNodeRef, isOver } = useDroppable({ id: estagio })

  return (
    <div className="flex flex-col min-w-[220px] w-[220px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cfg.color }} />
        <p className="text-xs font-semibold text-gray-300 truncate">{cfg.label}</p>
        <span className="text-xs text-gray-500 ml-auto shrink-0">{leads.length}</span>
      </div>
      <div ref={setNodeRef}
        className={`flex-1 min-h-[120px] rounded-2xl p-2 space-y-2 transition-colors ${isOver ? 'bg-card2/80 ring-1 ring-verde/40' : 'bg-card2/30'}`}>
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <SortableLeadCard key={lead.id} lead={lead} onEdit={onEdit} />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <p className="text-center text-gray-600 text-xs pt-6 border border-dashed border-gray-700 rounded-xl py-6">
            Arraste aqui
          </p>
        )}
      </div>
    </div>
  )
}
