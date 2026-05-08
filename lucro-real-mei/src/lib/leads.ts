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

export const STAGE_CONFIG: Record<LeadEstagio, { label: string; color: string; bg: string }> = {
  novo:       { label: 'Novo',       color: '#3b82f6', bg: 'bg-blue-500/20'   },
  negociacao: { label: 'Negociação', color: '#a855f7', bg: 'bg-purple-500/20' },
  ganho:      { label: 'Ganho',      color: '#4ade80', bg: 'bg-green-500/20'  },
  perdido:    { label: 'Perdido',    color: '#ef4444', bg: 'bg-red-500/20'    },
}

export const ORIGENS = ['Instagram', 'Indicação', 'Site', 'Google', 'WhatsApp', 'Outro']
