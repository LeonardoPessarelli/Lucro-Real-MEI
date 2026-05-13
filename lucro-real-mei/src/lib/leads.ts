export type LeadEstagio = 'novo' | 'negociacao' | 'ganho' | 'perdido'

export interface Lead {
  id: string
  workspace_id: string
  nome: string
  colaborador: string | null
  contato: string | null
  origem: string | null
  servico: string | null
  valor: number | null
  anotacoes: string | null
  estagio: LeadEstagio
  responsavel: string | null
  prazo: string | null
  ganho_em: string | null
  lancamento_criado: boolean
  created_at: string
  updated_at: string
}

export const STAGE_ORDER: LeadEstagio[] = ['novo', 'negociacao', 'ganho', 'perdido']

export const STAGE_CONFIG: Record<LeadEstagio, { label: string; color: string; bgColor: string }> = {
  novo:       { label: 'Novo',       color: '#3b82f6', bgColor: 'rgba(59,130,246,0.15)'  },
  negociacao: { label: 'Negociação', color: '#a855f7', bgColor: 'rgba(168,85,247,0.15)'  },
  ganho:      { label: 'Ganho',      color: '#4ade80', bgColor: 'rgba(74,222,128,0.15)'  },
  perdido:    { label: 'Perdido',    color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)'   },
}

export const ORIGENS = ['Instagram', 'Indicação', 'Site', 'Google', 'WhatsApp', 'Outro']
