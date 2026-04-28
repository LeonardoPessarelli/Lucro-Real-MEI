'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function sair() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={sair}
      className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-xs transition-colors"
    >
      <span>🚪</span> Sair
    </button>
  )
}
