export type LeadEstagio = 'novo' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'

export interface Lead {
  id: string
  nome: string           // nome do negócio / empresa
  contato: string        // WhatsApp, e-mail ou telefone
  valor: number          // valor estimado em R$
  origem: string         // Instagram, indicação, site, etc.
  servico: string        // serviço de interesse
  anotacoes: string | null
  estagio: LeadEstagio
  responsavel: string    // nome do responsável pelo negócio
  prazo: string | null   // data limite ISO ou null
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

// helpers
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    nome: 'Ana Silva',
    contato: '(11) 99999-0001',
    valor: 4500,
    origem: 'Instagram',
    servico: 'Site Institucional',
    anotacoes: 'Quer entrega em 3 semanas',
    estagio: 'novo',
    responsavel: 'Leo Pessarelli',
    prazo: daysFromNow(12),
    created_at: daysAgo(1),
  },
  {
    id: '2',
    nome: 'Beatriz Costa',
    contato: 'beatriz@startup.com',
    valor: 4000,
    origem: 'Indicação',
    servico: 'Identidade Visual',
    anotacoes: null,
    estagio: 'novo',
    responsavel: 'Leo Pessarelli',
    prazo: daysFromNow(20),
    created_at: daysAgo(3),
  },
  {
    id: '3',
    nome: 'Rafael Torres',
    contato: '(21) 98888-0002',
    valor: 4000,
    origem: 'Google',
    servico: 'Consultoria SEO',
    anotacoes: null,
    estagio: 'novo',
    responsavel: 'Leo Pessarelli',
    prazo: null,
    created_at: daysAgo(5),
  },
  {
    id: '4',
    nome: 'Carlos Mendes',
    contato: 'carlos@empresa.com.br',
    valor: 15000,
    origem: 'LinkedIn',
    servico: 'ERP Completo',
    anotacoes: 'Demo agendada para próxima semana',
    estagio: 'proposta',
    responsavel: 'Leo Pessarelli',
    prazo: daysFromNow(8),
    created_at: daysAgo(4),
  },
  {
    id: '5',
    nome: 'Fernanda Lima',
    contato: '(31) 97777-0003',
    valor: 3000,
    origem: 'Site',
    servico: 'Gestão de Redes Sociais',
    anotacoes: null,
    estagio: 'proposta',
    responsavel: 'Leo Pessarelli',
    prazo: daysFromNow(15),
    created_at: daysAgo(8),
  },
  {
    id: '6',
    nome: 'Beatriz Alves',
    contato: 'beatriz@costa.me',
    valor: 12000,
    origem: 'Indicação',
    servico: 'App Mobile',
    anotacoes: 'Proposta enviada, aguardando aprovação',
    estagio: 'proposta',
    responsavel: 'Leo Pessarelli',
    prazo: daysFromNow(5),
    created_at: daysAgo(7),
  },
  {
    id: '7',
    nome: 'Marcos Freitas',
    contato: '(41) 96666-0004',
    valor: 10000,
    origem: 'Google',
    servico: 'Dashboard Analytics',
    anotacoes: null,
    estagio: 'proposta',
    responsavel: 'Leo Pessarelli',
    prazo: daysFromNow(3),
    created_at: daysAgo(10),
  },
  {
    id: '8',
    nome: 'Roberto Lima',
    contato: 'roberto@lima.com',
    valor: 8000,
    origem: 'LinkedIn',
    servico: 'Consultoria IA',
    anotacoes: 'Revisando contrato com jurídico',
    estagio: 'negociacao',
    responsavel: 'Leo Pessarelli',
    prazo: daysFromNow(2),
    created_at: daysAgo(12),
  },
  {
    id: '9',
    nome: 'Juliana Santos',
    contato: 'juliana@santos.com.br',
    valor: 18000,
    origem: 'Indicação',
    servico: 'E-commerce',
    anotacoes: 'Contrato assinado',
    estagio: 'ganho',
    responsavel: 'Leo Pessarelli',
    prazo: null,
    created_at: daysAgo(20),
  },
  {
    id: '10',
    nome: 'Diego Rocha',
    contato: '(51) 95555-0005',
    valor: 6500,
    origem: 'Site',
    servico: 'Automação de Marketing',
    anotacoes: null,
    estagio: 'ganho',
    responsavel: 'Leo Pessarelli',
    prazo: null,
    created_at: daysAgo(18),
  },
  {
    id: '11',
    nome: 'Camila Ferreira',
    contato: 'camila@mktdigital.com',
    valor: 4500,
    origem: 'Instagram',
    servico: 'Criação de Conteúdo',
    anotacoes: null,
    estagio: 'ganho',
    responsavel: 'Leo Pessarelli',
    prazo: null,
    created_at: daysAgo(25),
  },
  {
    id: '12',
    nome: 'Thiago Gomes',
    contato: '(62) 94444-0006',
    valor: 6000,
    origem: 'Instagram',
    servico: 'Branding Completo',
    anotacoes: null,
    estagio: 'ganho',
    responsavel: 'Leo Pessarelli',
    prazo: null,
    created_at: daysAgo(30),
  },
  {
    id: '13',
    nome: 'Pedro Oliveira',
    contato: 'pedro@oliveira.net',
    valor: 3000,
    origem: 'Google',
    servico: 'Landing Page',
    anotacoes: 'Não respondeu após proposta',
    estagio: 'perdido',
    responsavel: 'Leo Pessarelli',
    prazo: null,
    created_at: daysAgo(22),
  },
]
