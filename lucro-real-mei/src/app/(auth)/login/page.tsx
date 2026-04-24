'use client'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/api/auth/callback` },
    })
  }

  async function signInWithApple() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${location.origin}/api/auth/callback` },
    })
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-verde mb-2">Lucro Real MEI</h1>
        <p className="text-gray-400 text-sm">Saiba quanto é realmente seu</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={signInWithGoogle}
          className="w-full bg-card2 hover:bg-[#222] border border-[#333] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-colors"
        >
          <span className="text-xl">G</span>
          Entrar com Google
        </button>

        <button
          onClick={signInWithApple}
          className="w-full bg-white hover:bg-gray-100 text-black py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-colors"
        >
          <span className="text-xl"></span>
          Entrar com Apple
        </button>
      </div>

      <p className="text-center text-gray-600 text-xs mt-8">
        7 dias grátis · sem cartão de crédito
      </p>
    </div>
  )
}
