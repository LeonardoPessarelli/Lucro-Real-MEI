'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function LoginPage() {
  const [modo, setModo] = useState<'login' | 'cadastro'>('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function signInWithGoogle() {
    setCarregando(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/api/auth/callback` },
    })
    setCarregando(false)
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setCarregando(true)
    const supabase = createClient()

    try {
      if (modo === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
        if (error) setErro('E-mail ou senha incorretos.')
        else location.href = '/'
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
        })
        if (error) setErro('Erro ao criar conta. Tente outro e-mail.')
        else setSucesso('Conta criada! Verifique seu e-mail para confirmar.')
      }
    } finally {
      setCarregando(false)
    }
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
          disabled={carregando}
          className="w-full bg-card2 hover:bg-[#222] border border-[#333] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
        >
          <GoogleIcon />
          {carregando ? 'Aguarde...' : 'Entrar com Google'}
        </button>

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-[#222]" />
          <span className="text-gray-600 text-xs">ou</span>
          <div className="flex-1 h-px bg-[#222]" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-card2 border border-[#333] text-white placeholder:text-gray-600 py-4 px-4 rounded-2xl text-sm outline-none focus:border-verde transition-colors"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            minLength={6}
            className="w-full bg-card2 border border-[#333] text-white placeholder:text-gray-600 py-4 px-4 rounded-2xl text-sm outline-none focus:border-verde transition-colors"
          />

          {erro && <p className="text-vermelho text-xs text-center">{erro}</p>}
          {sucesso && <p className="text-verde text-xs text-center">{sucesso}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-verde text-black py-4 rounded-2xl font-bold text-sm disabled:opacity-50 transition-colors"
          >
            {carregando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta grátis'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-1">
          {modo === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
          <button
            onClick={() => { setModo(modo === 'login' ? 'cadastro' : 'login'); setErro(''); setSucesso('') }}
            className="text-verde underline"
          >
            {modo === 'login' ? 'Criar conta grátis' : 'Entrar'}
          </button>
        </p>
      </div>

      <p className="text-center text-gray-600 text-xs mt-8">
        7 dias grátis · sem cartão de crédito
      </p>
    </div>
  )
}
