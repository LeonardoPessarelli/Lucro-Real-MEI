# Lucro Real MEI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um rastreador de caixa para MEIs brasileiros que divide automaticamente cada real recebido em potes (Custos, Reserva, Salário) e exibe o lucro pessoal real do usuário.

**Architecture:** Next.js App Router com Server Components para dashboards (SSR rápido) e Client Components para o formulário de lançamento. Supabase gerencia auth (Google + Apple), banco Postgres com RLS. Asaas gerencia assinaturas via webhook. Resend envia e-mails transacionais.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Supabase JS v2 (`@supabase/ssr`), Asaas REST API, Resend SDK, Vitest

---

## File Map (estado atual em main)

```
lucro-real-mei/
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql          ✅ executada
│       ├── 002_rls_hardening.sql           ✅ executada (trigger + policies explícitas)
│       └── 20260428120000_rls_improvements.sql  ✅ executada (select auth.uid(), FORCE RLS)
├── src/
│   ├── middleware.ts                        ✅ proteção de rotas
│   ├── proxy.ts                             ✅ removido (era duplicata)
│   ├── types/
│   │   └── index.ts                         ✅ + Database types do Supabase
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                    ✅ lazy singleton
│   │   │   └── server.ts                    ✅ async createClient + createServiceClient
│   │   ├── potes.ts                         ✅
│   │   ├── categories.ts                    ✅
│   │   ├── asaas.ts                         ✅
│   │   └── resend.ts                        ✅
│   ├── app/
│   │   ├── layout.tsx                       ✅
│   │   ├── (auth)/
│   │   │   ├── layout.tsx                   ✅
│   │   │   └── login/page.tsx               ✅
│   │   ├── (app)/
│   │   │   ├── layout.tsx                   ✅ getUser + sub guard + TrialBanner
│   │   │   ├── page.tsx                     ✅
│   │   │   ├── resumo/page.tsx              ✅
│   │   │   ├── config/page.tsx              ✅ + LogoutButton
│   │   │   └── assinatura/page.tsx          ✅ refatorado com AssinaturaButtons
│   │   └── api/
│   │       ├── auth/callback/route.ts       ✅ getUser() + race condition 23505
│   │       ├── auth/logout/route.ts         ✅ novo
│   │       └── webhooks/asaas/route.ts      ✅
│   ├── components/
│   │   ├── ui/
│   │   │   ├── BottomNav.tsx                ✅ 4 itens: Início, Resumo, +, Potes, Plano
│   │   │   ├── TrialBanner.tsx              ✅
│   │   │   └── LogoutButton.tsx             ✅ novo (form POST, sem JS)
│   │   ├── home/
│   │   │   ├── SaldoCard.tsx                ✅
│   │   │   ├── PoteCard.tsx                 ✅
│   │   │   └── RecentTransactions.tsx       ✅
│   │   ├── lancamento/
│   │   │   ├── LancamentoModal.tsx          ✅
│   │   │   ├── CategoriaSelector.tsx        ✅
│   │   │   └── DivisaoPreview.tsx           ✅
│   │   ├── resumo/
│   │   │   ├── PoteBar.tsx                  ✅
│   │   │   ├── TransactionList.tsx          ✅
│   │   │   └── AlertaGastos.tsx             ✅
│   │   ├── config/
│   │   │   └── PotesSliders.tsx             ✅ getUser() + estado saved + erro handling
│   │   └── assinatura/
│   │       └── AssinaturaButtons.tsx        ✅ novo (Client Component extraído)
│   └── lib/
│       └── __tests__/
│           └── potes.test.ts                ✅ 5 testes passando
└── vitest.config.ts                         ✅
```

---

## Task 1: Project Bootstrap ✅ CONCLUÍDA

**PR:** #1 (fix/form-ux), commits iniciais

- [x] **Step 1:** Criar o projeto Next.js com `create-next-app`
- [x] **Step 2:** Instalar dependências (`@supabase/ssr`, `resend`, `vitest`)
- [x] **Step 3:** Criar `.env.local` com vars do Supabase, Asaas, Resend
- [x] **Step 4:** Criar `vitest.config.ts`
- [x] **Step 5:** Configurar Tailwind com cores do design (`bg`, `card`, `verde`, `ambar`, `roxo`, `vermelho`)
- [x] **Step 6:** Limpar arquivos padrão do Next.js
- [x] **Step 7:** Commit inicial

> **Divergência do plano:** Next.js 15 (não 14) com Tailwind v4. `create-next-app` já configura o alias `@/*`.

---

## Task 2: Supabase Schema ✅ CONCLUÍDA

**PRs:** #2, #3 | **Migrations:** 001, 002, 20260428120000

