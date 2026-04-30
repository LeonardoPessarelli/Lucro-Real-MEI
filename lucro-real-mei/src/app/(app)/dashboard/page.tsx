'use client'

import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import MetricCards from '@/components/dashboard/MetricCards'
import MetricasFinanceiras from '@/components/dashboard/MetricasFinanceiras'
import PipelineSnapshot from '@/components/dashboard/PipelineSnapshot'
import HistoricoFaturamento from '@/components/dashboard/HistoricoFaturamento'
import NegociosPrazo from '@/components/dashboard/NegociosPrazo'
import {
  calcularMetricasLeads,
  HISTORICO_MOCK,
  FINANCEIRO_MES_MOCK,
} from '@/lib/dashboard-mock'
import { MOCK_LEADS } from '@/lib/leads'

type Tab = 'overview' | 'historico'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',  label: 'Visão Geral' },
  { id: 'historico', label: 'Histórico'   },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const metricas = calcularMetricasLeads(MOCK_LEADS)

  return (
    <div className="px-4 pt-8 space-y-5">
      <PageHeader title="Dashboard" />

      {/* tabs */}
      <div className="flex gap-6 border-b border-[#1a1a1a]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'pb-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-[#4ade80] text-white'
                : 'border-transparent text-gray-400',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* conteúdo */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <MetricCards metricas={metricas} />
          <MetricasFinanceiras financeiro={FINANCEIRO_MES_MOCK} />
          <PipelineSnapshot leads={MOCK_LEADS} />
          <NegociosPrazo leads={MOCK_LEADS} />
        </div>
      )}

      {activeTab === 'historico' && (
        <HistoricoFaturamento historico={HISTORICO_MOCK} />
      )}
    </div>
  )
}
