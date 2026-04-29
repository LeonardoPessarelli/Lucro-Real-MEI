import { MOCK_LEADS } from '@/lib/leads'
import KanbanBoard from '@/components/leads/KanbanBoard'

export default function PipelinePage() {
  return (
    <div className="pt-4">
      <KanbanBoard initialLeads={MOCK_LEADS} />
    </div>
  )
}
