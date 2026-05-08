'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { STAGE_CONFIG, STAGE_ORDER, type Lead } from '@/lib/leads'
import { useLeads } from '@/hooks/useLeads'
import NegocioModal from '@/components/leads/NegocioModal'

function diasAtrasTexto(n: number) {
  if (n === 0) return 'hoje'
  if (n === 1) return 'ontem'
  return `há ${n} dias`
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { leads, loading, updateLead, deleteLead } = useLeads()
  const [editando, setEditando] = useState(false)

  if (loading) {
    return <div className="px-4 pt-16 text-center"><p className="text-gray-500 text-sm">Carregando...</p></div>
  }

  const lead = leads.find(l => l.id === id)

  if (!lead) {
    return (
      <div className="px-4 pt-16 text-center">
        <p className="text-gray-500 text-sm">Lead não encontrado.</p>
        <button onClick={() => router.back()} className="mt-4 text-verde text-sm">← Voltar</button>
      </div>
    )
  }

  const stage = STAGE_CONFIG[lead.estagio]
  const stageIndex = STAGE_ORDER.indexOf(lead.estagio)
  const diasCriado = Math.floor((Date.now() - new Date(lead.created_at).getTime()) / 86400000)

  async function handleSave(data: Omit<Lead, 'id' | 'created_at' | 'workspace_id'>) {
    await updateLead(id, data)
    setEditando(false)
  }

  async function handleDelete(deletedId: string) {
    await deleteLead(deletedId)
    router.back()
  }

  return (
    <div className="pb-10">
      <div className="px-4 pt-6 pb-4" style={{ borderBottom: `2px solid ${stage.color}22` }}>
        <button onClick={() => router.back()} className="text-gray-500 text-sm mb-3 flex items-center gap-1">
          ← Leads
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white text-lg leading-tight truncate">{lead.nome}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{lead.servico}</p>
          </div>
          <span
            className="text-xs px-3 py-1 rounded-full font-semibold shrink-0 mt-0.5"
            style={{ color: stage.color, backgroundColor: stage.bgColor }}
          >
            {stage.label}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-card2 rounded-xl px-3 py-2.5">
            <p className="text-gray-500 text-xs">Valor estimado</p>
            <p className="text-white font-bold text-sm mt-0.5">
              {lead.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <div className="bg-card2 rounded-xl px-3 py-2.5">
            <p className="text-gray-500 text-xs">Origem</p>
            <p className="text-white font-bold text-sm mt-0.5">{lead.origem}</p>
          </div>
          {lead.contato && (
            <div className="bg-card2 rounded-xl px-3 py-2.5 col-span-2">
              <p className="text-gray-500 text-xs">Contato</p>
              <p className="text-white font-bold text-sm mt-0.5">{lead.contato}</p>
            </div>
          )}
        </div>

        {lead.anotacoes && (
          <div className="mt-3 bg-card2 rounded-xl px-3 py-2.5">
            <p className="text-gray-500 text-xs mb-1">Anotações</p>
            <p className="text-gray-300 text-sm leading-relaxed">{lead.anotacoes}</p>
          </div>
        )}
      </div>

      {/* Progresso do funil */}
      <div className="px-4 pt-5">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Progresso no funil</p>
        <div className="flex items-center gap-0">
          {STAGE_ORDER.filter(s => s !== 'perdido').map((s, i) => {
            const isActive = lead.estagio === 'perdido' ? false : i <= stageIndex
            const isCurrent = lead.estagio !== 'perdido' && s === lead.estagio
            const cfg = STAGE_CONFIG[s]
            return (
              <div key={s} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className="w-3 h-3 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: isActive ? cfg.color : 'transparent',
                      borderColor: isActive ? cfg.color : '#374151',
                      boxShadow: isCurrent ? `0 0 8px ${cfg.color}88` : 'none',
                    }}
                  />
                  <p className="text-gray-600 text-[10px] mt-1 text-center leading-tight" style={{ color: isCurrent ? cfg.color : undefined }}>
                    {cfg.label}
                  </p>
                </div>
                {i < STAGE_ORDER.filter(s => s !== 'perdido').length - 1 && (
                  <div
                    className="h-0.5 flex-1 -mt-4"
                    style={{ backgroundColor: isActive && lead.estagio !== 'perdido' && i < stageIndex ? STAGE_CONFIG[STAGE_ORDER[i + 1]].color : '#1f2937' }}
                  />
                )}
              </div>
            )
          })}
        </div>
        {lead.estagio === 'perdido' && (
          <p className="text-center text-red-400 text-xs mt-3 font-medium">Lead marcado como perdido</p>
        )}
      </div>

      {/* Criado há */}
      <div className="px-4 pt-6">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Histórico</p>
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-800" />
          <div className="flex gap-4 items-start">
            <div className="w-3.5 h-3.5 rounded-full border-2 shrink-0 mt-0.5 z-10"
              style={{ backgroundColor: stage.color, borderColor: stage.color }} />
            <div>
              <p className="text-white text-sm font-medium">Lead criado</p>
              <p className="text-gray-500 text-xs mt-0.5">{diasAtrasTexto(diasCriado)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão editar */}
      <div className="px-4 pt-8">
        <button
          onClick={() => setEditando(true)}
          className="w-full bg-card2 text-white py-4 rounded-2xl font-semibold text-sm border border-gray-700"
        >
          Editar lead
        </button>
      </div>

      {editando && (
        <NegocioModal
          mode="edit"
          lead={lead}
          onClose={() => setEditando(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
