# Migrations & Segurança RLS — Aula 3.2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir lacunas de segurança RLS e criar trigger de auto-provisionamento de perfil no banco Supabase, registrando tudo em uma migration versionada.

**Architecture:** Toda a lógica roda no banco via PostgreSQL — uma função + trigger cria o perfil automaticamente quando um usuário se registra no Auth, eliminando a dependência do callback de API para esse passo. Uma segunda migration adiciona a política de UPDATE em `transactions` (que estava faltando) e torna explícita a restrição de escrita em `subscriptions` (somente `service_role`).

**Tech Stack:** Supabase (PostgreSQL 15+), Supabase CLI, MCP supabase tools, SQL puro.

---

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `lucro-real-mei/supabase/migrations/002_rls_improvements.sql` | Criar | Trigger de auto-perfil + UPDATE policy em transactions + policy explícita em subscriptions |
| `lucro-real-mei/src/app/api/auth/callback/route.ts` | Modificar | Remover criação manual de profile (agora feita pelo trigger) — manter só a subscription trial |

---

## Contexto: o que já existe

A migration `001_initial_schema.sql` criou:
- `profiles` — RLS ativo, políticas SELECT / INSERT / UPDATE por `auth.uid() = id`
- `transactions` — RLS ativo, políticas SELECT / INSERT / DELETE — **falta UPDATE**
- `subscriptions` — RLS ativo, apenas SELECT para o dono — **nenhuma política explícita bloqueia escrita anônima**

O callback `/api/auth/callback/route.ts` cria o profile manualmente após login. Isso funciona, mas é frágil: se o callback falhar, o usuário fica sem profile. O trigger no banco garante que o profile sempre existirá.

---

## Task 1: Criar a migration SQL

**Arquivos:**
- Criar: `lucro-real-mei/supabase/migrations/002_rls_improvements.sql`

- [x] **Passo 1: Criar o arquivo de migration com o CLI**

Entre na pasta do projeto:
```bash
cd lucro-real-mei
supabase migration new rls_improvements
```
O CLI vai criar um arquivo com timestamp, ex: `supabase/migrations/20260428120000_rls_improvements.sql`.  
Renomeie mentalmente como `002_rls_improvements.sql` — o timestamp é o que importa para ordenação.

- [x] **Passo 2: Colar o SQL no arquivo gerado**

Abra o arquivo que o CLI criou e substitua o conteúdo por:

```sql
-- ============================================================
-- 1. Trigger: cria profile automaticamente ao cadastrar usuário
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nome)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Coloca a função em schema privado para evitar exposição via API
-- (a função já está em public mas é security definer — OK enquanto
--  não está exposta como RPC. Se quiser mover para schema privado,
--  crie o schema e ajuste o caminho.)

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. UPDATE policy em transactions (estava faltando)
-- ============================================================
-- Sem essa policy, chamar .update() retorna 0 linhas sem erro —
-- comportamento silencioso que confunde muito.
create policy "owner_update"
  on public.transactions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 3. Tornar explícito que subscriptions só service_role escreve
-- ============================================================
-- O Supabase nega por padrão qualquer operação sem policy,
-- mas políticas explícitas documentam a intenção e evitam
-- surpresas se alguém adicionar uma policy genérica futuramente.
create policy "service_role_insert"
  on public.subscriptions
  for insert
  with check (auth.role() = 'service_role');

create policy "service_role_update"
  on public.subscriptions
  for update
  using (auth.role() = 'service_role');

create policy "service_role_delete"
  on public.subscriptions
  for delete
  using (auth.role() = 'service_role');
```

- [x] **Passo 3: Aplicar a migration no banco remoto via MCP**

Use a ferramenta MCP `mcp__plugin_supabase_supabase__apply_migration` com o conteúdo SQL acima e o nome `rls_improvements`.

Resultado esperado: nenhum erro. Se aparecer `already exists` no trigger, é porque o banco já tem — remova o `create trigger` e reaplique só o restante.

- [x] **Passo 4: Verificar que o trigger existe**

Use `mcp__plugin_supabase_supabase__execute_sql` com:
```sql
select trigger_name, event_object_table, action_timing
from information_schema.triggers
where trigger_name = 'on_auth_user_created';
```
Resultado esperado: 1 linha com `on_auth_user_created`, tabela `users`, timing `AFTER`.

- [x] **Passo 5: Verificar as policies novas**

