import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { Users } from 'lucide-react'

export default function LeadsPage() {
  return (
    <div>
      <PageHeader
        title="Leads"
        description="Gerencie seus potenciais clientes"
      />
      <EmptyState
        icon={<Users size={22} />}
        title="Em breve"
        description="Lista de leads com busca, filtros e formulário de cadastro."
      />
    </div>
  )
}
