'use client'
import { useState, useTransition } from 'react'
import LeadCard from './LeadCard'
import LeadModal from './LeadModal'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { STAGE_ORDER, STAGE_CONFIG } from '@/lib/leads'
import { moveLeadEstagioAction } from '@/lib/actions/leads'

interface Props {
  initialLeads: Lead[]
}

export default function PipelineClient({ initialLeads }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [editando, setEditando] = useState<Lead | undefined>()
  const [, startTransition] = useTransition()

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

  function moverEstagio(lead: Lead, novoEstagio: LeadEstagio) {
    if (lead.estagio === novoEstagio) return
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, estagio: novoEstagio } : l))
    startTransition(async () => {
      const { error } = await moveLeadEstagioAction(lead.id, novoEstagio)
      if (error) {
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, estagio: lead.estagio } : l))
      }
    })
  }

  return (
    <>
      <div className="space-y-6">
        {STAGE_ORDER.map(estagio => {
          const cfg = STAGE_CONFIG[estagio]
          const grupo = leads.filter(l => l.estagio === estagio)
          return (
            <div key={estagio}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cfg.color }} />
                <p className="text-xs font-semibold text-gray-300">{cfg.label}</p>
                <span className="text-xs text-gray-500 ml-1">{grupo.length}</span>
              </div>

              {grupo.length === 0 ? (
                <div className="border border-dashed border-gray-700 rounded-2xl py-5 text-center">
                  <p className="text-gray-600 text-xs">Nenhum lead neste estágio</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {grupo.map(lead => (
                    <div key={lead.id}>
                      <LeadCard lead={lead} onClick={() => setEditando(lead)} />
                      <div className="flex gap-1 mt-1 px-1 flex-wrap">
                        {STAGE_ORDER.filter(e => e !== estagio).map(e => (
                          <button key={e} onClick={() => moverEstagio(lead, e)}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-card2 text-gray-500 hover:text-gray-300 transition-colors">
                            → {STAGE_CONFIG[e].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

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
