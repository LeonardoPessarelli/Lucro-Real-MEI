# Auth & Onboarding UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Melhorar as telas de login/cadastro com validação Zod + react-hook-form, spinner nos botões, mensagens de erro claras, e adicionar uma tela de onboarding que pede o nome do workspace e redireciona para `/dashboard` após salvar.

**Architecture:** A tela de login já existe em `src/app/(auth)/login/page.tsx` — vamos refatorá-la para usar `react-hook-form` + Zod em vez de estados manuais. O onboarding é uma nova página em `src/app/(auth)/onboarding/page.tsx` que salva o `workspace_name` no profile via Server Action e redireciona para `/`. O middleware já gerencia `setup_completo`; basta garantir que o onboarding marque `setup_completo = true` ao finalizar.

**Tech Stack:** Next.js 16 App Router · React 19 · react-hook-form · zod · Supabase client-side · Tailwind v4 · TypeScript

---

## Mapa de Arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `src/app/(auth)/login/page.tsx` | Modificar | Formulário com react-hook-form + Zod, spinner real, erros inline |
| `src/app/(auth)/onboarding/page.tsx` | Criar | Tela de onboarding: nome do workspace + redirect para `/` |
| `src/components/ui/Spinner.tsx` | Criar | Spinner SVG animado reutilizável |
| `src/lib/actions/profile.ts` | Modificar | Adicionar `saveOnboardingAction` (salva workspace_name + setup_completo = true) |
| `src/middleware.ts` | Modificar | Redirecionar para `/onboarding` quando `setup_completo = false` |

---

## Task 1: Spinner reutilizável

**Files:**
- Create: `src/components/ui/Spinner.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/ui/Spinner.tsx
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Spinner.tsx
git commit -m "feat(ui): Spinner reutilizável"
```

---

## Task 2: Refatorar login/cadastro com react-hook-form + Zod

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

O objetivo é substituir os `useState` manuais de `email`, `senha`, `erro`, `carregando` por `useForm` do react-hook-form com validação Zod. Erros aparecem inline abaixo de cada campo. O botão mostra `<Spinner />` enquanto carrega.

- [ ] **Step 1: Escrever o arquivo completo refatorado**

```tsx
// src/app/(auth)/login/page.tsx
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
```

- [ ] **Step 2: Verificar que @hookform/resolvers está instalado**

```bash
cd lucro-real-mei && cat package.json | grep hookform
```

Se não aparecer `@hookform/resolvers`, instalar:

```bash
npm install @hookform/resolvers
```

- [ ] **Step 3: Rodar o TypeScript check**

```bash
cd lucro-real-mei && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/app/(auth)/login/page.tsx
git commit -m "feat(auth): login/cadastro com react-hook-form + Zod, spinner e erros inline"
```

---

## Task 3: Server Action para onboarding

**Files:**
- Modify: `src/lib/actions/profile.ts`

A action existente (`updateProfileAction`) salva `%` dos potes. Vamos adicionar `saveOnboardingAction` que salva `workspace_name` (no campo `nome` do profile) e marca `setup_completo = true`.

- [ ] **Step 1: Ler o arquivo atual**

```bash
cat lucro-real-mei/src/lib/actions/profile.ts
```

- [ ] **Step 2: Adicionar `saveOnboardingAction` ao final do arquivo**

Adicione ao fim de `src/lib/actions/profile.ts`:

```ts
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
  return {}
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd lucro-real-mei && npx tsc --noEmit 2>&1 | head -20
```

Esperado: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions/profile.ts
git commit -m "feat(auth): saveOnboardingAction salva workspace e setup_completo=true"
```

---

## Task 4: Tela de onboarding

**Files:**
- Create: `src/app/(auth)/onboarding/page.tsx`

Tela de tela cheia (sem nav), formulário simples: campo "Nome do seu negócio / workspace", botão "Começar", spinner, mensagem de erro. Ao salvar com sucesso, redireciona para `/` com `router.push('/')`.

- [ ] **Step 1: Criar o arquivo**

```tsx
// src/app/(auth)/onboarding/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { saveOnboardingAction } from '@/lib/actions/profile'
import { Spinner } from '@/components/ui/Spinner'

const schema = z.object({
  workspaceName: z
    .string()
    .min(2, 'O nome precisa ter pelo menos 2 caracteres')
    .max(50, 'Máximo de 50 caracteres')
    .trim(),
})

type FormData = z.infer<typeof schema>

