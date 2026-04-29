import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { STAGE_CONFIG } from '@/lib/leads'
import LeadCard from './LeadCard'

function SortableLeadCard({ lead, onEdit }: { lead: Lead; onEdit: (l: Lead) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
  const stage = STAGE_CONFIG[estagio]
  const { setNodeRef } = useDroppable({ id: estagio })

  return (
    <div className="flex flex-col min-w-[240px] h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{stage.label}</span>
        <span className="text-xs text-gray-600 ml-auto">{leads.length}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 rounded-xl p-2 min-h-[120px] transition-colors ${
          leads.length === 0 ? 'border border-dashed border-card2' : ''
        }`}
      >
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.length === 0 ? (
            <p className="text-gray-600 text-xs text-center pt-4">Arraste leads aqui</p>
          ) : (
            leads.map(lead => (
              <SortableLeadCard key={lead.id} lead={lead} onEdit={onEdit} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
