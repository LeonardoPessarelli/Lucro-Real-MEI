'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Lead, LeadEstagio } from '@/lib/leads'

type CreateLeadInput = Omit<Lead, 'id' | 'workspace_id' | 'created_at' | 'updated_at' | 'ganho_em' | 'lancamento_criado'>
type UpdateLeadInput = Partial<Omit<Lead, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>>

async function getWorkspaceId(): Promise<{ supabase: Awaited<ReturnType<typeof createClient>>; workspaceId: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Não autenticado' }

  const { data: member, error: mErr } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (mErr || !member) return { error: 'Workspace não encontrado' }
  return { supabase, workspaceId: member.workspace_id }
}

function revalidate() {
  revalidatePath('/leads')
  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
}

export async function createLeadAction(input: CreateLeadInput): Promise<{ data?: Lead; error?: string }> {
  const ctx = await getWorkspaceId()
  if ('error' in ctx) return { error: ctx.error }
  const { supabase, workspaceId } = ctx

  const { data, error } = await supabase
    .from('leads')
    .insert({ ...input, workspace_id: workspaceId })
    .select()
    .single()

  if (error) return { error: 'Erro ao criar lead. Tente novamente.' }
  revalidate()
  return { data: data as Lead }
}

export async function updateLeadAction(id: string, input: UpdateLeadInput): Promise<{ error?: string }> {
  const ctx = await getWorkspaceId()
  if ('error' in ctx) return { error: ctx.error }
  const { supabase, workspaceId } = ctx

  const { error } = await supabase
    .from('leads')
    .update(input)
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) return { error: 'Erro ao atualizar lead.' }
  revalidate()
  return {}
}

export async function deleteLeadAction(id: string): Promise<{ error?: string }> {
  const ctx = await getWorkspaceId()
  if ('error' in ctx) return { error: ctx.error }
  const { supabase, workspaceId } = ctx

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) return { error: 'Erro ao excluir lead.' }
  revalidate()
  return {}
}

export async function moveLeadEstagioAction(id: string, estagio: LeadEstagio): Promise<{ error?: string }> {
  const ctx = await getWorkspaceId()
  if ('error' in ctx) return { error: ctx.error }
  const { supabase, workspaceId } = ctx

  const { data: lead } = await supabase
    .from('leads')
    .select('lancamento_criado')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .single()

  if (lead?.lancamento_criado) return { error: 'Este lead já foi confirmado como lançamento e não pode ser movido.' }

  const extra = estagio === 'ganho' ? { ganho_em: new Date().toISOString() } : { ganho_em: null }
  return updateLeadAction(id, { estagio, ...extra })
}
