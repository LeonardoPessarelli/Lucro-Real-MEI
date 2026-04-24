# Lucro Real MEI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um rastreador de caixa para MEIs brasileiros que divide automaticamente cada real recebido em potes (Custos, Reserva, Salário) e exibe o lucro pessoal real do usuário.

**Architecture:** Next.js App Router com Server Components para dashboards (SSR rápido) e Client Components para o formulário de lançamento. Supabase gerencia auth (Google + Apple), banco Postgres com RLS. Asaas gerencia assinaturas via webhook. Resend envia e-mails transacionais.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase JS v2 (`@supabase/ssr`), Asaas REST API, Resend SDK, Vitest

---

## File Map

```
lucro-real-mei/
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── src/
│   ├── middleware.ts
│   ├── types/
│   │   └── index.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          (browser Supabase client)
│   │   │   └── server.ts          (server Supabase client)
│   │   ├── potes.ts               (pure calculation logic)
│   │   ├── categories.ts          (category definitions)
│   │   ├── asaas.ts               (Asaas API calls)
│   │   └── resend.ts              (email sending)
│   ├── app/
│   │   ├── layout.tsx             (root layout — dark bg, fonts)
│   │   ├── (auth)/
│   │   │   ├── layout.tsx         (centered, no nav)
│   │   │   └── login/page.tsx     (Google + Apple buttons)
│   │   ├── (app)/
│   │   │   ├── layout.tsx         (BottomNav + TrialBanner)
│   │   │   ├── page.tsx           (Home dashboard)
│   │   │   ├── resumo/page.tsx    (Resumo mensal)
│   │   │   ├── config/page.tsx    (Configurar potes)
│   │   │   └── assinatura/page.tsx (Pricing)
│   │   └── api/
│   │       ├── auth/callback/route.ts
│   │       └── webhooks/asaas/route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── BottomNav.tsx
│   │   │   └── TrialBanner.tsx
│   │   ├── home/
│   │   │   ├── SaldoCard.tsx
│   │   │   ├── PoteCard.tsx
│   │   │   └── RecentTransactions.tsx
│   │   ├── lancamento/
│   │   │   ├── LancamentoModal.tsx
│   │   │   ├── CategoriaSelector.tsx
│   │   │   └── DivisaoPreview.tsx
│   │   ├── resumo/
│   │   │   ├── PoteBar.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   └── AlertaGastos.tsx
│   │   └── config/
│   │       └── PotesSliders.tsx
│   └── lib/
│       └── __tests__/
│           └── potes.test.ts
└── vitest.config.ts
```

---

## Task 1: Project Bootstrap

**Files:**
- Create: `lucro-real-mei/` (via create-next-app)
- Create: `.env.local`
- Create: `vitest.config.ts`

- [ ] **Step 1: Criar o projeto Next.js**

```bash
npx create-next-app@latest lucro-real-mei \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --no-eslint \
  --import-alias "@/*"
cd lucro-real-mei
```

- [ ] **Step 2: Instalar dependências**

```bash
npm install @supabase/supabase-js @supabase/ssr resend
npm install -D vitest @vitejs/plugin-react
```

- [ ] **Step 3: Criar `.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ASAAS_API_KEY=your_asaas_api_key
ASAAS_WEBHOOK_TOKEN=your_random_secret_string
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 4: Criar `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom' },
  resolve: { alias: { '@': resolve(__dirname, './src') } },
})
```

- [ ] **Step 5: Configurar Tailwind com cores do design em `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d0d0d',
        card: '#111111',
        card2: '#1a1a1a',
        verde: '#4ade80',
        'verde-dark': '#16a34a',
        ambar: '#f59e0b',
        roxo: '#818cf8',
        vermelho: '#f87171',
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 6: Limpar arquivos padrão do Next.js**

Substituir `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }
body { background-color: #0d0d0d; color: #ffffff; font-family: system-ui, -apple-system, sans-serif; }
```

Deletar `src/app/page.tsx` (será recriado na Task 7).

- [ ] **Step 7: Commit**

```bash
git init
git add -A
git commit -m "feat: project bootstrap — Next.js, Tailwind, Supabase deps, Vitest"
```

---

## Task 2: Supabase Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Criar arquivo de migração**

Criar `supabase/migrations/001_initial_schema.sql`:

```sql
-- profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nome text,
  pote_custos_pct integer not null default 40,
  pote_reserva_pct integer not null default 20,
  pote_salario_pct integer not null default 40,
  setup_completo boolean not null default false,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "owner_select" on public.profiles for select using (auth.uid() = id);
create policy "owner_update" on public.profiles for update using (auth.uid() = id);
create policy "owner_insert" on public.profiles for insert with check (auth.uid() = id);

-- transactions
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tipo text not null check (tipo in ('entrada', 'saida')),
  valor numeric(10,2) not null check (valor > 0),
  descricao text,
  categoria text not null,
  tipo_gasto text check (tipo_gasto in ('empresa', 'pessoal')),
  created_at timestamptz default now()
);
alter table public.transactions enable row level security;
create policy "owner_select" on public.transactions for select using (auth.uid() = user_id);
create policy "owner_insert" on public.transactions for insert with check (auth.uid() = user_id);
create policy "owner_delete" on public.transactions for delete using (auth.uid() = user_id);
create index transactions_user_created on public.transactions(user_id, created_at desc);

-- subscriptions (only service_role writes, user reads own)
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  status text not null check (status in ('trial', 'active', 'expired')) default 'trial',
  trial_ends_at timestamptz not null,
  asaas_id text,
  plan text check (plan in ('monthly', 'annual')),
  created_at timestamptz default now()
);
alter table public.subscriptions enable row level security;
create policy "owner_select" on public.subscriptions for select using (auth.uid() = user_id);
```

- [ ] **Step 2: Executar a migração no Supabase**

Acesse o Supabase Dashboard → SQL Editor → cole o conteúdo de `001_initial_schema.sql` → Run.

Verificar que as 3 tabelas foram criadas: `profiles`, `transactions`, `subscriptions`.

- [ ] **Step 3: Habilitar Google e Apple providers no Supabase**

No Supabase Dashboard → Authentication → Providers:
- Habilitar **Google**: preencher Client ID e Client Secret do Google Cloud Console.
- Habilitar **Apple**: preencher Service ID, Team ID, Key ID e Private Key da Apple Developer.

Em ambos, configurar Redirect URL como: `https://your-project.supabase.co/auth/v1/callback`

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: supabase schema — profiles, transactions, subscriptions + RLS"
```

---

## Task 3: Supabase Clients + Types

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/types/index.ts`
- Create: `src/lib/categories.ts`

