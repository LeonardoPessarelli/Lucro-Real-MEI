'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { TipoGasto } from '@/types'

interface CreateTransactionInput {
  tipo: 'entrada' | 'saida'
  valor: number
  categoria: string
  tipo_gasto: TipoGasto | null
  descricao: string | null
}

export async function createTransactionAction(input: CreateTransactionInput): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Sessão expirada. Faça login novamente.' }

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    tipo: input.tipo,
    valor: input.valor,
    categoria: input.categoria,
    tipo_gasto: input.tipo === 'saida' ? input.tipo_gasto : null,
    descricao: input.descricao || null,
  })

  if (error) return { error: 'Erro ao salvar. Tente novamente.' }

  revalidatePath('/')
  revalidatePath('/resumo')
  return {}
}