- [x] **Step 1:** Criar `001_initial_schema.sql` — profiles, transactions, subscriptions com RLS básico
- [x] **Step 2:** Executar migration no Supabase Dashboard
- [x] **Step 3:** Habilitar Google e Apple providers no Supabase

> **Adições além do plano original:**
>
> **Migration 002** (feat/migrations-rls, PR #3):
> - Trigger `on_auth_user_created` → cria `profile` automaticamente ao registrar
> - Policy `owner_update` em transactions
> - Policies explícitas em subscriptions: `service_role_insert`, `service_role_update`, `owner_select`
> - Revogado `EXECUTE` de `handle_new_user` para roles `anon` e `authenticated`
>
> **Migration 20260428120000** (feat/supabase-core, PR #4 — RLS best practices):
> - Todas as policies trocadas para `(select auth.uid())` — avaliação por query, não por linha (até 100× mais rápido)
> - `FORCE ROW LEVEL SECURITY` nas 3 tabelas
> - Índice explícito em `subscriptions.user_id`

- [x] **Step 4:** Commit

---

## Task 3: Supabase Clients + Types ✅ CONCLUÍDA

**PR:** #2 (feat/supabase-core)

- [x] **Step 1:** Criar `src/types/index.ts` — Profile, Transaction, Subscription, PotesSummary
- [x] **Step 2:** Criar `src/lib/supabase/client.ts`
- [x] **Step 3:** Criar `src/lib/supabase/server.ts`
- [x] **Step 4:** Criar `src/lib/categories.ts`
- [x] **Step 5:** Commit

> **Divergências do plano:**
> - `client.ts` usa padrão lazy singleton (uma instância por página)
> - `server.ts` é `async` (Next.js 15 exige `await cookies()`)
> - Adicionado `Database` types gerados pelo Supabase (PR #3, commit ba8044d)

---

## Task 4: Potes Calculation Logic (TDD) ✅ CONCLUÍDA

- [x] **Step 1:** Escrever testes primeiro em `src/lib/__tests__/potes.test.ts`
- [x] **Step 2:** Confirmar falha dos testes
- [x] **Step 3:** Implementar `src/lib/potes.ts` — `calcularPotes()` + `formatCurrency()`
- [x] **Step 4:** 5 testes passando (`npx vitest run`)
- [x] **Step 5:** Commit

---

## Task 5: Auth + Middleware ✅ CONCLUÍDA

**PRs:** #1, #2, #4 | **Commits:** 470b593, d9a1ca2, 487ccb2, 9b3e10b

- [x] **Step 1:** Criar `src/app/layout.tsx` (root layout)
- [x] **Step 2:** Criar `src/app/(auth)/layout.tsx` (centered, sem nav)
- [x] **Step 3:** Criar `src/app/(auth)/login/page.tsx` — botões Google + Apple via `signInWithOAuth`
- [x] **Step 4:** Criar `src/app/api/auth/callback/route.ts`
- [x] **Step 5:** Criar `src/middleware.ts` — proteção de rotas + gate de assinatura
- [x] **Step 6:** Testar fluxo de login manualmente
- [x] **Step 7:** Commit

> **Adições além do plano:**
> - `src/app/api/auth/logout/route.ts` — `POST /api/auth/logout`, chama `signOut()`, redireciona para `/login`
> - `src/components/ui/LogoutButton.tsx` — form POST sem JS, aparece em `/config`
> - Callback usa `getUser()` após `exchangeCodeForSession` (valida token no servidor)
> - Callback verifica `subscription` (não `profile`) — profile é criado pelo trigger DB
> - Callback trata race condition: ignora erro `23505` (unique constraint) no insert de subscription
> - `proxy.ts` (duplicata do middleware) removido no PR #4

---

## Task 6: Configurar Potes (Onboarding) ✅ CONCLUÍDA

- [x] **Step 1:** Criar `src/app/(app)/layout.tsx` — `getUser()` + sub guard + `TrialBanner`
- [x] **Step 2:** Criar `src/components/ui/TrialBanner.tsx`
- [x] **Step 3:** Criar `src/components/ui/BottomNav.tsx`
- [x] **Step 4:** Criar `src/components/config/PotesSliders.tsx`
- [x] **Step 5:** Criar `src/app/(app)/config/page.tsx`
- [x] **Step 6:** Testar manualmente
- [x] **Step 7:** Commit

> **Adições além do plano:**
> - `BottomNav` tem 4 itens (Início, Resumo, **+**, Potes ⚙️, Plano 💳) em vez de 3
> - `PotesSliders` usa `getUser()` (não `getSession()`), tem estado `saved` (✓ Salvo!), mensagem de erro, e prop `isSetup` para comportamento diferente no onboarding vs. edição posterior

---

## Task 7: Home Dashboard ✅ CONCLUÍDA

- [x] **Step 1:** Criar `src/components/home/SaldoCard.tsx`
- [x] **Step 2:** Criar `src/components/home/PoteCard.tsx`
- [x] **Step 3:** Criar `src/components/home/RecentTransactions.tsx`
- [x] **Step 4:** Criar `src/app/(app)/page.tsx`
- [x] **Step 5:** Testar manualmente
- [x] **Step 6:** Commit

---

## Task 8: Modal de Lançamento ✅ CONCLUÍDA

- [x] **Step 1:** Criar `src/components/lancamento/DivisaoPreview.tsx`
- [x] **Step 2:** Criar `src/components/lancamento/CategoriaSelector.tsx`
- [x] **Step 3:** Criar `src/components/lancamento/LancamentoModal.tsx`
- [x] **Step 4:** Testar manualmente
- [x] **Step 5:** Commit

---

## Task 9: Tela de Resumo ✅ CONCLUÍDA

- [x] **Step 1:** Criar `src/components/resumo/PoteBar.tsx`
- [x] **Step 2:** Criar `src/components/resumo/AlertaGastos.tsx`
- [x] **Step 3:** Criar `src/components/resumo/TransactionList.tsx`
- [x] **Step 4:** Criar `src/app/(app)/resumo/page.tsx`
- [x] **Step 5:** Testar manualmente
- [x] **Step 6:** Commit

---

## Task 10: Assinatura + Webhook Asaas ✅ CONCLUÍDA

- [x] **Step 1:** Criar `src/lib/asaas.ts`
- [x] **Step 2:** Criar `src/app/api/webhooks/asaas/route.ts`
- [x] **Step 3:** Criar `src/app/(app)/assinatura/page.tsx`
- [x] **Step 4:** Configurar webhook no painel Asaas (URL + token + eventos)
- [x] **Step 5:** Commit

> **Adição além do plano:** `AssinaturaButtons.tsx` extraído como Client Component separado (necessário pois Server Action e interatividade não podem coexistir no mesmo arquivo em Next.js 15).

---

## Task 11: Resend Emails ✅ CONCLUÍDA

- [x] **Step 1:** Criar `src/lib/resend.ts` — `sendWelcomeEmail`, `sendTrialExpiringEmail`, `sendSubscriptionConfirmedEmail`
- [x] **Step 2:** `sendTrialExpiringEmail` chamado no webhook quando `PAYMENT_OVERDUE`
- [x] **Step 3:** Commit

---

## Task 12: PWA + Deploy Vercel ✅ CONCLUÍDA (parcial)

- [x] **Step 1:** Criar `public/manifest.json`
- [x] **Step 2:** Adicionar meta tags mobile em `src/app/layout.tsx`
- [ ] **Step 3:** Criar ícones `public/icon-192.png` e `public/icon-512.png`
- [ ] **Step 4:** Deploy na Vercel (`npx vercel --prod`)
- [ ] **Step 5:** Configurar variáveis de ambiente no painel Vercel
- [ ] **Step 6:** Atualizar `NEXT_PUBLIC_APP_URL` para a URL de produção
- [ ] **Step 7:** Commit final

> **Pendente:** ícones PNG, deploy, vars de ambiente no Vercel.

---

## Checklist de cobertura da spec

| Requisito | Task | Status |
|---|---|---|
| Cadastro e login (Google + Apple) | Task 5 | ✅ |
| Callback OAuth + criação de conta | Task 5 | ✅ |
| Logout | Task 5 (adição) | ✅ |
| Proteção de rotas (middleware) | Task 5 | ✅ |
| Gate de assinatura expirada | Task 5 | ✅ |
| Configurar potes com sliders | Task 6 | ✅ |
| Registrar entradas e saídas | Task 8 | ✅ |
| Categorias por tipo (empresa/pessoal) | Task 3 + Task 8 | ✅ |
| Dashboard de lucro real | Task 7 | ✅ |
| Resumo mensal com barras de potes | Task 9 | ✅ |
| Alerta de gastos pessoais | Task 9 | ✅ |
| Trial 7 dias grátis | Task 5 (callback) | ✅ |
| Assinatura mensal/anual via Asaas | Task 10 | ✅ |
| Webhook Asaas atualiza status | Task 10 | ✅ |
| E-mails (boas-vindas, trial, confirmação) | Task 11 | ✅ |
| PWA mobile-first (manifest + meta tags) | Task 12 | ✅ |
| Ícones PWA | Task 12 | ⏳ pendente |
| Deploy Vercel + vars de ambiente | Task 12 | ⏳ pendente |
| RLS Supabase (dados isolados) | Task 2 | ✅ hardened |
| Cálculo de potes por query (sem persistir) | Task 4 | ✅ |
