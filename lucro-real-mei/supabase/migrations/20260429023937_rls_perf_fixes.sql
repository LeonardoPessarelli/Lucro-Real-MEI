-- Migration 003: corrigir performance RLS + segurança handle_new_user
--
-- Problemas detectados pelos advisors do Supabase:
--
-- PERFORMANCE: 3 policies chamam auth.uid() / auth.role() sem (select ...),
-- o que faz o Postgres reavaliar a função para cada linha da tabela.
-- Regra §3.3 best-practices: wrap em SELECT → avaliado 1x e cacheado.
--
-- SEGURANÇA: handle_new_user() estava exposta via /rest/v1/rpc para anon e
-- authenticated apesar do REVOKE na migration anterior não ter chegado ao banco.

-- ── transactions: owner_update ────────────────────────────────────────────────
drop policy if exists "owner_update" on public.transactions;

create policy "owner_update" on public.transactions
  for update to authenticated
  using      ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ── subscriptions: service_role_insert ───────────────────────────────────────
drop policy if exists "service_role_insert" on public.subscriptions;

create policy "service_role_insert" on public.subscriptions
  for insert
  with check ((select auth.role()) = 'service_role');

-- ── subscriptions: service_role_update ───────────────────────────────────────
drop policy if exists "service_role_update" on public.subscriptions;

create policy "service_role_update" on public.subscriptions
  for update
  using      ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

-- ── subscriptions: service_role_delete ───────────────────────────────────────
drop policy if exists "service_role_delete" on public.subscriptions;

create policy "service_role_delete" on public.subscriptions
  for delete
  using ((select auth.role()) = 'service_role');

-- ── handle_new_user: revogar execução pública ────────────────────────────────
-- Função interna — só o trigger on_auth_user_created deve chamá-la.
-- REVOKE FROM anon/authenticated não é suficiente porque o grant está em PUBLIC.
-- É necessário revogar de PUBLIC explicitamente.
revoke execute on function public.handle_new_user() from public;
