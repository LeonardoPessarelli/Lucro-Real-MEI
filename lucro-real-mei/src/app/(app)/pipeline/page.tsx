import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { GitBranch } from 'lucide-react'

export default function PipelinePage() {
  return (
    <div>
      <PageHeader
        title="Pipeline"
        description="Acompanhe seus negócios em andamento"
      />
      <EmptyState
        icon={<GitBranch size={22} />}
        title="Em breve"
        description="Kanban com drag-and-drop para mover negócios entre etapas."
      />
    </div>
  )
}
