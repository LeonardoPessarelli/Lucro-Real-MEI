# Lucro Real MEI — Plano de Execução

> Estratégia: **Interface primeiro, backend depois.**
> Cada milestone entrega algo visível e testável no browser.
> Dados mockados na Fase 1. Integração real na Fase 2.

---

## Visão Geral

```
FASE 1 — INTERFACE (UI-first, dados mockados)
  M0  Setup & Configuração              → branch: main
  M1  Design System & App Shell         → branch: feat/app-shell
  M2  Auth & Onboarding (UI)            → branch: feat/auth-ui
  M3  Home & Dashboard (UI)             → branch: feat/home-ui
  M4  Lançamentos & Categorias (UI)     → branch: feat/lancamentos-ui
  M5  Resumo & Potes (UI)               → branch: feat/resumo-ui
  M6  Configurações & Assinatura (UI)   → branch: feat/config-ui
  M6b Gestão de Leads UI                → branch: feat/leads-ui ✅

FASE 2 — BACKEND & INTEGRAÇÃO
  M7  Banco de Dados & Auth Real        → branch: feat/supabase-core ✅
  M8  Transações & Potes — Dados Reais  → branch: feat/leads-data ✅
  M9  Assinatura & Pagamentos (Asaas)   → branch: feat/billing
  M10 Deploy & Produção                 → branch: feat/deploy
```

---

## FASE 1 — INTERFACE

---

### M0 — Setup & Configuração ✅

**Branch:** `main`
**Objetivo:** Repositório pronto para desenvolvimento com todas as ferramentas configuradas.

#### Entregas

- [x] Scaffold Next.js 16 com TypeScript, Tailwind v4 e App Router
- [x] Instalar dependências: Supabase, Resend, Asaas, react-hook-form, zod, date-fns, lucide-react
- [x] Criar estrutura de pastas (`src/components/`, `src/lib/`, `src/types/`, `src/app/`)
- [x] Configurar `src/types/index.ts` com tipos base (Transaction, Profile, Subscription, PotesSummary)
- [x] Criar `.env.local` com todas as variáveis de ambiente
- [x] Configurar `.gitignore` (incluir `.env*.local`)
- [x] Configurar Vitest para testes unitários
- [x] Verificar `npm run build` sem erros

---

### M1 — Design System & App Shell ✅