```sql
select tablename, policyname, cmd
from pg_policies
where tablename in ('transactions', 'subscriptions')
order by tablename, policyname;
```
Resultado esperado para `transactions`: `owner_delete`, `owner_insert`, `owner_select`, `owner_update`.  
Resultado esperado para `subscriptions`: `owner_select`, `service_role_delete`, `service_role_insert`, `service_role_update`.

- [x] **Passo 6: Commit**

```bash
git add lucro-real-mei/supabase/migrations/
git commit -m "feat(db): migration 002 — trigger auto-profile, UPDATE policy em transactions, policies explícitas em subscriptions"
```

---

## Task 2: Simplificar o callback de auth

**Arquivos:**
- Modificar: `lucro-real-mei/src/app/api/auth/callback/route.ts`

O trigger agora cria o profile automaticamente. O callback pode parar de fazer isso manualmente — só precisa criar a `subscription` trial (que ainda é responsabilidade da aplicação, pois o trigger não sabe de regras de negócio como "7 dias de trial").

- [x] **Passo 1: Substituir o conteúdo do callback**

Substitua `lucro-real-mei/src/app/api/auth/callback/route.ts` por:

```typescript
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session?.user) {
      const serviceClient = createServiceClient()

      // Verifica se é o primeiro login (subscription ainda não existe)
      const { data: subscription } = await serviceClient
        .from('subscriptions')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (!subscription) {
        // Profile já foi criado pelo trigger on_auth_user_created
        const trialEnd = new Date()
        trialEnd.setDate(trialEnd.getDate() + 7)

        await serviceClient.from('subscriptions').insert({
          user_id: session.user.id,
          status: 'trial',
          trial_ends_at: trialEnd.toISOString(),
        })

        try {
          const { sendWelcomeEmail } = await import('@/lib/resend')
          if (session.user.email) {
            await sendWelcomeEmail(
              session.user.email,
              session.user.user_metadata?.full_name ?? 'MEI'
            )
          }
        } catch {
          // non-critical, não bloqueia o onboarding
        }

        return NextResponse.redirect(new URL('/config', requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
```

- [x] **Passo 2: Verificar TypeScript**

```bash
cd lucro-real-mei
npx tsc --noEmit
```
Resultado esperado: nenhum erro.

- [x] **Passo 3: Rodar os testes existentes**

```bash
cd lucro-real-mei
npx vitest run
```
Resultado esperado: todos os testes passam (os testes atuais cobrem `potes.ts`, não o callback).

- [x] **Passo 4: Commit**

```bash
git add lucro-real-mei/src/app/api/auth/callback/route.ts
git commit -m "refactor(auth): remover criação manual de profile do callback — agora feita pelo trigger DB"
```

---

## Task 3: Teste de fumaça manual (smoke test)

Não há testes automatizados para o trigger (requereria uma conta real no Supabase Auth). Faça o teste manual:

- [x] **Passo 1: Verificar o trigger via SQL (simula o insert)**

Use `execute_sql`:
```sql
-- Simula o que o trigger faz (sem criar usuário real)
select public.handle_new_user();
```
Resultado esperado: erro `missing FROM-clause entry for table "new"` — isso é **correto**, significa que a função existe e só funciona dentro de um trigger (como esperado).

- [x] **Passo 2: Confirmar que as tabelas têm RLS ativo**

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles', 'transactions', 'subscriptions');
```
Resultado esperado: `rowsecurity = true` nas 3 linhas.

- [x] **Passo 3: Confirmar ausência de advisors de segurança**

Use `mcp__plugin_supabase_supabase__get_advisors` para checar se há alertas de segurança pendentes.  
Resultado esperado: nenhum alerta crítico relacionado a RLS ou funções sem `search_path`.

---

## Checklist de segurança final

Antes de considerar a aula concluída, verifique cada item:

- [x] `handle_new_user()` usa `security definer` + `set search_path = ''` (impede search_path hijacking)
- [x] Nenhuma policy usa `raw_user_meta_data` para decisões de autorização (usamos só `auth.uid()` e `auth.role()`)
- [x] `subscriptions` não tem policies de INSERT/UPDATE/DELETE para `authenticated` ou `anon`
- [x] `transactions` tem as 4 policies CRUD completas (SELECT, INSERT, UPDATE, DELETE)
- [x] `profiles` tem as 3 policies necessárias (SELECT, INSERT, UPDATE) — DELETE não é necessário pois o cascade cuida disso
- [x] `service_role` key nunca aparece em variável `NEXT_PUBLIC_*`
