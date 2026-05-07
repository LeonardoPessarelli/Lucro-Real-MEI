'use client'
import { useForm, useController } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { STAGE_ORDER, STAGE_CONFIG } from '@/lib/leads'

// Converte "5.000,00" ou "5000,00" ou "5000" → número
function parseBRL(raw: string): number {
  // Remove pontos de milhar, substitui vírgula decimal por ponto
  const clean = raw.replace(/\./g, '').replace(',', '.')
  return parseFloat(clean) || 0
}

// Formata número → "5.000,00"
function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const schema = z.object({
  servico:     z.string().min(1, 'Título obrigatório'),
  nome:        z.string().min(1, 'Lead/empresa obrigatório'),
  contato:     z.string().min(1, 'Contato obrigatório'),
  valor:       z.string().min(1, 'Informe um valor').refine(
    v => parseBRL(v) >= 0,
    { message: 'Valor inválido' }
  ),
  responsavel: z.string().min(1, 'Responsável obrigatório'),
  origem:      z.string().min(1, 'Selecione a origem'),
  estagio:     z.enum(['novo', 'proposta', 'negociacao', 'ganho', 'perdido']),
  prazo:       z.string().optional(),
  anotacoes:   z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  mode: 'new' | 'edit'
  lead?: Lead
  defaultEstagio?: LeadEstagio
  onClose: () => void
  onSave: (data: Omit<Lead, 'id' | 'created_at' | 'workspace_id'>) => void
  onDelete?: (id: string) => void
}

const ORIGENS = ['Instagram', 'LinkedIn', 'Indicação', 'Google', 'Site', 'Outro']

export default function NegocioModal({
  mode,
  lead,
  defaultEstagio = 'novo',
  onClose,
  onSave,
  onDelete,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: lead
      ? {
          servico:     lead.servico,
          nome:        lead.nome,
          contato:     lead.contato,
          valor:       formatBRL(lead.valor),
          responsavel: lead.responsavel,
          origem:      lead.origem,
          estagio:     lead.estagio,
          prazo:       lead.prazo ?? '',
          anotacoes:   lead.anotacoes ?? '',
        }
      : {
          servico:     '',
          nome:        '',
          contato:     '',
          valor:       '',
          responsavel: 'Leo Pessarelli',
          origem:      '',
          estagio:     defaultEstagio,
          prazo:       '',
          anotacoes:   '',
        },
  })

  const { field: valorField } = useController({ name: 'valor', control })

  function onSubmit(data: FormData) {
    onSave({
      servico:     data.servico,
      nome:        data.nome,
      contato:     data.contato,
      valor:       parseBRL(data.valor),
      responsavel: data.responsavel,
      origem:      data.origem,
      estagio:     data.estagio as LeadEstagio,
      prazo:       data.prazo || null,
      anotacoes:   data.anotacoes || null,
    })
    onClose()
  }

  const inp = 'modal-input'
  const err = 'modal-error'

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <button className="modal-cancel" onClick={onClose}>Cancelar</button>
          <h2 className="modal-title">
            {mode === 'new' ? 'Novo negócio' : 'Editar negócio'}
          </h2>
          {mode === 'edit' && lead ? (
            <button
              className="modal-delete"
              onClick={() => { onDelete?.(lead.id); onClose() }}
            >
              Excluir
            </button>
          ) : (
            <div style={{ width: 56 }} />
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          {/* Título do negócio */}
          <div className="modal-field">
            <label className="modal-label">Título do negócio</label>
            <input
              {...register('servico')}
              placeholder="Ex: Site Institucional"
              className={inp}
              autoFocus
            />
            {errors.servico && <p className={err}>{errors.servico.message}</p>}
          </div>

          {/* Lead / empresa + Valor lado a lado */}
          <div className="modal-row">
            <div className="modal-field flex-1">
              <label className="modal-label">Lead / Empresa</label>
              <input {...register('nome')} placeholder="Nome ou empresa" className={inp} />
              {errors.nome && <p className={err}>{errors.nome.message}</p>}
            </div>
            <div className="modal-field w-32">
              <label className="modal-label">Valor (R$)</label>
              <input
                {...valorField}
                inputMode="decimal"
                placeholder="0,00"
                className={inp}
                onBlur={e => {
                  const n = parseBRL(e.target.value)
                  valorField.onChange(n > 0 ? formatBRL(n) : e.target.value)
                  valorField.onBlur()
                }}
              />
              {errors.valor && <p className={err}>{errors.valor.message}</p>}
            </div>
          </div>

          {/* Contato */}
          <div className="modal-field">
            <label className="modal-label">Contato</label>
            <input {...register('contato')} placeholder="WhatsApp, e-mail ou telefone" className={inp} />
            {errors.contato && <p className={err}>{errors.contato.message}</p>}
          </div>

          {/* Responsável + Prazo */}
          <div className="modal-row">
            <div className="modal-field flex-1">
              <label className="modal-label">Responsável</label>
              <input {...register('responsavel')} placeholder="Seu nome" className={inp} />
              {errors.responsavel && <p className={err}>{errors.responsavel.message}</p>}
            </div>
            <div className="modal-field w-40">
              <label className="modal-label">Prazo</label>
              <input {...register('prazo')} type="date" className={inp} />
            </div>
          </div>

          {/* Origem + Estágio */}
          <div className="modal-row">
            <div className="modal-field flex-1">
              <label className="modal-label">Origem</label>
              <select {...register('origem')} className={inp}>
                <option value="">Selecionar...</option>
                {ORIGENS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              {errors.origem && <p className={err}>{errors.origem.message}</p>}
            </div>
            <div className="modal-field flex-1">
              <label className="modal-label">Estágio</label>
              <select {...register('estagio')} className={inp}>
                {STAGE_ORDER.map(s => (
                  <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Anotações */}
          <div className="modal-field">
            <label className="modal-label">Anotações <span className="modal-optional">(opcional)</span></label>
            <textarea
              {...register('anotacoes')}
              placeholder="Contexto, próximos passos..."
              rows={3}
              className={`${inp} resize-none`}
            />
          </div>

          {/* Submit */}
          <button type="submit" className="modal-submit">
            {mode === 'new' ? 'Criar negócio' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
