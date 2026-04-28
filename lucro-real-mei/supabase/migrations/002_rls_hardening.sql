-- Migration 002: RLS hardening e best practices de performance
--
-- Problema: policies da migration 001 chamam auth.uid() por linha avaliada,
-- o que é O(n) em tabelas grandes. Envolver em (select auth.uid()) faz o
-- Postgres avaliar uma vez e cachear — até 100x mais rápido.
-- Também adiciona FORCE ROW LEVEL SECURITY para impedir bypass pelo owner.

-- ── profiles ────────────────────────────────────────────────────────────────

alter table public.profiles force row level security;

drop policy if exists "owner_select" on public.profiles;
drop policy if exists "owner_update" on public.profiles;
drop policy if exists "owner_insert" on public.profiles;

create policy "owner_select" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "owner_update" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "owner_insert" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

-- ── transactions ─────────────────────────────────────────────────────────────

alter table public.transactions force row level security;

drop policy if exists "owner_select" on public.transactions;
drop policy if exists "owner_insert" on public.transactions;
drop policy if exists "owner_delete" on public.transactions;

create policy "owner_select" on public.transactions
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "owner_insert" on public.transactions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "owner_delete" on public.transactions
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ── subscriptions ────────────────────────────────────────────────────────────

alter table public.subscriptions force row level security;

drop policy if exists "owner_select" on public.subscriptions;

create policy "owner_select" on public.subscriptions
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Índice FK em subscriptions.user_id (o UNIQUE constraint não é suficiente
-- para acelerar queries de JOIN e CASCADE — um índice explícito é mais claro
-- e garante que o planner o use corretamente)
create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);
