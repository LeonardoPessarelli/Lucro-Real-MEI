'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Lead, LeadEstagio } from '@/lib/leads'

type CreateLeadInput = Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>
type UpdateLeadInput = Partial<CreateLeadInput>

async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Não autenticado')
  return { supabase, user }
}

export async function createLeadAction(input: CreateLeadInput): Promise<{ data?: Lead; error?: string }> {
  try {
    const { supabase, user } = await getUser()
    const { data, error } = await supabase
      .from('leads')
      .insert({ ...input, user_id: user.id })
      .select()
      .single()
    if (error) return { error: 'Erro ao criar lead. Tente novamente.' }
    revalidatePath('/leads')
    revalidatePath('/pipeline')
    revalidatePath('/dashboard')
    return { data: data as Lead }
  } catch {
    return { error: 'Não autenticado' }
  }
}

export async function updateLeadAction(id: string, input: UpdateLeadInput): Promise<{ error?: string }> {
  try {
    const { supabase, user } = await getUser()
    const { error } = await supabase
      .from('leads')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return { error: 'Erro ao atualizar lead.' }
    revalidatePath('/leads')
    revalidatePath('/pipeline')
    revalidatePath('/dashboard')
    return {}
  } catch {
    return { error: 'Não autenticado' }
  }
}

export async function deleteLeadAction(id: string): Promise<{ error?: string }> {
  try {
    const { supabase, user } = await getUser()
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return { error: 'Erro ao excluir lead.' }
    revalidatePath('/leads')
    revalidatePath('/pipeline')
    revalidatePath('/dashboard')
    return {}
  } catch {
    return { error: 'Não autenticado' }
  }
}

export async function moveLeadEstagioAction(id: string, estagio: LeadEstagio): Promise<{ error?: string }> {
  return updateLeadAction(id, { estagio })
}
