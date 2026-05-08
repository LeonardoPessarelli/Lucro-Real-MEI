export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nome: string | null
          pote_custos_pct: number
          pote_reserva_pct: number
          pote_salario_pct: number
          setup_completo: boolean
          created_at: string
        }
        Insert: {
          id: string
          nome?: string | null
          pote_custos_pct?: number
          pote_reserva_pct?: number
          pote_salario_pct?: number
          setup_completo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string | null
          pote_custos_pct?: number
          pote_reserva_pct?: number
          pote_salario_pct?: number
          setup_completo?: boolean
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          tipo: 'entrada' | 'saida'
          valor: number
          descricao: string | null
          categoria: string
          tipo_gasto: 'empresa' | 'pessoal' | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tipo: 'entrada' | 'saida'
          valor: number
          descricao?: string | null
          categoria: string
          tipo_gasto?: 'empresa' | 'pessoal' | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tipo?: 'entrada' | 'saida'
          valor?: number
          descricao?: string | null
          categoria?: string
          tipo_gasto?: 'empresa' | 'pessoal' | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: 'trial' | 'active' | 'expired'
          trial_ends_at: string
          asaas_id: string | null
          plan: 'monthly' | 'annual' | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'trial' | 'active' | 'expired'
          trial_ends_at: string
          asaas_id?: string | null
          plan?: 'monthly' | 'annual' | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'trial' | 'active' | 'expired'
          trial_ends_at?: string
          asaas_id?: string | null
          plan?: 'monthly' | 'annual' | null
          created_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          owner_id: string
          nome: string
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          nome: string
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          nome?: string
          created_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: 'owner' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'owner' | 'member'
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          workspace_id: string
          nome: string
          contato: string | null
          origem: string | null
          servico: string | null
          anotacoes: string | null
          estagio: 'novo' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
          responsavel: string | null
          prazo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          nome: string
          contato?: string | null
          origem?: string | null
          servico?: string | null
          anotacoes?: string | null
          estagio?: 'novo' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
          responsavel?: string | null
          prazo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          nome?: string
          contato?: string | null
          origem?: string | null
          servico?: string | null
          anotacoes?: string | null
          estagio?: 'novo' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
          responsavel?: string | null
          prazo?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          workspace_id: string
          lead_id: string
          titulo: string
          valor: number
          estagio: 'novo' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
          responsavel: string | null
          prazo: string | null
          anotacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          lead_id: string
          titulo: string
          valor?: number
          estagio?: 'novo' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
          responsavel?: string | null
          prazo?: string | null
          anotacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          lead_id?: string
          titulo?: string
          valor?: number
          estagio?: 'novo' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
          responsavel?: string | null
          prazo?: string | null
          anotacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          workspace_id: string
          lead_id: string | null
          deal_id: string | null
          tipo: 'nota' | 'ligacao' | 'email' | 'reuniao' | 'tarefa'
          descricao: string
          realizado_em: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          lead_id?: string | null
          deal_id?: string | null
          tipo: 'nota' | 'ligacao' | 'email' | 'reuniao' | 'tarefa'
          descricao: string
          realizado_em?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          lead_id?: string | null
          deal_id?: string | null
          tipo?: 'nota' | 'ligacao' | 'email' | 'reuniao' | 'tarefa'
          descricao?: string
          realizado_em?: string
          created_by?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      handle_new_user: {
        Args: Record<string, never>
        Returns: undefined
      }
      handle_new_workspace: {
        Args: Record<string, never>
        Returns: undefined
      }
      my_workspace_ids: {
        Args: Record<string, never>
        Returns: string[]
      }
      set_updated_at: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: {}
  }
}

// ─── Atalhos para uso no app ──────────────────────────────────────────────────

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// ─── Tipos derivados prontos para usar nos componentes ────────────────────────

export type DbProfile         = Tables<'profiles'>
export type DbTransaction     = Tables<'transactions'>
export type DbSubscription    = Tables<'subscriptions'>
export type DbWorkspace       = Tables<'workspaces'>
export type DbWorkspaceMember = Tables<'workspace_members'>
export type DbLead            = Tables<'leads'>
export type DbDeal            = Tables<'deals'>
export type DbActivity        = Tables<'activities'>

export type LeadEstagio  = DbLead['estagio']
export type DealEstagio  = DbDeal['estagio']
export type ActivityTipo = DbActivity['tipo']
export type MemberRole   = DbWorkspaceMember['role']
