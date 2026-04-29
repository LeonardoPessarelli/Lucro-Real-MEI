# Lucro Real MEI — Architecture

Guia rápido para novas janelas do Claude Code. Leia antes de qualquer tarefa.

---

## O que é

App mobile-first (PWA) para MEIs e autônomos dividirem automaticamente o faturamento em três "potes": Custos do negócio, Reserva de emergência, e Salário pessoal. O objetivo é mostrar quanto do dinheiro recebido é realmente lucro pessoal.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend / Backend | Next.js 16 (App Router) |
| Banco de dados + Auth | Supabase (Postgres + Auth) |
| Deploy | Vercel |
| Pagamentos | Asaas (R$19,90/mês ou R$97/ano) |
| E-mails | Resend |
| Testes | Vitest |
| Estilo | Tailwind v4 + dark mode |

---

## Princípio central de cálculo

**Saldos nunca são persistidos.** A função `calcularPotes()` recebe todas as transações do mês e recalcula tudo do zero a cada carregamento. Isso evita inconsistência entre banco e tela.

Quando o usuário gasta mais do que o pote permite, o excesso sai da Reserva:
- `reserva_usada_empresa` = overflow de gastos de empresa
- `reserva_usada_pessoal` = overflow de gastos pessoais
- `pote_reserva_restante` = reserva alocada - ambos os overflows

---

## Estrutura de arquivos

```
lucro-real-mei/src/
├── app/
│   ├── layout.tsx                    # Root layout (fontes, globals)
│   ├── (auth)/
│   │   ├── layout.tsx                # Layout sem nav (tela cheia)
│   │   └── login/page.tsx            # Login via Google/Apple
│   ├── (app)/
│   │   ├── layout.tsx                # Layout com BottomNav
│   │   ├── page.tsx                  # Home — dashboard mensal
│   │   ├── resumo/page.tsx           # Resumo — potes + lista completa
│   │   ├── config/page.tsx           # Configurar % dos potes
│   │   └── assinatura/page.tsx       # Página de assinatura (Asaas)
│   └── api/
│       ├── auth/callback/route.ts    # Callback OAuth do Supabase
│       └── webhooks/asaas/route.ts  # Recebe eventos de pagamento
│
├── components/
│   ├── home/
│   │   ├── Saudacao.tsx              # "Olá, [nome]!" (client — usa Date)
│   │   ├── SaldoCard.tsx             # Card verde de lucro pessoal
│   │   ├── PoteCard.tsx              # Card de pote (custos/reserva) com barra
│   │   └── RecentTransactions.tsx    # Últimos 3 lançamentos
│   ├── resumo/
│   │   ├── PoteBar.tsx               # Barra de progresso do pote
│   │   ├── TransactionList.tsx       # Lista completa agrupada por dia
│   │   └── AlertaGastos.tsx          # Alerta quando reserva foi usada
│   ├── lancamento/
│   │   ├── LancamentoModal.tsx       # Modal "+" — registra entrada ou saída
│   │   ├── CategoriaSelector.tsx     # Grid de chips de categorias
│   │   └── DivisaoPreview.tsx        # Preview da divisão em potes (entradas)
│   ├── config/
│   │   └── PotesSliders.tsx          # 3 sliders de % dos potes
│   └── ui/
│       ├── BottomNav.tsx             # Nav inferior (5 itens + botão +)
│       ├── TrialBanner.tsx           # Banner de trial expirando
│       └── LogoutButton.tsx          # Botão de logout
│
├── lib/
│   ├── potes.ts                      # calcularPotes() — lógica financeira central
│   ├── categories.ts                 # Lista de categorias (enum no frontend)
│   ├── asaas.ts                      # Cliente Asaas (criar cliente, assinar, cancelar)
│   ├── resend.ts                     # Envio de e-mails (boas-vindas, trial, confirmação)
│   ├── supabase/
│   │   ├── server.ts                 # createClient() e createServiceClient() para Server
│   │   └── client.ts                 # createClient() para Client Components
│   └── __tests__/
│       └── potes.test.ts             # 8 testes unitários de calcularPotes()
│
└── types/
    ├── index.ts                      # Transaction, Profile, Subscription, PotesSummary
    └── supabase.ts                   # Tipos gerados automaticamente do Supabase
```

---

## Banco de dados (Supabase)

### `profiles`
```sql
id                uuid  PK (= auth.users.id)
nome              text
pote_custos_pct   integer   -- ex: 40
pote_reserva_pct  integer   -- ex: 20
pote_salario_pct  integer   -- ex: 40 (soma sempre = 100)
setup_completo    boolean   -- false até o usuário salvar os sliders
created_at        timestamptz
```

