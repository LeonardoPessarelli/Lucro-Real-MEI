# Lucro Real MEI — Design Spec
**Data:** 2026-04-24

## Problema

MEIs e autônomos confundem faturamento com lucro pessoal. Gastam o dinheiro dos custos do negócio em despesas pessoais e, quando precisam repor material ou pagar o DAS-MEI, recorrem a crédito caro — gerando endividamento.

## Solução

Rastreador de caixa que divide automaticamente cada real recebido em "potes" (Custos, Reserva, Salário), mostrando ao usuário quanto do dinheiro é realmente dele — sem integração bancária, sem saque real.

---

## MVP — Escopo

| Feature | Incluso |
|---|---|
| Cadastro e login | ✅ |
| Configurar potes (%) | ✅ |
| Registrar entradas e saídas | ✅ |
| Dashboard de lucro real | ✅ |
| Assinatura (Asaas) | ✅ |
| Alertas de DAS-MEI | ❌ v2 |

---

## Arquitetura

**Stack:** Next.js (App Router) + Supabase + Vercel + Asaas + Resend

```
Usuário (celular)
      │
      ▼
  Next.js (Vercel)
  ├── Server Components → dashboard, resumo (SSR)
  ├── Client Components → formulário de lançamento
  └── /api/webhooks/asaas → recebe eventos de pagamento
      │
      ▼
  Supabase
  ├── Auth (Google + Apple Sign In)
  ├── Postgres (RLS — cada usuário vê só os próprios dados)
  └── Edge Functions (não usadas no MVP)
      │
      ▼
  Asaas → cobrança mensal R$19,90 / anual R$97
  Resend → e-mail de boas-vindas e renovação
```

**Princípio de backend:** lógica de negócio mínima. Saldos dos potes são calculados na query (SUM das transactions), nunca persistidos — evita inconsistência.

---

## Modelo de Dados

### `profiles`
```sql
id            uuid  PK (= auth.users.id)
nome          text
pote_custos_pct    integer  -- ex: 40
pote_reserva_pct   integer  -- ex: 20
pote_salario_pct   integer  -- ex: 40 (sempre: custos + reserva + salario = 100)
created_at    timestamptz
```

### `transactions`
```sql
id          uuid  PK
user_id     uuid  FK → profiles.id
tipo        text  CHECK (tipo IN ('entrada', 'saida'))
valor       numeric(10,2)
descricao   text
created_at  timestamptz
```

### `subscriptions`
```sql
id              uuid  PK
user_id         uuid  FK → profiles.id
status          text  CHECK (status IN ('trial', 'active', 'expired'))
trial_ends_at   timestamptz
asaas_id        text  -- ID do cliente no Asaas
plan            text  CHECK (plan IN ('monthly', 'annual'))
```

**RLS:** todas as tabelas bloqueadas por `auth.uid() = user_id`.

---

## Autenticação

- Google Sign In (Android + web)
- Apple Sign In (iPhone/Safari)
- Sem email/senha — menos fricção para o público-alvo
- Supabase Auth gerencia os provedores

---

## Modelo de Acesso

- Trial 7 dias grátis ao criar conta (sem cartão)
- Após trial: assina R$19,90/mês ou R$97/ano via Asaas
- Expirado sem assinatura → bloqueio de acesso, dados preservados por 30 dias

---

## Telas (4 telas no MVP)

### 1. Home
- Card verde em destaque: **"Seu lucro pessoal no mês: R$ X"**
- Subtítulo discreto: "do total de R$ Y recebidos"
- Dois potes abaixo (Custos e Reserva) com barra de progresso e valor
- Lista dos últimos 3 lançamentos
- Bottom nav com botão "+" central

### 2. Lançamento (modal ao tocar "+")
- Toggle Entrada / Saída
- Campo de valor grande (digitação direta)
- Campo de descrição (opcional)
- Divisão automática exibida em tempo real antes de confirmar
- Botão "Confirmar lançamento"

### 3. Resumo
- Barras de progresso dos 3 potes com valores do mês
- Faturamento total do mês no topo
- Lista completa de lançamentos com scroll

### 4. Configurar Potes (setup inicial + settings)
- 3 sliders coloridos (amarelo / roxo / verde)
- Total sempre exibe 100% — ajuste em um slider redistribui os outros
- Salvar configuração

---

## Design Language

- Dark mode (#0d0d0d fundo, #111/#1a1a1a cards)
- Verde #4ade80 / #16a34a → lucro pessoal (positivo)
- Âmbar #f59e0b → custos
- Roxo #818cf8 → reserva
- Vermelho #f87171 → saídas
- Fonte system-ui, números em peso 700–800
- Bottom nav com botão "+" central (estilo Nubank/Instagram)
- Nenhum dado desnecessário na tela — só o que o usuário precisa agir

---

## Fluxo de Assinatura (Asaas)

1. Usuário cria conta → `subscriptions.status = 'trial'`, `trial_ends_at = now() + 7 days`
2. App exibe banner de trial com countdown
3. No dia 7: Asaas cria cobrança, webhook atualiza `status = 'active'` ou `'expired'`
4. Renovações mensais/anuais gerenciadas pelo Asaas

---

## E-mails (Resend)

| Evento | E-mail |
|---|---|
| Cadastro | Boas-vindas + como configurar potes |
| Trial D-1 | Lembrete de expiração |
| Assinatura ativa | Confirmação |
| Pagamento falhou | Aviso de inadimplência |

---

## O que NÃO está no MVP

- Alertas de DAS-MEI (v2)
- Metas por pote (v2)
- Exportar relatório PDF (v2)
- Multi-usuário / conta familiar (v3)
- App nativo (React Native) — PWA do Next.js é suficiente para v1