- [ ] **Step 1: Criar `src/types/index.ts`**

```typescript
export type SubscriptionStatus = 'trial' | 'active' | 'expired'
export type TipoTransaction = 'entrada' | 'saida'
export type TipoGasto = 'empresa' | 'pessoal'

export interface Profile {
  id: string
  nome: string | null
  pote_custos_pct: number
  pote_reserva_pct: number
  pote_salario_pct: number
  setup_completo: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  tipo: TipoTransaction
  valor: number
  descricao: string | null
  categoria: string
  tipo_gasto: TipoGasto | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  status: SubscriptionStatus
  trial_ends_at: string
  asaas_id: string | null
  plan: 'monthly' | 'annual' | null
  created_at: string
}

export interface PotesSummary {
  total_entradas: number
  total_saidas: number
  pote_custos: number
  pote_reserva: number
  pote_salario: number
  lucro_pessoal: number
  saidas_empresa: number
  saidas_pessoal: number
}
```

- [ ] **Step 2: Criar `src/lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Criar `src/lib/supabase/server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set({ name, value, ...options }) },
        remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )
}

export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: () => undefined, set: () => {}, remove: () => {} } }
  )
}
```

- [ ] **Step 4: Criar `src/lib/categories.ts`**

```typescript
export interface Category {
  slug: string
  label: string
  icon: string
  tipo_gasto?: 'empresa' | 'pessoal'
}

export const CATEGORIAS_ENTRADA: Category[] = [
  { slug: 'servico', label: 'Serviço prestado', icon: '💼' },
  { slug: 'venda', label: 'Venda de produto', icon: '📦' },
  { slug: 'outro_entrada', label: 'Outros', icon: '💰' },
]

export const CATEGORIAS_EMPRESA: Category[] = [
  { slug: 'transporte', label: 'Transporte', icon: '⛽', tipo_gasto: 'empresa' },
  { slug: 'material', label: 'Material / Insumo', icon: '🧰', tipo_gasto: 'empresa' },
  { slug: 'equipamento', label: 'Equipamento', icon: '🔧', tipo_gasto: 'empresa' },
  { slug: 'comunicacao', label: 'Comunicação', icon: '📱', tipo_gasto: 'empresa' },
  { slug: 'aluguel', label: 'Aluguel / Espaço', icon: '🏠', tipo_gasto: 'empresa' },
  { slug: 'uniforme', label: 'Uniforme / EPI', icon: '👔', tipo_gasto: 'empresa' },
  { slug: 'divulgacao', label: 'Divulgação', icon: '📢', tipo_gasto: 'empresa' },
  { slug: 'outro_empresa', label: 'Outros', icon: '📦', tipo_gasto: 'empresa' },
]

export const CATEGORIAS_PESSOAL: Category[] = [
  { slug: 'mercado', label: 'Mercado', icon: '🛒', tipo_gasto: 'pessoal' },
  { slug: 'padaria', label: 'Padaria / Café', icon: '☕', tipo_gasto: 'pessoal' },
  { slug: 'cinema', label: 'Lazer / Cinema', icon: '🎬', tipo_gasto: 'pessoal' },
  { slug: 'saude', label: 'Saúde / Farmácia', icon: '💊', tipo_gasto: 'pessoal' },
  { slug: 'restaurante', label: 'Restaurante', icon: '🍽️', tipo_gasto: 'pessoal' },
  { slug: 'roupa', label: 'Roupa', icon: '👕', tipo_gasto: 'pessoal' },
  { slug: 'telefone', label: 'Telefone / Plano', icon: '📲', tipo_gasto: 'pessoal' },
  { slug: 'outro_pessoal', label: 'Outros', icon: '📦', tipo_gasto: 'pessoal' },
]

export function getCategoryBySlug(slug: string): Category | undefined {
  return [...CATEGORIAS_ENTRADA, ...CATEGORIAS_EMPRESA, ...CATEGORIAS_PESSOAL]
    .find(c => c.slug === slug)
}
```

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: supabase clients, types, and category definitions"
```

---

## Task 4: Potes Calculation Logic (TDD)

**Files:**
- Create: `src/lib/potes.ts`
- Create: `src/lib/__tests__/potes.test.ts`

- [ ] **Step 1: Escrever os testes primeiro**

Criar `src/lib/__tests__/potes.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calcularPotes } from '../potes'

const config = { custos_pct: 40, reserva_pct: 20, salario_pct: 40 }

describe('calcularPotes', () => {
  it('retorna zeros sem transações', () => {
    const result = calcularPotes([], config)
    expect(result.total_entradas).toBe(0)
    expect(result.lucro_pessoal).toBe(0)
  })

  it('divide entrada de R$1000 corretamente', () => {
    const result = calcularPotes(
      [{ tipo: 'entrada', valor: 1000, tipo_gasto: null, categoria: 'servico' }],
      config
    )
    expect(result.pote_custos).toBe(400)
    expect(result.pote_reserva).toBe(200)
    expect(result.pote_salario).toBe(400)
    expect(result.lucro_pessoal).toBe(400)
  })

  it('desconta saída pessoal do lucro pessoal', () => {
    const result = calcularPotes(
      [
        { tipo: 'entrada', valor: 1000, tipo_gasto: null, categoria: 'servico' },
        { tipo: 'saida', valor: 100, tipo_gasto: 'pessoal', categoria: 'mercado' },
      ],
      config
    )
    expect(result.lucro_pessoal).toBe(300)
    expect(result.saidas_pessoal).toBe(100)
  })

  it('saída de empresa não afeta lucro pessoal', () => {
    const result = calcularPotes(
      [
        { tipo: 'entrada', valor: 1000, tipo_gasto: null, categoria: 'servico' },
        { tipo: 'saida', valor: 200, tipo_gasto: 'empresa', categoria: 'material' },
      ],
      config
    )
    expect(result.lucro_pessoal).toBe(400)
    expect(result.saidas_empresa).toBe(200)
  })

  it('soma múltiplas entradas', () => {
    const result = calcularPotes(
      [
        { tipo: 'entrada', valor: 500, tipo_gasto: null, categoria: 'servico' },
        { tipo: 'entrada', valor: 500, tipo_gasto: null, categoria: 'venda' },
      ],
      config
    )
    expect(result.total_entradas).toBe(1000)
    expect(result.pote_salario).toBe(400)
  })
})
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

```bash
npx vitest run src/lib/__tests__/potes.test.ts
```

Esperado: FAIL — "Cannot find module '../potes'"

- [ ] **Step 3: Implementar `src/lib/potes.ts`**

```typescript
import type { PotesSummary } from '@/types'