### `transactions`
```sql
id          uuid  PK
user_id     uuid  FK → profiles.id
tipo        text  CHECK IN ('entrada', 'saida')
valor       numeric(10,2)
descricao   text
categoria   text        -- slug (ex: 'gasolina', 'mercado', 'servico')
tipo_gasto  text        -- só saídas: CHECK IN ('empresa', 'pessoal')
created_at  timestamptz
```

### `subscriptions`
```sql
id             uuid  PK
user_id        uuid  FK → profiles.id
status         text  CHECK IN ('trial', 'active', 'expired')
trial_ends_at  timestamptz
asaas_id       text  -- ID do cliente no Asaas
plan           text  CHECK IN ('monthly', 'annual')
```

**RLS:** todas as tabelas usam `auth.uid() = user_id`. Usuário só acessa os próprios dados. `subscriptions` só pode ser escrita pelo `service_role`.

### Migrações SQL

| Arquivo | O que faz |
|---|---|
| `001_initial_schema.sql` | Cria as 3 tabelas + RLS básico + índices |
| `002_rls_hardening.sql` | FORCE RLS + otimiza `auth.uid()` com `(select auth.uid())` |
| `20260428120000_rls_improvements.sql` | Trigger `handle_new_user` + UPDATE policy em transactions + policies explícitas em subscriptions |

---

## Fluxo de autenticação

1. Login via Google ou Apple → Supabase Auth
2. Supabase redireciona para `/api/auth/callback` com o `code`
3. Callback troca `code` por sessão; trigger DB cria o profile automaticamente
4. Callback cria `subscription` com trial 7 dias (apenas no primeiro login)
5. Novo usuário → redireciona para `/config`; usuário existente → redireciona para `/`

---

## Fluxo de assinatura

1. Conta criada → `subscriptions.status = 'trial'`, `trial_ends_at = now() + 7 days`
2. Tela `/assinatura` cria cliente no Asaas e gera link de pagamento
3. Asaas envia eventos para `/api/webhooks/asaas` (validado por header `asaas-access-token`)
4. Webhook atualiza `subscriptions.status` para `active` ou `expired`

**Eventos do webhook:**
- `PAYMENT_RECEIVED` / `PAYMENT_CONFIRMED` → `status = 'active'`
- `PAYMENT_OVERDUE` → `status = 'expired'`
- `SUBSCRIPTION_DELETED` → `status = 'expired'`

---

## Variáveis de ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only — nunca expor no cliente

# Resend
RESEND_API_KEY=

# Asaas
ASAAS_API_KEY=
ASAAS_WEBHOOK_TOKEN=             # validação do header do webhook

# URL
NEXT_PUBLIC_APP_URL=
```

---

## Design system

| Token | Cor | Uso |
|---|---|---|
| `text-verde` / `bg-verde` | `#4ade80` | Lucro pessoal, ações positivas |
| `text-ambar` / `bg-ambar` | `#f59e0b` | Pote Custos |
| `text-roxo` / `bg-roxo` | `#818cf8` | Pote Reserva |
| `text-vermelho` | `#f87171` | Saídas, alertas |
| `bg-card` | `#111111` | Card principal |
| `bg-card2` | `#1a1a1a` | Card secundário |
| Fundo | `#0d0d0d` | Página |

---

## Telas (4 no MVP)

| Rota | Arquivo | Descrição |
|---|---|---|
| `/login` | `(auth)/login/page.tsx` | Login Google/Apple |
| `/` | `(app)/page.tsx` | Home — lucro pessoal + potes + últimos lançamentos |
| `/resumo` | `(app)/resumo/page.tsx` | Barras dos 3 potes + lista completa + alerta reserva |
| `/config` | `(app)/config/page.tsx` | Sliders de % (setup inicial e edição posterior) |
| `/assinatura` | `(app)/assinatura/page.tsx` | Trial/assinatura via Asaas |

---

## Comandos úteis

```bash
# Rodar localmente
cd lucro-real-mei
npm run dev

# Rodar testes
npm test

# Deploy
npx vercel --prod
```

---

## Para deploy: veja `docs/plan.md`

O `docs/plan.md` tem o checklist completo com:
- Criar `.env.local`
- Rodar migração SQL no Supabase
- Configurar Resend
- Configurar webhook Asaas
- Deploy no Vercel + variáveis de ambiente
