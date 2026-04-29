'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/Spinner'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres'),
})

type FormData = z.infer<typeof schema>

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function LoginPage() {
  const [modo, setModo] = useState<'login' | 'cadastro'>('login')
  const [erroGlobal, setErroGlobal] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function signInWithGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/api/auth/callback` },
    })
    setGoogleLoading(false)
  }

  async function onSubmit(data: FormData) {
    setErroGlobal('')
    setSucesso('')
    const supabase = createClient()

    if (modo === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.senha,
      })
      if (error) {
        setErroGlobal('E-mail ou senha incorretos.')
      } else {
        location.href = '/'
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
        options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
      })
      if (error) {
        setErroGlobal('Erro ao criar conta. Tente outro e-mail.')
      } else {
        setSucesso('Conta criada! Verifique seu e-mail para confirmar.')
      }
    }
  }

  function trocarModo() {
    setModo(modo === 'login' ? 'cadastro' : 'login')
    setErroGlobal('')
    setSucesso('')
    reset()
  }

  const carregando = isSubmitting || googleLoading

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
          {googleLoading ? <Spinner /> : <GoogleIcon />}
          {googleLoading ? 'Redirecionando...' : 'Entrar com Google'}
        </button>

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-[#222]" />
          <span className="text-gray-600 text-xs">ou</span>
          <div className="flex-1 h-px bg-[#222]" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
          <div>
            <input
              type="email"
              placeholder="Seu e-mail"
              autoComplete="email"
              {...register('email')}
              className="w-full bg-card2 border border-[#333] text-white placeholder:text-gray-600 py-4 px-4 rounded-2xl text-sm outline-none focus:border-verde transition-colors aria-[invalid=true]:border-vermelho"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-vermelho text-xs mt-1 px-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Senha"
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
              {...register('senha')}
              className="w-full bg-card2 border border-[#333] text-white placeholder:text-gray-600 py-4 px-4 rounded-2xl text-sm outline-none focus:border-verde transition-colors aria-[invalid=true]:border-vermelho"
              aria-invalid={!!errors.senha}
            />
            {errors.senha && (
              <p className="text-vermelho text-xs mt-1 px-1">{errors.senha.message}</p>
            )}
          </div>

          {erroGlobal && (
            <p className="text-vermelho text-xs text-center">{erroGlobal}</p>
          )}
          {sucesso && (
            <p className="text-verde text-xs text-center">{sucesso}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-verde text-black py-4 rounded-2xl font-bold text-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting && <Spinner className="text-black" />}
            {isSubmitting
              ? 'Aguarde...'
              : modo === 'login'
              ? 'Entrar'
              : 'Criar conta grátis'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-1">
          {modo === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
          <button onClick={trocarModo} className="text-verde underline">
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
