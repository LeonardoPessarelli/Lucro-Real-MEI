'use server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function saveOnboardingAction(workspaceName: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Não autenticado' }

  const nome = workspaceName.trim()
  if (!nome || nome.length < 2) return { error: 'Nome muito curto' }
  if (nome.length > 50) return { error: 'Nome muito longo (máx 50 caracteres)' }

  const { error } = await supabase
    .from('profiles')
    .update({ nome, setup_completo: true })
    .eq('id', user.id)

  if (error) return { error: 'Erro ao salvar. Tente novamente.' }

  const service = createServiceClient()
  const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  await service.from('subscriptions').upsert(
    { user_id: user.id, status: 'trial', trial_ends_at: trialEndsAt },
    { onConflict: 'user_id', ignoreDuplicates: true },
  )

  return {}
}
