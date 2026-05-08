'use server'
import { createClient } from '@/lib/supabase/server'

export async function saveOnboardingAction(workspaceName: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Não autenticado' }

  const nome = workspaceName.trim()
  if (!nome || nome.length < 2) return { error: 'Nome muito curto' }
  if (nome.length > 50) return { error: 'Nome muito longo (máx 50 caracteres)' }

  // Atualiza profile com o nome e marca setup completo
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ nome, setup_completo: true })
    .eq('id', user.id)

  if (profileError) return { error: 'Erro ao salvar. Tente novamente.' }

  // Atualiza o workspace criado automaticamente pelo trigger com o nome escolhido
  await supabase
    .from('workspaces')
    .update({ nome })
    .eq('owner_id', user.id)

  return {}
}
