import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { LayoutDashboard } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu negócio"
      />
      <EmptyState
        icon={<LayoutDashboard size={22} />}
        title="Em breve"
        description="Métricas, gráficos e resumo financeiro chegarão nas próximas aulas."
      />
    </div>
  )
}
