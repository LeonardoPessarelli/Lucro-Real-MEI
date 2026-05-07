export type LeadEstagio = 'novo' | 'em_contato' | 'proposta' | 'fechado' | 'perdido'

export interface Lead {
  id: string
  user_id: string
  nome: string
  contato: string
  valor: number
  origem: string
  servico: string
  anotacoes: string | null
  estagio: LeadEstagio
  created_at: string
  updated_at: string
}

export const STAGE_ORDER: LeadEstagio[] = ['novo', 'em_contato', 'proposta', 'fechado', 'perdido']

export const STAGE_CONFIG: Record<LeadEstagio, { label: string; color: string; bg: string }> = {
  novo:       { label: 'Novo',       color: '#3b82f6', bg: 'bg-blue-500/20'   },
  em_contato: { label: 'Em contato', color: '#f59e0b', bg: 'bg-amber-500/20'  },
  proposta:   { label: 'Proposta',   color: '#a855f7', bg: 'bg-purple-500/20' },
  fechado:    { label: 'Fechado',    color: '#4ade80', bg: 'bg-green-500/20'  },
  perdido:    { label: 'Perdido',    color: '#ef4444', bg: 'bg-red-500/20'    },
}

export const ORIGENS = ['Instagram', 'Indicação', 'Site', 'Google', 'WhatsApp', 'Outro']