interface TransactionInput {
  tipo: 'entrada' | 'saida'
  valor: number
  tipo_gasto: 'empresa' | 'pessoal' | null
  categoria: string
}

interface PotesConfig {
  custos_pct: number
  reserva_pct: number
  salario_pct: number
}

export function calcularPotes(
  transactions: TransactionInput[],
  config: PotesConfig
): PotesSummary {
  const total_entradas = transactions
    .filter(t => t.tipo === 'entrada')
    .reduce((sum, t) => sum + t.valor, 0)

  const total_saidas = transactions
    .filter(t => t.tipo === 'saida')
    .reduce((sum, t) => sum + t.valor, 0)

  const saidas_empresa = transactions
    .filter(t => t.tipo === 'saida' && t.tipo_gasto === 'empresa')
    .reduce((sum, t) => sum + t.valor, 0)

  const saidas_pessoal = transactions
    .filter(t => t.tipo === 'saida' && t.tipo_gasto === 'pessoal')
    .reduce((sum, t) => sum + t.valor, 0)

  const pote_custos = (total_entradas * config.custos_pct) / 100
  const pote_reserva = (total_entradas * config.reserva_pct) / 100
  const pote_salario = (total_entradas * config.salario_pct) / 100
  const lucro_pessoal = pote_salario - saidas_pessoal

  return {
    total_entradas,
    total_saidas,
    pote_custos,
    pote_reserva,
    pote_salario,
    lucro_pessoal,
    saidas_empresa,
    saidas_pessoal,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
```

- [ ] **Step 4: Rodar testes para confirmar que passam**

```bash
npx vitest run src/lib/__tests__/potes.test.ts
```

Esperado: 5 testes passando.

- [ ] **Step 5: Commit**

```bash
git add src/lib/potes.ts src/lib/__tests__/
git commit -m "feat: potes calculation logic with tests"
```

---

## Task 5: Auth + Middleware

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/api/auth/callback/route.ts`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/layout.tsx`

- [ ] **Step 1: Criar `src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lucro Real MEI',
  description: 'Saiba quanto é realmente seu a cada serviço prestado',
  manifest: '/manifest.json',
  themeColor: '#0d0d0d',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg text-white min-h-screen">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Criar `src/app/(auth)/layout.tsx`**

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Criar `src/app/(auth)/login/page.tsx`**

```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/api/auth/callback` },
    })
  }

  async function signInWithApple() {
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
```

- [ ] **Step 4: Criar `src/app/api/auth/callback/route.ts`**

```typescript
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session?.user) {
      const serviceClient = createServiceClient()

      // Criar profile se não existir
      const { data: profile } = await serviceClient
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (!profile) {
        await serviceClient.from('profiles').insert({
          id: session.user.id,
          nome: session.user.user_metadata?.full_name ?? null,
        })

        // Criar subscription trial
        const trialEnd = new Date()
        trialEnd.setDate(trialEnd.getDate() + 7)
        await serviceClient.from('subscriptions').insert({
          user_id: session.user.id,
          status: 'trial',
          trial_ends_at: trialEnd.toISOString(),
        })

        // Boas-vindas por e-mail
        const { sendWelcomeEmail } = await import('@/lib/resend')
        if (session.user.email) {
          await sendWelcomeEmail(session.user.email, session.user.user_metadata?.full_name ?? 'MEI')
        }

        return NextResponse.redirect(new URL('/config', requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
```

- [ ] **Step 5: Criar `src/middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname
  const isPublic = path.startsWith('/login') || path.startsWith('/api/')

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (session && !isPublic && path !== '/assinatura') {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, trial_ends_at')
      .eq('user_id', session.user.id)
      .single()

    if (sub) {
      const trialExpired = sub.status === 'trial' && new Date(sub.trial_ends_at) < new Date()
      if (trialExpired || sub.status === 'expired') {
        return NextResponse.redirect(new URL('/assinatura', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 6: Testar o fluxo de login manualmente**

```bash
npm run dev
```

Abrir `http://localhost:3000` — deve redirecionar para `/login`.
Clicar em "Entrar com Google" — deve autenticar e redirecionar para `/config` (novo usuário) ou `/` (usuário existente).

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: auth — Google + Apple login, callback, middleware, subscription gate"
```

---

## Task 6: Configurar Potes (Onboarding)

**Files:**
- Create: `src/components/config/PotesSliders.tsx`
- Create: `src/app/(app)/config/page.tsx`
- Create: `src/app/(app)/layout.tsx`

- [ ] **Step 1: Criar `src/app/(app)/layout.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/ui/BottomNav'
import TrialBanner from '@/components/ui/TrialBanner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, trial_ends_at')
    .eq('user_id', session.user.id)
    .single()

  const diasRestantes = sub?.status === 'trial'
    ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {diasRestantes !== null && <TrialBanner diasRestantes={diasRestantes} />}
      {children}
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 2: Criar `src/components/ui/TrialBanner.tsx`**

```typescript
import Link from 'next/link'

export default function TrialBanner({ diasRestantes }: { diasRestantes: number }) {
  if (diasRestantes > 3) return null

  return (
    <div className="bg-ambar/10 border-b border-ambar/20 px-4 py-2 flex items-center justify-between">
      <p className="text-ambar text-xs font-medium">
        {diasRestantes === 0
          ? 'Seu período grátis termina hoje'
          : `${diasRestantes} dia${diasRestantes > 1 ? 's' : ''} restante${diasRestantes > 1 ? 's' : ''} no período grátis`}
      </p>
      <Link href="/assinatura" className="text-xs font-bold text-ambar underline">
        Assinar
      </Link>
    </div>
  )
}
```

- [ ] **Step 3: Criar `src/components/ui/BottomNav.tsx`**

```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import LancamentoModal from '@/components/lancamento/LancamentoModal'

export default function BottomNav() {
  const pathname = usePathname()
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card border-t border-card2 px-6 py-3 flex items-center justify-around z-40">
        <Link href="/" className={`flex flex-col items-center gap-1 text-xs ${pathname === '/' ? 'text-verde' : 'text-gray-500'}`}>
          <span className="text-lg">🏠</span>
          Início
        </Link>

        <button
          onClick={() => setShowModal(true)}
          className="bg-verde rounded-full w-14 h-14 flex items-center justify-center text-black text-2xl font-bold shadow-[0_0_20px_rgba(74,222,128,0.3)] -mt-6"
        >
          +
        </button>

        <Link href="/resumo" className={`flex flex-col items-center gap-1 text-xs ${pathname === '/resumo' ? 'text-verde' : 'text-gray-500'}`}>
          <span className="text-lg">📊</span>
          Resumo
        </Link>
      </nav>

      {showModal && <LancamentoModal onClose={() => setShowModal(false)} />}
    </>
  )
}
```

- [ ] **Step 4: Criar `src/components/config/PotesSliders.tsx`**

```typescript
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  initialCustos?: number
  initialReserva?: number
  initialSalario?: number
}

export default function PotesSliders({ initialCustos = 40, initialReserva = 20, initialSalario = 40 }: Props) {
  const [custos, setCustos] = useState(initialCustos)
  const [reserva, setReserva] = useState(initialReserva)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  const salario = 100 - custos - reserva

  function handleCustos(val: number) {
    const newCustos = Math.min(val, 100 - reserva - 5)
    setCustos(newCustos)
  }

  function handleReserva(val: number) {
    const newReserva = Math.min(val, 100 - custos - 5)
    setReserva(newReserva)
  }

  async function salvar() {
    startTransition(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await supabase.from('profiles').update({
        pote_custos_pct: custos,
        pote_reserva_pct: reserva,
        pote_salario_pct: salario,
        setup_completo: true,
      }).eq('id', session.user.id)
      router.push('/')
      router.refresh()
    })
  }

  const sliders = [
    { label: 'Custos do negócio', icon: '💼', color: 'accent-ambar', textColor: 'text-ambar', value: custos, onChange: handleCustos },
    { label: 'Reserva de emergência', icon: '🏦', color: 'accent-roxo', textColor: 'text-roxo', value: reserva, onChange: handleReserva },
    { label: 'Seu salário', icon: '✅', color: 'accent-verde', textColor: 'text-verde', value: salario, readOnly: true },
  ]

  return (
    <div className="space-y-4">
      {sliders.map(({ label, icon, color, textColor, value, onChange, readOnly }) => (
        <div key={label} className="bg-card2 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className={`font-semibold text-sm ${textColor}`}>{icon} {label}</p>
            </div>
            <span className={`text-2xl font-bold ${textColor}`}>{value}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={90}
            value={value}
            disabled={readOnly}
            onChange={e => onChange?.(Number(e.target.value))}
            className={`w-full h-1 rounded-full ${color} disabled:opacity-60`}
          />
        </div>
      ))}

      <button
        onClick={salvar}
        disabled={isPending || salario < 5}
        className="w-full bg-verde text-black py-4 rounded-2xl font-bold text-sm disabled:opacity-50 mt-2"
      >
        {isPending ? 'Salvando...' : 'Salvar configuração'}
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Criar `src/app/(app)/config/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PotesSliders from '@/components/config/PotesSliders'

export default async function ConfigPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('pote_custos_pct, pote_reserva_pct, pote_salario_pct, setup_completo')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Meus Potes</h1>
        <p className="text-gray-400 text-sm">Como cada real que você recebe é dividido</p>
      </div>

      <PotesSliders
        initialCustos={profile?.pote_custos_pct}
        initialReserva={profile?.pote_reserva_pct}
      />
    </div>
  )
}
```

- [ ] **Step 6: Testar manualmente**

Com o servidor rodando, fazer login com uma conta nova.
- Deve redirecionar para `/config`
- Mover os sliders — salário deve ajustar automaticamente
- Clicar Salvar — deve redirecionar para `/`

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: potes configuration screen with sliders"
```

---

## Task 7: Home Dashboard

**Files:**
- Create: `src/components/home/SaldoCard.tsx`
- Create: `src/components/home/PoteCard.tsx`
- Create: `src/components/home/RecentTransactions.tsx`
- Create: `src/app/(app)/page.tsx`

- [ ] **Step 1: Criar `src/components/home/SaldoCard.tsx`**

```typescript
import { formatCurrency } from '@/lib/potes'

interface Props {
  lucro: number
  totalEntradas: number
}

export default function SaldoCard({ lucro, totalEntradas }: Props) {
  return (
    <div className="bg-gradient-to-br from-verde-dark to-verde rounded-3xl p-6 text-center">
      <p className="text-black/50 text-xs font-semibold uppercase tracking-widest mb-1">
        Seu lucro pessoal no mês
      </p>
      <p className="text-black text-4xl font-black my-1">{formatCurrency(lucro)}</p>
      <p className="text-black/40 text-xs">
        do total de {formatCurrency(totalEntradas)} recebidos
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Criar `src/components/home/PoteCard.tsx`**

```typescript
import { formatCurrency } from '@/lib/potes'

interface Props {
  icon: string
  label: string
  value: number
  total: number
  color: string
  barColor: string
}

export default function PoteCard({ icon, label, value, total, color, barColor }: Props) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0

  return (
    <div className="bg-card2 rounded-2xl p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">{icon} {label}</p>
        </div>
        <span className={`text-lg font-bold ${color}`}>{formatCurrency(value)}</span>
      </div>
      <div className="bg-[#111] rounded-full h-1">
        <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Criar `src/components/home/RecentTransactions.tsx`**

```typescript
import { formatCurrency } from '@/lib/potes'
import { getCategoryBySlug } from '@/lib/categories'
import type { Transaction } from '@/types'

export default function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 text-sm">Nenhum lançamento ainda.</p>
        <p className="text-gray-600 text-xs mt-1">Toque no + para registrar</p>
      </div>
    )
  }

  return (
    <div className="bg-card2 rounded-2xl overflow-hidden">
      {transactions.map((t, i) => {
        const cat = getCategoryBySlug(t.categoria)
        const isLast = i === transactions.length - 1
        return (
          <div
            key={t.id}
            className={`flex items-center justify-between px-4 py-3 ${!isLast ? 'border-b border-[#222]' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{cat?.icon ?? '💸'}</span>
              <div>
                <p className="text-sm text-white font-medium">{t.descricao || cat?.label}</p>
                <p className="text-xs text-gray-500">
                  {new Date(t.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </p>
              </div>
            </div>
            <span className={`font-bold text-sm ${t.tipo === 'entrada' ? 'text-verde' : 'text-vermelho'}`}>
              {t.tipo === 'entrada' ? '+' : '-'}{formatCurrency(t.valor)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Criar `src/app/(app)/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calcularPotes } from '@/lib/potes'
import SaldoCard from '@/components/home/SaldoCard'
import PoteCard from '@/components/home/PoteCard'
import RecentTransactions from '@/components/home/RecentTransactions'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', session.user.id).single(),
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .order('created_at', { ascending: false }),
  ])

  if (!profile?.setup_completo) redirect('/config')

  const config = {
    custos_pct: profile.pote_custos_pct,
    reserva_pct: profile.pote_reserva_pct,
    salario_pct: profile.pote_salario_pct,
  }
  const summary = calcularPotes(transactions ?? [], config)
  const recent = (transactions ?? []).slice(0, 3)

  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="px-4 pt-8 space-y-5">
      <div>
        <p className="text-gray-500 text-xs capitalize">{mesAtual}</p>
        <h1 className="text-xl font-bold">
          Bom dia, {profile.nome?.split(' ')[0] ?? 'MEI'} 👋
        </h1>
      </div>

      <SaldoCard lucro={summary.lucro_pessoal} totalEntradas={summary.total_entradas} />

      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Como o dinheiro foi dividido</p>
        <div className="space-y-3">
          <PoteCard
            icon="💼" label="Custos do negócio"
            value={summary.pote_custos} total={summary.total_entradas}
            color="text-ambar" barColor="bg-ambar"
          />
          <PoteCard
            icon="🏦" label="Reserva"
            value={summary.pote_reserva} total={summary.total_entradas}
            color="text-roxo" barColor="bg-roxo"
          />
        </div>
      </div>

      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Últimos lançamentos</p>
        <RecentTransactions transactions={recent} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Testar manualmente**

Com o servidor rodando e potes configurados, verificar:
- Card verde mostra "Seu lucro pessoal no mês"
- Dois potes (Custos e Reserva) com barras de progresso
- Lista de lançamentos recentes (vazia inicialmente)

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: home dashboard — SaldoCard, PoteCard, RecentTransactions"
```

---

## Task 8: Modal de Lançamento

**Files:**
- Create: `src/components/lancamento/DivisaoPreview.tsx`
- Create: `src/components/lancamento/CategoriaSelector.tsx`
- Create: `src/components/lancamento/LancamentoModal.tsx`

- [ ] **Step 1: Criar `src/components/lancamento/DivisaoPreview.tsx`**

```typescript
import { formatCurrency } from '@/lib/potes'

interface Props {
  valor: number
  custos_pct: number
  reserva_pct: number
  salario_pct: number
}

export default function DivisaoPreview({ valor, custos_pct, reserva_pct, salario_pct }: Props) {
  if (valor <= 0) return null

  const items = [
    { label: 'Custos (empresa)', pct: custos_pct, color: 'text-ambar', icon: '💼' },
    { label: 'Reserva', pct: reserva_pct, color: 'text-roxo', icon: '🏦' },
    { label: 'Seu salário', pct: salario_pct, color: 'text-verde', icon: '✅' },
  ]

  return (
    <div className="bg-card2 rounded-2xl p-4 space-y-2">
      <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Divisão automática</p>
      {items.map(({ label, pct, color, icon }) => (
        <div key={label} className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">{icon} {label} ({pct}%)</span>
          <span className={`font-bold text-sm ${color}`}>{formatCurrency((valor * pct) / 100)}</span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Criar `src/components/lancamento/CategoriaSelector.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { CATEGORIAS_ENTRADA, CATEGORIAS_EMPRESA, CATEGORIAS_PESSOAL } from '@/lib/categories'
import type { Category } from '@/lib/categories'
import type { TipoGasto } from '@/types'

interface Props {
  tipo: 'entrada' | 'saida'
  selected: string | null
  onSelect: (slug: string, tipoGasto: TipoGasto | null) => void
}

export default function CategoriaSelector({ tipo, selected, onSelect }: Props) {
  const [tipoGasto, setTipoGasto] = useState<TipoGasto | null>(null)

  if (tipo === 'entrada') {
    return (
      <div className="grid grid-cols-3 gap-2">
        {CATEGORIAS_ENTRADA.map((cat) => (
          <CategoryChip key={cat.slug} cat={cat} selected={selected === cat.slug}
            onClick={() => onSelect(cat.slug, null)} />
        ))}
      </div>
    )
  }

  if (!tipoGasto) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setTipoGasto('empresa')}
          className="bg-[#1c1400] border-2 border-ambar rounded-2xl p-4 text-center"
        >
          <p className="text-2xl mb-1">💼</p>
          <p className="text-ambar font-bold text-sm">Empresa</p>
          <p className="text-gray-500 text-xs mt-1">Sai do pote de Custos</p>
        </button>
        <button
          onClick={() => setTipoGasto('pessoal')}
          className="bg-card2 border-2 border-card2 rounded-2xl p-4 text-center"
        >
          <p className="text-2xl mb-1">🏠</p>
          <p className="text-gray-300 font-bold text-sm">Pessoal</p>
          <p className="text-gray-500 text-xs mt-1">Sai do seu salário</p>
        </button>
      </div>
    )
  }

  const cats = tipoGasto === 'empresa' ? CATEGORIAS_EMPRESA : CATEGORIAS_PESSOAL
  const badgeColor = tipoGasto === 'empresa' ? 'bg-[#1c1400] border-ambar text-ambar' : 'bg-card2 border-card2 text-gray-300'

  return (
    <div>
      <button
        onClick={() => { setTipoGasto(null); onSelect('', null) }}
        className={`inline-flex items-center gap-1 text-xs border rounded-full px-3 py-1 mb-3 ${badgeColor}`}
      >
        {tipoGasto === 'empresa' ? '💼 Empresa' : '🏠 Pessoal'} ←
      </button>
      <div className="grid grid-cols-4 gap-2">
        {cats.map((cat) => (
          <CategoryChip key={cat.slug} cat={cat} selected={selected === cat.slug}
            onClick={() => onSelect(cat.slug, tipoGasto)} compact />
        ))}
      </div>
    </div>
  )
}

function CategoryChip({ cat, selected, onClick, compact }: {
  cat: Category; selected: boolean; onClick: () => void; compact?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl p-2 text-center border-2 transition-colors
        ${selected ? 'border-verde bg-verde/10' : 'border-card2 bg-card2'}`}
    >
      <p className={compact ? 'text-xl' : 'text-2xl'}>{cat.icon}</p>
      <p className={`text-gray-400 leading-tight mt-1 ${compact ? 'text-[9px]' : 'text-xs'}`}>{cat.label}</p>
    </button>
  )
}
```

- [ ] **Step 3: Criar `src/components/lancamento/LancamentoModal.tsx`**

```typescript
'use client'
import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CategoriaSelector from './CategoriaSelector'
import DivisaoPreview from './DivisaoPreview'
import type { TipoGasto } from '@/types'

interface Props { onClose: () => void }

export default function LancamentoModal({ onClose }: Props) {
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada')
  const [valorStr, setValorStr] = useState('')
  const [categoria, setCategoria] = useState<string | null>(null)
  const [tipoGasto, setTipoGasto] = useState<TipoGasto | null>(null)
  const [descricao, setDescricao] = useState('')
  const [isPending, startTransition] = useTransition()
  const [profile, setProfile] = useState<{ pote_custos_pct: number; pote_reserva_pct: number; pote_salario_pct: number } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const valor = parseFloat(valorStr.replace(',', '.')) || 0

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase.from('profiles')
        .select('pote_custos_pct, pote_reserva_pct, pote_salario_pct')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => setProfile(data))
    })
  }, [])

  function handleCategoria(slug: string, tg: TipoGasto | null) {
    setCategoria(slug)
    setTipoGasto(tg)
  }

  async function confirmar() {
    if (!categoria || valor <= 0) return
    startTransition(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await supabase.from('transactions').insert({
        user_id: session.user.id,
        tipo,
        valor,
        categoria,
        tipo_gasto: tipo === 'saida' ? tipoGasto : null,
        descricao: descricao || null,
      })
      router.refresh()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-bg w-full max-w-md rounded-t-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <button onClick={onClose} className="text-gray-500 text-sm">Cancelar</button>
          <h2 className="font-bold">Novo Lançamento</h2>
          <div className="w-16" />
        </div>

        {/* Toggle entrada/saída */}
        <div className="flex bg-card2 rounded-xl p-1">
          {(['entrada', 'saida'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTipo(t); setCategoria(null); setTipoGasto(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors
                ${tipo === t
                  ? t === 'entrada' ? 'bg-verde-dark text-white' : 'bg-red-900 text-vermelho'
                  : 'text-gray-500'}`}
            >
              {t === 'entrada' ? '💰 Entrada' : '🔴 Saída'}
            </button>
          ))}
        </div>

        {/* Valor */}
        <div className="text-center">
          <p className="text-gray-500 text-xs mb-1">Valor</p>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0,00"
            value={valorStr}
            onChange={e => setValorStr(e.target.value)}
            className={`text-4xl font-black text-center bg-transparent w-full outline-none
              ${tipo === 'entrada' ? 'text-verde' : 'text-vermelho'}`}
          />
        </div>

        {/* Categorias */}
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">
            {tipo === 'entrada' ? 'Tipo de entrada' : 'Tipo de gasto'}
          </p>
          <CategoriaSelector tipo={tipo} selected={categoria} onSelect={handleCategoria} />
        </div>

        {/* Preview da divisão (só para entradas) */}
        {tipo === 'entrada' && profile && (
          <DivisaoPreview
            valor={valor}
            custos_pct={profile.pote_custos_pct}
            reserva_pct={profile.pote_reserva_pct}
            salario_pct={profile.pote_salario_pct}
          />
        )}

        {/* Descrição */}
        <input
          type="text"
          placeholder="Descrição (opcional)"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          className="w-full bg-card2 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none placeholder:text-gray-600"
        />

        {/* Confirmar */}
        <button
          onClick={confirmar}
          disabled={!categoria || valor <= 0 || isPending}
          className="w-full bg-verde text-black py-4 rounded-2xl font-bold text-sm disabled:opacity-40"
        >
          {isPending ? 'Salvando...' : 'Confirmar lançamento'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Testar manualmente**

Tocar no botão "+", registrar uma entrada de R$500 como "Serviço prestado".
- Deve mostrar a divisão automática em tempo real
- Ao confirmar, a home deve atualizar com o novo saldo

Registrar uma saída de R$50 como Empresa → Transporte.
- Não deve aparecer divisão automática
- Deve salvar com `tipo_gasto = 'empresa'`

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: transaction modal with category selector and auto-split preview"
```

---

## Task 9: Tela de Resumo

**Files:**
- Create: `src/components/resumo/PoteBar.tsx`
- Create: `src/components/resumo/TransactionList.tsx`
- Create: `src/components/resumo/AlertaGastos.tsx`
- Create: `src/app/(app)/resumo/page.tsx`

- [ ] **Step 1: Criar `src/components/resumo/PoteBar.tsx`**

```typescript
import { formatCurrency } from '@/lib/potes'

interface Props {
  icon: string
  label: string
  value: number
  total: number
  color: string
  barColor: string
}

export default function PoteBar({ icon, label, value, total, color, barColor }: Props) {
  const pct = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-400 text-sm">{icon} {label}</span>
        <span className={`font-bold text-sm ${color}`}>{formatCurrency(value)}</span>
      </div>
      <div className="bg-card2 rounded-full h-2">
        <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Criar `src/components/resumo/AlertaGastos.tsx`**

```typescript
import { formatCurrency } from '@/lib/potes'

export default function AlertaGastos({ saidasPessoal }: { saidasPessoal: number }) {
  if (saidasPessoal <= 0) return null
  return (
    <div className="bg-vermelho/10 border border-vermelho/20 rounded-2xl p-4 flex gap-3">
      <span className="text-xl">⚠️</span>
      <div>
        <p className="text-vermelho font-semibold text-sm">Atenção nos gastos pessoais</p>
        <p className="text-gray-400 text-xs mt-1">
          Você gastou {formatCurrency(saidasPessoal)} do seu salário em despesas pessoais este mês.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Criar `src/components/resumo/TransactionList.tsx`**

```typescript
import { formatCurrency } from '@/lib/potes'
import { getCategoryBySlug } from '@/lib/categories'
import type { Transaction } from '@/types'

function groupByDay(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {}
  for (const t of transactions) {
    const day = new Date(t.created_at).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
    if (!groups[day]) groups[day] = []
    groups[day].push(t)
  }
  return groups
}

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-center text-gray-500 text-sm py-8">Nenhum lançamento este mês.</p>
  }

  const groups = groupByDay(transactions)

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([day, txs]) => (
        <div key={day}>
          <p className="text-gray-500 text-xs capitalize mb-2">{day}</p>
          <div className="bg-card2 rounded-2xl overflow-hidden">
            {txs.map((t, i) => {
              const cat = getCategoryBySlug(t.categoria)
              return (
                <div
                  key={t.id}
                  className={`flex items-center justify-between px-4 py-3 ${i < txs.length - 1 ? 'border-b border-[#222]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat?.icon ?? '💸'}</span>
                    <div>
                      <p className="text-sm text-white">{t.descricao || cat?.label}</p>
                      {t.tipo_gasto && (
                        <span className={`text-[10px] ${t.tipo_gasto === 'empresa' ? 'text-ambar' : 'text-gray-500'}`}>
                          {t.tipo_gasto === 'empresa' ? 'Empresa' : 'Pessoal'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${t.tipo === 'entrada' ? 'text-verde' : 'text-vermelho'}`}>
                    {t.tipo === 'entrada' ? '+' : '-'}{formatCurrency(t.valor)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Criar `src/app/(app)/resumo/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calcularPotes, formatCurrency } from '@/lib/potes'
import PoteBar from '@/components/resumo/PoteBar'
import AlertaGastos from '@/components/resumo/AlertaGastos'
import TransactionList from '@/components/resumo/TransactionList'

export default async function ResumoPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', session.user.id).single(),
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .order('created_at', { ascending: false }),
  ])

  const config = {
    custos_pct: profile?.pote_custos_pct ?? 40,
    reserva_pct: profile?.pote_reserva_pct ?? 20,
    salario_pct: profile?.pote_salario_pct ?? 40,
  }
  const summary = calcularPotes(transactions ?? [], config)
  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="px-4 pt-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resumo</h1>
        <p className="text-gray-500 text-sm capitalize">{mesAtual}</p>
      </div>

      <div className="bg-card2 rounded-2xl p-4">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Faturamento total</p>
        <p className="text-3xl font-black text-white">{formatCurrency(summary.total_entradas)}</p>
      </div>

      <div className="space-y-4">
        <PoteBar icon="💼" label="Custos do negócio" value={summary.pote_custos}
          total={summary.total_entradas} color="text-ambar" barColor="bg-ambar" />
        <PoteBar icon="🏦" label="Reserva" value={summary.pote_reserva}
          total={summary.total_entradas} color="text-roxo" barColor="bg-roxo" />
        <PoteBar icon="✅" label="Seu salário" value={summary.pote_salario}
          total={summary.total_entradas} color="text-verde" barColor="bg-verde" />
      </div>

      <AlertaGastos saidasPessoal={summary.saidas_pessoal} />

      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Todos os lançamentos</p>
        <TransactionList transactions={transactions ?? []} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Testar manualmente**

Navegar para a aba Resumo.
- Barras de progresso dos potes devem estar corretas
- Lançamentos agrupados por dia
- AlertaGastos aparece se houver saídas pessoais

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: resumo screen — pote bars, transaction list grouped by day, expense alert"
```

---

## Task 10: Assinatura + Webhook Asaas

**Files:**
- Create: `src/lib/asaas.ts`
- Create: `src/app/api/webhooks/asaas/route.ts`
- Create: `src/app/(app)/assinatura/page.tsx`

- [ ] **Step 1: Criar `src/lib/asaas.ts`**

```typescript
const BASE = 'https://www.asaas.com/api/v3'
const headers = {
  'access_token': process.env.ASAAS_API_KEY!,
  'Content-Type': 'application/json',
}

export async function createAsaasCustomer(email: string, name: string) {
  const res = await fetch(`${BASE}/customers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, email, notificationDisabled: false }),
  })
  const data = await res.json()
  return data.id as string
}

export async function createAsaasSubscription(
  customerId: string,
  plan: 'monthly' | 'annual',
  nextDueDate: string
) {
  const value = plan === 'monthly' ? 19.90 : 97.00
  const cycle = plan === 'monthly' ? 'MONTHLY' : 'YEARLY'
  const res = await fetch(`${BASE}/subscriptions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer: customerId,
      billingType: 'CREDIT_CARD',
      value,
      nextDueDate,
      cycle,
      description: `Lucro Real MEI — Plano ${plan === 'monthly' ? 'Mensal' : 'Anual'}`,
    }),
  })
  return res.json()
}

export async function getPaymentLink(customerId: string, plan: 'monthly' | 'annual') {
  const value = plan === 'monthly' ? 19.90 : 97.00
  const res = await fetch(`${BASE}/paymentLinks`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: `Lucro Real MEI — ${plan === 'monthly' ? 'Mensal' : 'Anual'}`,
      value,
      billingType: 'CREDIT_CARD',
      subscriptionCycle: plan === 'monthly' ? 'MONTHLY' : 'YEARLY',
      customer: customerId,
    }),
  })
  const data = await res.json()
  return data.url as string
}
```

- [ ] **Step 2: Criar `src/app/api/webhooks/asaas/route.ts`**

```typescript
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const token = request.headers.get('asaas-access-token')
  if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { event, payment } = body

  if (!payment?.customer) return NextResponse.json({ ok: true })

  const supabase = createServiceClient()
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('asaas_id', payment.customer)
    .single()

  if (!sub) return NextResponse.json({ ok: true })

  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    await supabase.from('subscriptions')
      .update({ status: 'active' })
      .eq('user_id', sub.user_id)
  }

  if (event === 'PAYMENT_OVERDUE' || event === 'SUBSCRIPTION_DELETED') {
    await supabase.from('subscriptions')
      .update({ status: 'expired' })
      .eq('user_id', sub.user_id)
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Criar `src/app/(app)/assinatura/page.tsx`**

```typescript
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createAsaasCustomer, getPaymentLink } from '@/lib/asaas'

export default async function AssinaturaPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, trial_ends_at, asaas_id')
    .eq('user_id', session.user.id)
    .single()

  const isActive = sub?.status === 'active'
  const diasRestantes = sub?.status === 'trial'
    ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  async function handleAssinar(plan: 'monthly' | 'annual') {
    'use server'
    const supabaseSrv = createClient()
    const { data: { session: sess } } = await supabaseSrv.auth.getSession()
    if (!sess) return

    const service = createServiceClient()
    let { data: subscription } = await service
      .from('subscriptions')
      .select('asaas_id')
      .eq('user_id', sess.user.id)
      .single()

    let asaasId = subscription?.asaas_id
    if (!asaasId) {
      asaasId = await createAsaasCustomer(sess.user.email!, sess.user.user_metadata?.full_name ?? 'MEI')
      await service.from('subscriptions').update({ asaas_id: asaasId }).eq('user_id', sess.user.id)
    }

    const url = await getPaymentLink(asaasId, plan)
    redirect(url)
  }

  const plans = [
    { id: 'monthly' as const, label: 'Mensal', price: 'R$ 19,90/mês', badge: null },
    { id: 'annual' as const, label: 'Anual', price: 'R$ 97,00/ano', badge: 'Economize 59%' },
  ]

  return (
    <div className="px-4 pt-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Lucro Real MEI</h1>
        {diasRestantes !== null && (
          <p className="text-ambar text-sm">
            {diasRestantes > 0 ? `${diasRestantes} dias restantes no período grátis` : 'Período grátis encerrado'}
          </p>
        )}
        {isActive && <p className="text-verde text-sm">✅ Assinatura ativa</p>}
      </div>

      {!isActive && (
        <div className="space-y-4">
          {plans.map((plan) => (
            <form key={plan.id} action={handleAssinar.bind(null, plan.id)}>
              <button
                type="submit"
                className="w-full bg-card2 border-2 border-card2 hover:border-verde rounded-2xl p-5 text-left transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-white">{plan.label}</p>
                    <p className="text-verde font-black text-xl mt-1">{plan.price}</p>
                  </div>
                  {plan.badge && (
                    <span className="bg-verde/10 text-verde text-xs font-bold px-2 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Configurar webhook no Asaas**

No painel Asaas → Configurações → Webhooks:
- URL: `https://seu-dominio.vercel.app/api/webhooks/asaas`
- Token: o mesmo valor de `ASAAS_WEBHOOK_TOKEN` no `.env.local`
- Eventos: `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE`, `SUBSCRIPTION_DELETED`

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: subscription page, Asaas client, webhook handler"
```

---

## Task 11: Resend Emails

**Files:**
- Create: `src/lib/resend.ts`

- [ ] **Step 1: Criar `src/lib/resend.ts`**

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Lucro Real MEI <no-reply@seudominio.com.br>'

export async function sendWelcomeEmail(email: string, nome: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Bem-vindo ao Lucro Real MEI 🎉',
    html: `
      <div style="font-family:system-ui;max-width:480px;margin:0 auto;color:#111">
        <h1 style="color:#16a34a">Olá, ${nome}!</h1>
        <p>Você tem <strong>7 dias grátis</strong> para descobrir quanto você realmente ganha.</p>
        <h3>Próximos passos:</h3>
        <ol>
          <li>Configure seus potes (quanto % vai para custos, reserva e salário)</li>
          <li>Registre seu próximo serviço</li>
          <li>Veja seu lucro real na tela inicial</li>
        </ol>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin-top:16px">
          Acessar o app
        </a>
      </div>
    `,
  })
}

export async function sendTrialExpiringEmail(email: string, nome: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Seu período grátis termina amanhã ⏰',
    html: `
      <div style="font-family:system-ui;max-width:480px;margin:0 auto;color:#111">
        <h1 style="color:#f59e0b">Oi, ${nome}!</h1>
        <p>Seu período de 7 dias grátis termina <strong>amanhã</strong>.</p>
        <p>Para continuar usando o Lucro Real MEI, assine por apenas <strong>R$ 19,90/mês</strong>.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/assinatura" style="display:inline-block;background:#f59e0b;color:#000;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin-top:16px">
          Assinar agora
        </a>
      </div>
    `,
  })
}

export async function sendSubscriptionConfirmedEmail(email: string, nome: string, plano: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Assinatura confirmada ✅',
    html: `
      <div style="font-family:system-ui;max-width:480px;margin:0 auto;color:#111">
        <h1 style="color:#16a34a">Assinatura ativa, ${nome}!</h1>
        <p>Seu plano <strong>${plano}</strong> está ativo. Continue registrando seus lançamentos e controlando seu lucro real.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin-top:16px">
          Abrir o app
        </a>
      </div>
    `,
  })
}
```

- [ ] **Step 2: Chamar `sendTrialExpiringEmail` no webhook (D-1)**

No `src/app/api/webhooks/asaas/route.ts`, adicionar antes do `return NextResponse.json({ ok: true })` final:

```typescript
// Enviar e-mail de trial expirando se pagamento falhou
if (event === 'PAYMENT_OVERDUE') {
  const { data: userData } = await supabase.auth.admin.getUserById(sub.user_id)
  if (userData?.user?.email) {
    const { sendTrialExpiringEmail } = await import('@/lib/resend')
    await sendTrialExpiringEmail(userData.user.email, userData.user.user_metadata?.full_name ?? 'MEI')
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/resend.ts src/app/api/webhooks/
git commit -m "feat: resend emails — welcome, trial expiring, subscription confirmed"
```

---

## Task 12: PWA + Deploy Vercel

**Files:**
- Create: `public/manifest.json`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Criar `public/manifest.json`**

```json
{
  "name": "Lucro Real MEI",
  "short_name": "Lucro Real",
  "description": "Saiba quanto é realmente seu",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0d0d0d",
  "theme_color": "#0d0d0d",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Adicionar meta tags mobile em `src/app/layout.tsx`**

```typescript
export const metadata: Metadata = {
  title: 'Lucro Real MEI',
  description: 'Saiba quanto é realmente seu a cada serviço prestado',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Lucro Real MEI' },
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 1 },
}
```

- [ ] **Step 3: Criar ícones**

Criar dois ícones PNG verdes com o texto "LR" e salvá-los em `public/icon-192.png` e `public/icon-512.png`. Pode usar qualquer editor de imagem.

- [ ] **Step 4: Deploy na Vercel**

```bash
npm install -g vercel
vercel --prod
```

Configurar as variáveis de ambiente no painel da Vercel (Settings → Environment Variables) com os mesmos valores do `.env.local`.

- [ ] **Step 5: Atualizar `NEXT_PUBLIC_APP_URL` na Vercel**

No painel Vercel → Settings → Environment Variables:
- `NEXT_PUBLIC_APP_URL` = `https://seu-projeto.vercel.app`

- [ ] **Step 6: Commit final**

```bash
git add public/ src/app/layout.tsx
git commit -m "feat: PWA manifest + mobile meta tags + production deploy"
```

---

## Checklist de cobertura da spec

| Requisito | Task |
|---|---|
| Cadastro e login (Google + Apple) | Task 5 |
| Configurar potes com sliders | Task 6 |
| Registrar entradas e saídas | Task 8 |
| Categorias por tipo (empresa/pessoal) | Task 3 + Task 8 |
| Dashboard de lucro real | Task 7 |
| Resumo mensal com barras de potes | Task 9 |
| Alerta de gastos pessoais | Task 9 |
| Trial 7 dias grátis | Task 5 (callback) |
| Assinatura mensal/anual via Asaas | Task 10 |
| Webhook Asaas atualiza status | Task 10 |
| E-mails (boas-vindas, trial, confirmação) | Task 11 |
| PWA mobile-first | Task 12 |
| RLS Supabase (dados isolados) | Task 2 |
| Cálculo de potes por query (sem persistir) | Task 4 |
