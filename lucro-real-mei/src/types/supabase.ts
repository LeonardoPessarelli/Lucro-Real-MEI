export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

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
    }
    Functions: {
      handle_new_user: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: {}
  }
}

// Atalhos para uso no app
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
