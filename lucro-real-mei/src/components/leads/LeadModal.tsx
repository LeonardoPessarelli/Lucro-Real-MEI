'use client'
import { useState, useTransition } from 'react'
import { STAGE_ORDER, STAGE_CONFIG, ORIGENS, type Lead, type LeadEstagio } from '@/lib/leads'
import { createLeadAction, updateLeadAction, deleteLeadAction } from '@/lib/actions/leads'

type FormData = {
  nome: string
  contato: string
  valor: string
  origem: string
  servico: string
  anotacoes: string
  estagio: LeadEstagio
}

interface Props {
  lead?: Lead
  onClose: () => void
  onSaved?: (lead: Lead) => void
  onDeleted?: (id: string) => void
}

const EMPTY: FormData = { nome: '', contato: '', valor: '', origem: 'Instagram', servico: '', anotacoes: '', estagio: 'novo' }

export default function LeadModal({ lead, onClose, onSaved, onDeleted }: Props) {
  const isEdit = !!lead
  const [form, setForm] = useState<FormData>(
    lead ? { nome: lead.nome, contato: lead.contato, valor: lead.valor > 0 ? String(lead.valor) : '', origem: lead.origem, servico: lead.servico, anotacoes: lead.anotacoes ?? '', estagio: lead.estagio } : EMPTY
  )
  const [erro, setErro] = useState('')
  const [isPending, startTransition] = useTransition()

  function set(key: keyof FormData, value: string) { setForm(f => ({ ...f, [key]: value })) }

  function validar(): string | null {
    if (!form.nome.trim()) return 'Nome é obrigatório'
    if (!form.contato.trim()) return 'Contato é obrigatório'
    if (!form.servico.trim()) return 'Serviço é obrigatório'
    const v = parseFloat(form.valor.replace(',', '.'))
    if (form.valor && (isNaN(v) || v < 0)) return 'Valor inválido'
    return null
  }

  function salvar() {
    const err = validar()
    if (err) { setErro(err); return }
    setErro('')
    const payload = {
      nome: form.nome.trim(),
      contato: form.contato.trim(),
      valor: form.valor ? parseFloat(form.valor.replace(',', '.')) : 0,
      origem: form.origem,
      servico: form.servico.trim(),
      anotacoes: form.anotacoes.trim() || null,
      estagio: form.estagio,
    }
    startTransition(async () => {
      if (isEdit) {
        const { error } = await updateLeadAction(lead!.id, payload)
        if (error) { setErro(error); return }
        onSaved?.({ ...lead!, ...payload })
      } else {
        const { data, error } = await createLeadAction(payload)
        if (error) { setErro(error); return }
        if (data) onSaved?.(data)
      }
      onClose()
    })
  }

  function excluir() {
    if (!isEdit) return
    startTransition(async () => {
      const { error } = await deleteLeadAction(lead!.id)
      if (error) { setErro(error); return }
      onDeleted?.(lead!.id)
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-bg w-full max-w-md rounded-t-3xl p-6 space-y-4 max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <button onClick={onClose} className="text-gray-500 text-sm">Cancelar</button>
          <h2 className="font-bold">{isEdit ? 'Editar Lead' : 'Novo Lead'}</h2>
          {isEdit
            ? <button onClick={excluir} disabled={isPending} className="text-vermelho text-sm">Excluir</button>
            : <div className="w-14" />}
        </div>

        <div>
          <p className="text-gray-500 text-xs mb-1">Nome / Empresa *</p>
          <input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Maria Boutique"
            className="w-full bg-card2 rounded-xl px-4 py-3 text-sm text-gray-100 outline-none placeholder:text-gray-600" />
        </div>

        <div>
          <p className="text-gray-500 text-xs mb-1">Contato *</p>
          <input value={form.contato} onChange={e => set('contato', e.target.value)} placeholder="WhatsApp, e-mail ou telefone"
            className="w-full bg-card2 rounded-xl px-4 py-3 text-sm text-gray-100 outline-none placeholder:text-gray-600" />
        </div>

        <div>
          <p className="text-gray-500 text-xs mb-1">Serviço de interesse *</p>
          <input value={form.servico} onChange={e => set('servico', e.target.value)} placeholder="Ex: Design de logo"
            className="w-full bg-card2 rounded-xl px-4 py-3 text-sm text-gray-100 outline-none placeholder:text-gray-600" />
        </div>

        <div>
          <p className="text-gray-500 text-xs mb-1">Valor estimado (R$)</p>
          <input value={form.valor} onChange={e => set('valor', e.target.value)} placeholder="0,00" inputMode="decimal"
            className="w-full bg-card2 rounded-xl px-4 py-3 text-sm text-gray-100 outline-none placeholder:text-gray-600" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-gray-500 text-xs mb-1">Origem</p>
            <select value={form.origem} onChange={e => set('origem', e.target.value)}
              className="w-full bg-card2 rounded-xl px-4 py-3 text-sm text-gray-100 outline-none">
              {ORIGENS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Estágio</p>
            <select value={form.estagio} onChange={e => set('estagio', e.target.value as LeadEstagio)}
              className="w-full bg-card2 rounded-xl px-4 py-3 text-sm text-gray-100 outline-none">
              {STAGE_ORDER.map(s => <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <p className="text-gray-500 text-xs mb-1">Anotações</p>
          <textarea value={form.anotacoes} onChange={e => set('anotacoes', e.target.value)} rows={3} placeholder="Notas sobre o lead..."
            className="w-full bg-card2 rounded-xl px-4 py-3 text-sm text-gray-100 outline-none placeholder:text-gray-600 resize-none" />
        </div>

        {erro && <p className="text-vermelho text-xs text-center">{erro}</p>}

        <button onClick={salvar} disabled={isPending}
          className="w-full bg-verde text-black py-4 rounded-2xl font-bold text-sm disabled:opacity-50">
          {isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar lead'}
        </button>
      </div>
    </div>
  )
}