**Branch:** `feat/app-shell` — mergeado em `main` (PR #6)
**Objetivo:** Shell da aplicação completo com navegação desktop (sidebar) + mobile (BottomNav + hamburger) e dark mode.

#### Entregas

- [x] `src/app/(app)/layout.tsx` — layout autenticado com DesktopSidebar + Navbar + BottomNav mobile
- [x] `src/components/layout/Sidebar.tsx` — sidebar desktop fixa (w-60) + drawer mobile com overlay e scroll-lock
- [x] `src/components/layout/Navbar.tsx` — topbar sticky com título da página, botão hamburger e avatar
- [x] `src/components/layout/WorkspaceSwitcher.tsx` — dropdown com workspaces fake, troca funcional
- [x] `src/components/ui/BottomNav.tsx` — navegação inferior com `lg:hidden` (só mobile)
- [x] `src/components/ui/PageHeader.tsx` — cabeçalho reutilizável (título + descrição + ação)
- [x] `src/components/ui/EmptyState.tsx` — estado vazio com ícone, texto e CTA
- [x] `src/components/ui/LoadingSkeleton.tsx` — skeleton animado reutilizável
- [x] Dark mode como padrão (`#0a0a0a` fundo, `#111` sidebar, `#2a2a2a` border, `#4ade80` accent)
- [x] Design tokens no `globals.css` (bg, sidebar, card, card2, border, accent, muted — preservando tokens Lucro Real MEI)
- [x] Rota `/dashboard` — placeholder com PageHeader + EmptyState
- [x] Rota `/leads` — placeholder com PageHeader + EmptyState
- [x] Rota `/pipeline` — placeholder com PageHeader + EmptyState
- [x] Rotas `/`, `/resumo`, `/config`, `/assinatura` — preservadas e funcionando

---

### M2 — Auth & Onboarding (UI) ✅

**Branch:** `feat/auth-ui-rework` — mergeado em `main` (PR #7)
**Objetivo:** Fluxo de login/cadastro com validação real e tela de onboarding para nome do workspace.

#### Entregas

- [x] `src/app/(auth)/login/page.tsx` — login + cadastro com react-hook-form + Zod, erros inline por campo, spinner nos botões, Google OAuth
- [x] `src/app/(auth)/layout.tsx` — layout sem nav, tela cheia
- [x] `src/app/(auth)/onboarding/page.tsx` — tela de onboarding: nome do workspace, validação, redirect para `/`
- [x] `src/components/ui/Spinner.tsx` — spinner SVG animado reutilizável
- [x] `src/components/ui/LogoutButton.tsx`
- [x] `src/components/ui/TrialBanner.tsx` — banner de trial expirando
- [x] `src/lib/actions/profile.ts` — `saveOnboardingAction` salva nome e `setup_completo = true`
- [x] Middleware redireciona para `/onboarding` quando `setup_completo = false`

---

### M3 — Home & Dashboard (UI) ✅

**Branch:** `feat/home-ui` — mergeado em `main`
**Objetivo:** Tela principal com lucro pessoal, potes e últimos lançamentos — dados mockados.

#### Entregas

- [x] `src/app/(app)/page.tsx` — Home com dados mockados
- [x] `src/components/home/SaldoCard.tsx` — card verde de lucro pessoal
- [x] `src/components/home/PoteCard.tsx` — card de pote (custos/reserva) com barra
- [x] `src/components/home/RecentTransactions.tsx` — últimos 3 lançamentos
- [x] `src/components/home/Saudacao.tsx` — "Olá, [nome]!" com horário

---

### M4 — Lançamentos & Categorias (UI) ✅

**Branch:** `feat/lancamentos-ui` — mergeado em `main`
**Objetivo:** Modal de lançamento completo com categorias e preview da divisão em potes.

#### Entregas

- [x] `src/components/lancamento/LancamentoModal.tsx` — modal "+" para entrada ou saída
- [x] `src/components/lancamento/CategoriaSelector.tsx` — grid de chips de categorias
- [x] `src/components/lancamento/DivisaoPreview.tsx` — preview da divisão em potes (entradas)
- [x] `src/lib/categories.ts` — lista de categorias (enum no frontend)
- [x] Validação Zod nos campos do formulário

---

### M5 — Resumo & Potes (UI) ✅

**Branch:** `feat/resumo-ui` — mergeado em `main`
**Objetivo:** Tela de resumo com barras dos 3 potes, lista completa de transações e alertas.

#### Entregas

- [x] `src/app/(app)/resumo/page.tsx` — resumo mensal com potes
- [x] `src/components/resumo/PoteBar.tsx` — barra de progresso do pote
- [x] `src/components/resumo/TransactionList.tsx` — lista completa agrupada por dia
- [x] `src/components/resumo/AlertaGastos.tsx` — alerta quando reserva foi usada
- [x] `src/lib/potes.ts` — `calcularPotes()` com lógica de overflow para reserva
- [x] 8 testes unitários em `src/lib/__tests__/potes.test.ts`

---

### M6 — Configurações & Assinatura (UI) ✅

**Branch:** `feat/config-ui` — mergeado em `main`
**Objetivo:** Sliders de configuração dos potes e tela de assinatura com planos.

#### Entregas

- [x] `src/app/(app)/config/page.tsx` — sliders de % dos potes
- [x] `src/components/config/PotesSliders.tsx` — 3 sliders que somam sempre 100%
- [x] `src/app/(app)/assinatura/page.tsx` — tela de trial e planos (mensal/anual)

---

### M6b — Gestão de Leads UI ✅

**Branch:** `feat/leads-ui` — mergeado em `main` (PR #8)
**Branch:** `feat/pipeline-kanban-ui` — mergeado em `main` (PR #9)
**Objetivo:** Lista de leads com busca/filtro, kanban drag-and-drop estilo Pipedrive, página de detalhe e navegação hambúrguer — dados mockados.

#### Entregas

- [x] `src/lib/leads.ts` — tipo `Lead`, `STAGE_CONFIG` (6 estágios com cores), `STAGE_ORDER`, `MOCK_LEADS` (13 leads com `responsavel` e `prazo`)
- [x] `src/components/layout/DrawerProvider.tsx` — Context para estado do drawer (open/close)
- [x] `src/components/layout/Drawer.tsx` — menu lateral animado com 5 destinos (Início, Resumo, Leads, Pipeline, Potes)
- [x] `src/components/layout/Navbar.tsx` — substituído: hambúrguer à esquerda, título dinâmico ao centro, botão "+" à direita
- [x] `src/app/(app)/layout.tsx` — substituído: DrawerProvider + Drawer, sem BottomNav
- [x] `src/components/ui/BottomNav.tsx` — **deletado**
- [x] `src/components/leads/LeadCard.tsx` — card com borda esquerda colorida, modo kanban (compact) e modo lista; badge de prazo com urgência e avatar de responsável
- [x] `src/components/leads/LeadModal.tsx` — modal de CRUD (react-hook-form + Zod), campos obrigatórios validados
- [x] `src/components/leads/NegocioModal.tsx` — modal otimizado para kanban: campos lado-a-lado, `defaultEstagio`, suporte a new/edit
- [x] `src/components/leads/StageFilter.tsx` — chips de filtro por estágio com scroll horizontal
- [x] `src/app/(app)/leads/page.tsx` — lista com busca por nome/serviço + filtro por estágio
- [x] `src/app/(app)/leads/[id]/page.tsx` — detalhe do lead: info, progresso no funil, timeline de atividades
- [x] `src/components/leads/KanbanBoard.tsx` — pipeline header (total aberto, fechado, win rate, barra global), DragOverlay com rotação, modal discriminado por mode
- [x] `src/components/leads/KanbanColumn.tsx` — header Pipedrive-style (barra colorida, contagem, R$ total, % do pipeline), botão +, drop zone com empty state
- [x] `src/app/(app)/pipeline/page.tsx` — kanban horizontal com drag-and-drop entre colunas
- [x] `src/components/ui/EmptyState.tsx` — atualizado para aceitar `ReactNode` como ícone
- [x] `src/app/globals.css` — classes CSS do pipeline (pipeline-*, kanban-card-*, modal-*)

---

## FASE 2 — BACKEND & INTEGRAÇÃO

---

### M7 — Banco de Dados & Auth Real ✅

**Branch:** `feat/supabase-core` — mergeado em `main`
**Objetivo:** Supabase configurado, auth real funcionando, dados persistentes.

#### Entregas

- [ ] Criar projeto no Supabase Dashboard
- [ ] Configurar variáveis de ambiente reais no `.env.local`
- [ ] `src/lib/supabase/client.ts` — browser client
- [ ] `src/lib/supabase/server.ts` — server client com cookies
- [ ] `src/types/supabase.ts` — tipos gerados do Supabase

#### Migrations

> Aplicadas diretamente no **SQL Editor** do Supabase Dashboard. Arquivos em `supabase/migrations/` para controle de versão.

- [ ] `001_initial_schema.sql` — tabelas `profiles`, `transactions`, `subscriptions` + RLS básico + índices
- [ ] `002_rls_hardening.sql` — FORCE RLS + `(select auth.uid())` em todas as políticas
- [ ] `20260428120000_rls_improvements.sql` — trigger `handle_new_user` + UPDATE policy + policies explícitas
- [ ] `20260429_rls_perf_fixes.sql` — otimizações de performance nas políticas RLS

#### Auth Real

- [ ] Configurar Supabase Auth: Google OAuth + Email/Senha habilitados
- [ ] `src/middleware.ts` — protege rotas `(app)/*`, redireciona para `/login` se sem sessão; bloqueia trial expirado
- [ ] `src/app/(auth)/login/page.tsx` — conectar ao Supabase Auth (Google OAuth + email/senha)
- [ ] `src/app/api/auth/callback/route.ts` — `exchangeCodeForSession`, cria subscription trial, e-mail de boas-vindas
- [ ] `src/app/api/auth/logout/route.ts` + `LogoutButton`
- [ ] Trigger `handle_new_user` — cria profile automaticamente no cadastro (SECURITY DEFINER, REVOKE PUBLIC)
- [ ] Redirecionar para `/config` se `setup_completo = false`

#### Verificação

- [ ] Registro → callback → profile criado automaticamente no banco
- [ ] Subscription `trial` criada com `trial_ends_at = now() + 7 days`
- [ ] Logout redireciona para `/login`
- [ ] Rotas protegidas redirecionam quem não está logado
- [ ] RLS: usuário só acessa os próprios dados

---

### M8 — Transações & Potes — Dados Reais ✅

**Branch:** `feat/leads-data` — mergeado em `main`
**Objetivo:** Substituir todos os dados mockados por dados reais do Supabase.

#### Server Actions (`src/lib/actions/`)

- [ ] `transactions.ts` — `createTransactionAction`, `updateTransactionAction`, `deleteTransactionAction`
- [ ] `profile.ts` — `updateProfileAction` (salvar % dos potes + `setup_completo`)

#### Integração nas Páginas

- [ ] `/` — Server Component com query real de transações do mês + `calcularPotes()`
- [ ] `/resumo` — busca transações reais do mês, exibe potes e lista completa
- [ ] Modal de lançamento — Server Action real com `revalidatePath`
- [ ] `/config` — salva `pote_custos_pct`, `pote_reserva_pct`, `pote_salario_pct` no Supabase

#### Verificação

- [ ] CRUD completo de transações funciona e persiste após reload
- [ ] `calcularPotes()` reflete dados reais do banco
- [ ] Sliders de configuração persistem após reload
- [ ] RLS: usuário só vê as próprias transações

---

### M9 — Assinatura & Pagamentos (Asaas) 🔄

**Branch:** `feat/billing`
**Objetivo:** Planos mensal e anual com checkout Asaas, webhook e enforcement do trial.

#### Setup Asaas

- [ ] `src/lib/asaas.ts` — cliente Asaas: `createCustomer()`, `createSubscription()`, `cancelSubscription()`
- [ ] Configurar variáveis: `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`
- [ ] Criar planos no Asaas Dashboard: R$19,90/mês e R$97/ano

#### Checkout

- [ ] Server Action `createAsaasCheckoutAction()` em `src/lib/actions/billing.ts`
  - Cria cliente no Asaas se não existir
  - Gera link de pagamento para o plano selecionado
  - Salva `asaas_id` na subscription
- [ ] Tela `/assinatura` — botões "Assinar Mensal" e "Assinar Anual" chamam a Server Action

#### Webhook (Route Handler)

- [ ] `src/app/api/webhooks/asaas/route.ts` — valida header `asaas-access-token`
- [ ] Supabase Admin com `SUPABASE_SERVICE_ROLE_KEY` (webhook não tem sessão de usuário)
- [ ] Eventos tratados:
  - `PAYMENT_RECEIVED` / `PAYMENT_CONFIRMED` → `status = 'active'`, salva `plan`
  - `PAYMENT_OVERDUE` → `status = 'expired'`
  - `SUBSCRIPTION_DELETED` → `status = 'expired'`

#### Enforcement do Trial

- [ ] `src/lib/limits.ts` — `isTrialExpired()`, `isActive()`
- [ ] Middleware bloqueia acesso ao app se trial expirado e sem assinatura ativa
- [ ] `TrialBanner.tsx` — exibe dias restantes do trial, link para `/assinatura`

#### Verificação

- [ ] Checkout completo → plano atualiza no Supabase
- [ ] Trial expirado → usuário bloqueado e redirecionado para `/assinatura`
- [ ] Cancelamento via Asaas → status volta para `expired`
- [ ] Webhook idempotente (re-processar mesmo evento não duplica dados)

#### Commit Final
```
feat(billing): Asaas checkout, webhook handler, trial enforcement, subscription page
```

---

### M10 — Deploy & Produção 🔄

**Branch:** `feat/deploy`
**Objetivo:** Aplicação em produção no Vercel + Supabase, estável e monitorável.

#### Supabase em Produção

- [ ] Script consolidado de migrations aplicado no projeto de produção
- [ ] RLS habilitado em todas as tabelas (`profiles`, `transactions`, `subscriptions`)
- [ ] Trigger `handle_new_user` com REVOKE de PUBLIC — não exposta via `/rpc`
- [ ] Supabase Auth configurado com URLs de produção
- [ ] Ativar "Leaked password protection": Supabase Dashboard → Auth → Settings

#### Resend — E-mails

- [] `src/lib/resend.ts` — lazy singleton
- [ ] Template de e-mail de boas-vindas configurado no Supabase Dashboard
- [ ] Domínio verificado no Resend (ou usar `onboarding@resend.dev` para testes)

#### Vercel

- [ ] Repositório GitHub conectado ao Vercel (deploy automático na `main`)
- [ ] Variáveis de ambiente configuradas no Vercel Dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `ASAAS_API_KEY`
  - `ASAAS_WEBHOOK_TOKEN`
  - `NEXT_PUBLIC_APP_URL`
- [ ] Deploy em produção com build sem erros

#### Asaas Webhook em Produção

- [ ] Criar webhook no Asaas Dashboard → URL: `https://SEU-DOMINIO.vercel.app/api/webhooks/asaas`
- [ ] Eventos: `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE`, `SUBSCRIPTION_DELETED`
- [ ] Atualizar `ASAAS_WEBHOOK_TOKEN` no Vercel com o token configurado no Asaas

#### Segurança

- [ ] Security headers no `next.config.ts`: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- [ ] `poweredByHeader: false`
- [ ] `.env*.local` e `.vercel` no `.gitignore`
- [ ] Service role key isolada apenas no webhook handler e server actions

#### Checklist Final

- [ ] Migrations SQL executadas no Supabase (profiles, transactions, subscriptions + RLS)
- [ ] Migrations de RLS hardening aplicadas
- [ ] Trigger `on_auth_user_created` ativo
- [ ] Auth conectado ao Supabase (Google OAuth + e-mail/senha)
- [ ] Middleware de proteção de rotas
- [ ] Callback OAuth + criação de subscription trial
- [ ] Logout funcional
- [ ] RLS policies auditadas e otimizadas
- [ ] Leaked password protection ativado
- [ ] Template de e-mail configurado no Supabase
- [ ] Resend configurado (domínio verificado ou `onboarding@resend.dev`)
- [ ] Webhook configurado no Asaas
- [ ] Deploy feito no Vercel
- [ ] Variáveis de ambiente adicionadas no Vercel Dashboard
- [ ] `NEXT_PUBLIC_APP_URL` atualizado com a URL real de produção

#### Commit Final
```
feat(deploy): production deployment on Vercel + Supabase, security hardening
```

---

## Referência Rápida de Branches

| Branch | Milestone | Descrição |
|---|---|---|
| `main` | M0 | Setup inicial |
| `feat/app-shell` | M1 | Layout mobile-first, BottomNav, dark mode |
| `feat/auth-ui` | M2 | Login Google/Apple (UI) |
| `feat/home-ui` | M3 | Home com potes e lançamentos (UI) |
| `feat/lancamentos-ui` | M4 | Modal de lançamento + categorias (UI) |
| `feat/resumo-ui` | M5 | Resumo dos potes + lista completa (UI) |
| `feat/config-ui` | M6 | Sliders de % + assinatura (UI) |
| `feat/leads-ui` | M6b | Leads, pipeline kanban, nav hambúrguer ✅ |
| `feat/pipeline-kanban-ui` | M6b | Pipeline Kanban estilo Pipedrive, métricas, DnD ✅ |
| `feat/supabase-core` | M7 | Auth real + migrations + RLS ✅ |
| `feat/leads-data` | M8 | CRUD real transações + potes ✅ |
| `feat/billing` | M9 | Asaas checkout + webhook + trial |
| `feat/deploy` | M10 | Deploy produção Vercel |

---

## Sequência de Merge

```
feat/app-shell      → main
feat/auth-ui        → main
feat/home-ui        → main
feat/lancamentos-ui → main
feat/resumo-ui      → main
feat/config-ui      → main
feat/leads-ui               → main  ✅
feat/pipeline-kanban-ui     → main  ✅
feat/supabase-core          → main  ← ponto de virada: dados reais ✅
feat/leads-data     → main  ✅
feat/billing        → main
feat/deploy         → main  ← produção
```

Cada merge deve passar em `npm run build` e `npm test` sem erros.
