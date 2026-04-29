export type LeadEstagio = 'novo' | 'em_contato' | 'proposta' | 'fechado' | 'perdido'

export interface Lead {
  id: string
  nome: string
  contato: string
  valor: number
  origem: string
  servico: string
  anotacoes: string | null
  estagio: LeadEstagio
  created_at: string
}

export interface StageInfo {
  label: string
  color: string
  bgColor: string
  order: number
}

export const STAGE_CONFIG: Record<LeadEstagio, StageInfo> = {
  novo:       { label: 'Novo',        color: '#3b82f6', bgColor: 'rgba(59,130,246,0.15)',  order: 0 },
  em_contato: { label: 'Em contato',  color: '#f59e0b', bgColor: 'rgba(245,158,11,0.15)',  order: 1 },
  proposta:   { label: 'Proposta',    color: '#a855f7', bgColor: 'rgba(168,85,247,0.15)',  order: 2 },
  fechado:    { label: 'Fechado',     color: '#4ade80', bgColor: 'rgba(74,222,128,0.15)',  order: 3 },
  perdido:    { label: 'Perdido',     color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)',   order: 4 },
}

export const STAGE_ORDER: LeadEstagio[] = ['novo', 'em_contato', 'proposta', 'fechado', 'perdido']

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    nome: 'João Silva',
    contato: '(11) 99999-0001',
    valor: 1200,
    origem: 'Instagram',
    servico: 'Design de logo',
    anotacoes: 'Precisa até o fim do mês',
    estagio: 'proposta',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: '2',
    nome: 'Maria Souza',
    contato: 'maria@email.com',
    valor: 2500,
    origem: 'Indicação',
    servico: 'Site institucional',
    anotacoes: null,
    estagio: 'novo',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: '3',
    nome: 'Pedro Alves',
    contato: '(21) 98888-0002',
    valor: 800,
    origem: 'Google',
    servico: 'Edição de vídeo',
    anotacoes: 'Orçamento aprovado verbalmente',
    estagio: 'em_contato',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: '4',
    nome: 'Ana Costa',
    contato: 'ana@empresa.com.br',
    valor: 3600,
    origem: 'Site',
    servico: 'Gestão de redes sociais',
    anotacoes: null,
    estagio: 'fechado',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: '5',
    nome: 'Carlos Melo',
    contato: '(31) 97777-0003',
    valor: 500,
    origem: 'Instagram',
    servico: 'Arte para stories',
    anotacoes: 'Não respondeu após proposta',
    estagio: 'perdido',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
]
