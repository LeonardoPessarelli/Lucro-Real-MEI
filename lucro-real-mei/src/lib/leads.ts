export type LeadEstagio = 'novo' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'

export interface Lead {
  id: string
  workspace_id: string
  nome: string
  contato: string
  valor: number
  origem: string
  servico: string
  anotacoes: string | null
  estagio: LeadEstagio
  responsavel: string
  prazo: string | null
  created_at: string
}

export interface StageInfo {
  label: string
  color: string
  bgColor: string
}

export const STAGE_CONFIG: Record<LeadEstagio, StageInfo> = {
  novo:       { label: 'Novo Lead',   color: '#3b82f6', bgColor: 'rgba(59,130,246,0.15)' },
  proposta:   { label: 'Proposta',    color: '#a855f7', bgColor: 'rgba(168,85,247,0.15)' },
  negociacao: { label: 'Negociação',  color: '#f97316', bgColor: 'rgba(249,115,22,0.15)' },
  ganho:      { label: 'Ganho',       color: '#4ade80', bgColor: 'rgba(74,222,128,0.15)' },
  perdido:    { label: 'Perdido',     color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)' },
}

export const STAGE_ORDER: LeadEstagio[] = ['novo', 'proposta', 'negociacao', 'ganho', 'perdido']
