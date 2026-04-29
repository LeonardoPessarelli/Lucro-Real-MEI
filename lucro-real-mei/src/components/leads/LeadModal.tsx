'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { STAGE_ORDER, STAGE_CONFIG } from '@/lib/leads'

const schema = z.object({
  nome:        z.string().min(1, 'Nome obrigatório'),
  contato:     z.string().min(1, 'Contato obrigatório'),
  valor:       z.string().min(1, 'Informe um valor').refine(v => !isNaN(Number(v)) && Number(v) >= 0, { message: 'Valor inválido' }),
  origem:      z.string().min(1, 'Selecione a origem'),
  servico:     z.string().min(1, 'Serviço obrigatório'),
  responsavel: z.string().min(1, 'Responsável obrigatório'),
  prazo:       z.string().optional(),
  anotacoes:   z.string().optional(),
  estagio:     z.enum(['novo', 'em_contato', 'proposta', 'negociacao', 'fechado', 'perdido']),
})

type FormData = z.infer<typeof schema>

interface Props {
  lead?: Lead
  onClose: () => void
  onSave?: (data: Omit<Lead, 'id' | 'created_at'>) => void
  onDelete?: (id: string) => void
}

const ORIGENS = ['Instagram', 'LinkedIn', 'Indicação', 'Site', 'Google', 'Outro']

export default function LeadModal({ lead, onClose, onSave, onDelete }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: lead ? {
      nome:        lead.nome,
      contato:     lead.contato,
      valor:       String(lead.valor),
      origem:      lead.origem,
      servico:     lead.servico,
      responsavel: lead.responsavel,
      prazo:       lead.prazo ?? '',
      anotacoes:   lead.anotacoes ?? '',
      estagio:     lead.estagio,
    } : {
      estagio:     'novo',
      origem:      '',
      responsavel: 'Leo Pessarelli',
    },
  })

  function onSubmit(data: FormData) {
    onSave?.({
      nome:        data.nome,
      contato:     data.contato,
      valor:       Number(data.valor),
      origem:      data.origem,
      servico:     data.servico,
      responsavel: data.responsavel,
      prazo:       data.prazo || null,
      anotacoes:   data.anotacoes || null,
      estagio:     data.estagio as LeadEstagio,
    })
    onClose()
  }

  const ic = "w-full bg-card2 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none placeholder:text-gray-600"
  const ec = "text-red-400 text-xs mt-1"

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-bg w-full max-w-md rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <button onClick={onClose} className="text-gray-500 text-sm">Cancelar</button>
          <h2 className="font-bold">{lead ? 'Editar Lead' : 'Novo Lead'}</h2>
          {lead ? (
            <button onClick={() => { onDelete?.(lead.id); onClose() }} className="text-red-400 text-sm">Excluir</button>
          ) : (
            <div className="w-14" />
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <input {...register('nome')} placeholder="Nome / Empresa" className={ic} />
            {errors.nome && <p className={ec}>{errors.nome.message}</p>}
          </div>
          <div>
            <input {...register('servico')} placeholder="Serviço de interesse" className={ic} />
            {errors.servico && <p className={ec}>{errors.servico.message}</p>}
          </div>
          <div>
            <input {...register('contato')} placeholder="WhatsApp, e-mail ou telefone" className={ic} />
            {errors.contato && <p className={ec}>{errors.contato.message}</p>}
          </div>
          <div>
            <input {...register('valor')} type="number" min="0" step="100" placeholder="Valor estimado (R$)" className={ic} />
            {errors.valor && <p className={ec}>{errors.valor.message}</p>}
          </div>
          <div>
            <input {...register('responsavel')} placeholder="Responsável" className={ic} />
            {errors.responsavel && <p className={ec}>{errors.responsavel.message}</p>}
          </div>
          <div>
            <input {...register('prazo')} type="date" className={ic} />
          </div>
          <div>
            <select {...register('origem')} className={ic}>
              <option value="">Origem do lead</option>
              {ORIGENS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {errors.origem && <p className={ec}>{errors.origem.message}</p>}
          </div>
          <div>
            <textarea {...register('anotacoes')} placeholder="Anotações (opcional)" rows={2} className={`${ic} resize-none`} />
          </div>
          <div>
            <select {...register('estagio')} className={ic}>
              {STAGE_ORDER.map(s => (
                <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full bg-verde text-black py-4 rounded-2xl font-bold text-sm">
            {lead ? 'Salvar alterações' : 'Adicionar lead'}
          </button>
        </form>
      </div>
    </div>
  )
}