export default function OnboardingPage() {
  const router = useRouter()
  const [erroGlobal, setErroGlobal] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setErroGlobal('')
    const result = await saveOnboardingAction(data.workspaceName)
    if (result.error) {
      setErroGlobal(result.error)
      return
    }
    router.push('/')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-10">
        <div className="text-4xl mb-4">👋</div>
        <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Lucro Real!</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Como você quer chamar o seu negócio aqui dentro?
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="workspaceName" className="block text-sm text-gray-400 mb-2">
            Nome do negócio ou workspace
          </label>
          <input
            id="workspaceName"
            type="text"
            placeholder="Ex: Meu MEI, Barbearia do João..."
            autoComplete="organization"
            autoFocus
            {...register('workspaceName')}
            className="w-full bg-card2 border border-[#333] text-white placeholder:text-gray-600 py-4 px-4 rounded-2xl text-sm outline-none focus:border-verde transition-colors aria-[invalid=true]:border-vermelho"
            aria-invalid={!!errors.workspaceName}
          />
          {errors.workspaceName && (
            <p className="text-vermelho text-xs mt-1 px-1">{errors.workspaceName.message}</p>
          )}
        </div>

        {erroGlobal && (
          <p className="text-vermelho text-xs text-center">{erroGlobal}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-verde text-black py-4 rounded-2xl font-bold text-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting && <Spinner className="text-black" />}
          {isSubmitting ? 'Salvando...' : 'Começar agora'}
        </button>
      </form>

      <p className="text-center text-gray-600 text-xs mt-8">
        Você pode mudar isso depois nas configurações.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd lucro-real-mei && npx tsc --noEmit 2>&1 | head -20
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/app/(auth)/onboarding/page.tsx
git commit -m "feat(auth): tela de onboarding com nome do workspace e redirect para /"
```

---

## Task 5: Middleware — redirecionar para `/onboarding` quando `setup_completo = false`

**Files:**
- Modify: `src/middleware.ts`

Atualmente o middleware redireciona para `/config` quando não há subscription. Vamos ajustar para também checar `setup_completo` no profile e redirecionar para `/onboarding` quando for `false`.

- [ ] **Step 1: Ler o middleware atual**

```bash
cat lucro-real-mei/src/middleware.ts
```

- [ ] **Step 2: Substituir o bloco de lógica do usuário autenticado**

Substitua o conteúdo completo de `src/middleware.ts` por:

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublic = path.startsWith('/login') || path.startsWith('/api/')
  const isOnboarding = path === '/onboarding'

  if (!user && !isPublic && !isOnboarding) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (user && !isPublic) {
    // Checar setup_completo
    if (!isOnboarding) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('setup_completo')
        .eq('id', user.id)
        .single()

      if (profile && profile.setup_completo === false) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }

    // Checar subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, trial_ends_at')
      .eq('user_id', user.id)
      .single()

    if (!sub) {
      if (path !== '/assinatura') {
        return NextResponse.redirect(new URL('/assinatura', request.url))
      }
      return response
    }

    const trialExpired = sub.status === 'trial' && new Date(sub.trial_ends_at) < new Date()
    const needsPayment = trialExpired || sub.status === 'expired'

    if (needsPayment && path !== '/assinatura') {
      return NextResponse.redirect(new URL('/assinatura', request.url))
    }

    if (sub.status === 'active' && path === '/assinatura') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd lucro-real-mei && npx tsc --noEmit 2>&1 | head -20
```

Esperado: sem erros.

- [ ] **Step 4: Rodar testes**

```bash
cd lucro-real-mei && npm test
```

Esperado: 8 testes passando.

- [ ] **Step 5: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(auth): middleware redireciona para /onboarding quando setup_completo=false"
```

---

## Task 6: Verificação final — build

- [ ] **Step 1: Rodar build completo**

```bash
cd lucro-real-mei && npm run build 2>&1 | tail -20
```

Esperado: `✓ Compiled successfully` sem erros.

- [ ] **Step 2: Commit de fechamento (se necessário)**

Se houver pequenos ajustes:

```bash
git add -A
git commit -m "fix(auth): ajustes pós-build onboarding e login"
```

---

## Resumo das telas

| Rota | Arquivo | O que faz |
|---|---|---|
| `/login` | `(auth)/login/page.tsx` | Login + cadastro, validação Zod, spinner, erros inline |
| `/onboarding` | `(auth)/onboarding/page.tsx` | Nome do workspace, redireciona para `/` |

**Fluxo novo usuário:**
1. Acessa `/login` → cria conta com e-mail/senha ou Google
2. Callback OAuth → subscription trial criada → redireciona para `/`
3. Middleware detecta `setup_completo = false` → redireciona para `/onboarding`
4. Usuário digita nome do workspace → salva → redireciona para `/`
5. Middleware passa: `setup_completo = true`, subscription ativa/trial → acesso liberado
