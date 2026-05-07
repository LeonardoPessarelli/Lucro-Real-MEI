-- =============================================================================
-- Migration: workspaces, workspace_members, leads, deals, activities
-- Aplique no SQL Editor do Supabase Studio na ordem apresentada.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. WORKSPACES
-- ─────────────────────────────────────────────────────────────────────────────

create table public.workspaces (
  id         uuid default gen_random_uuid() primary key,
  owner_id   uuid references auth.users on delete cascade not null,
  nome       text not null,
  created_at timestamptz default now()
);

alter table public.workspaces enable row level security;
alter table public.workspaces force row level security;

create index workspaces_owner_id_idx on public.workspaces (owner_id);

create policy "workspace_owner_select"
  on public.workspaces for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "workspace_owner_insert"
  on public.workspaces for insert to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "workspace_owner_update"
  on public.workspaces for update to authenticated
  using      ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "workspace_owner_delete"
  on public.workspaces for delete to authenticated
  using ((select auth.uid()) = owner_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. WORKSPACE_MEMBERS
-- ─────────────────────────────────────────────────────────────────────────────

create table public.workspace_members (
  id           uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id      uuid references auth.users on delete cascade not null,
  role         text not null default 'member'
                 check (role in ('owner', 'member')),
  created_at   timestamptz default now(),
  unique (workspace_id, user_id)
);

alter table public.workspace_members enable row level security;
alter table public.workspace_members force row level security;

create index workspace_members_workspace_idx on public.workspace_members (workspace_id);
create index workspace_members_user_idx      on public.workspace_members (user_id);

-- Função auxiliar: retorna os workspace_ids do usuário corrente.
-- security definer + search_path = '' evitam recursão RLS e search_path injection.
-- Fica em public pois as policies das outras tabelas a referenciam por nome qualificado.
-- O REVOKE ao final remove o acesso padrão de PUBLIC; o GRANT devolve só para authenticated.
create or replace function public.my_workspace_ids()
returns setof uuid
language sql
security definer
stable
set search_path = ''
as $$
  select workspace_id
  from public.workspace_members
  where user_id = (select auth.uid())
$$;

-- Membros lêem outros membros do mesmo workspace
create policy "member_select_same_workspace"
  on public.workspace_members for select to authenticated
  using (workspace_id in (select public.my_workspace_ids()));

-- Só o owner insere/remove membros
create policy "owner_insert_member"
  on public.workspace_members for insert to authenticated
  with check (
    workspace_id in (
      select id from public.workspaces
      where owner_id = (select auth.uid())
    )
  );

create policy "owner_delete_member"
  on public.workspace_members for delete to authenticated
  using (
    workspace_id in (
      select id from public.workspaces
      where owner_id = (select auth.uid())
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Função set_updated_at (compartilhada por leads e deals)
--    Definida aqui, antes das tabelas que a usam.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. LEADS
-- ─────────────────────────────────────────────────────────────────────────────

create table public.leads (
  id           uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  nome         text not null,
  contato      text,
  origem       text,
  servico      text,
  anotacoes    text,
  estagio      text not null default 'novo'
                 check (estagio in ('novo', 'proposta', 'negociacao', 'ganho', 'perdido')),
  responsavel  text,
  prazo        date,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.leads enable row level security;
alter table public.leads force row level security;

create index leads_workspace_id_idx on public.leads (workspace_id);
create index leads_estagio_idx      on public.leads (workspace_id, estagio);
create index leads_created_at_idx   on public.leads (workspace_id, created_at desc);

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute procedure public.set_updated_at();

create policy "lead_member_select"
  on public.leads for select to authenticated
  using (workspace_id in (select public.my_workspace_ids()));

create policy "lead_member_insert"
  on public.leads for insert to authenticated
  with check (workspace_id in (select public.my_workspace_ids()));

create policy "lead_member_update"
  on public.leads for update to authenticated
  using      (workspace_id in (select public.my_workspace_ids()))
  with check (workspace_id in (select public.my_workspace_ids()));

create policy "lead_member_delete"
  on public.leads for delete to authenticated
  using (workspace_id in (select public.my_workspace_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. DEALS
-- ─────────────────────────────────────────────────────────────────────────────

create table public.deals (
  id           uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  lead_id      uuid references public.leads(id) on delete cascade not null,
  titulo       text not null,
  valor        numeric(12,2) not null default 0 check (valor >= 0),
  estagio      text not null default 'novo'
                 check (estagio in ('novo', 'proposta', 'negociacao', 'ganho', 'perdido')),
  responsavel  text,
  prazo        date,
  anotacoes    text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.deals enable row level security;
alter table public.deals force row level security;

create index deals_workspace_id_idx on public.deals (workspace_id);
create index deals_lead_id_idx      on public.deals (lead_id);
create index deals_estagio_idx      on public.deals (workspace_id, estagio);

create trigger deals_set_updated_at
  before update on public.deals
  for each row execute procedure public.set_updated_at();

create policy "deal_member_select"
  on public.deals for select to authenticated
  using (workspace_id in (select public.my_workspace_ids()));

create policy "deal_member_insert"
  on public.deals for insert to authenticated
  with check (workspace_id in (select public.my_workspace_ids()));

create policy "deal_member_update"
  on public.deals for update to authenticated
  using      (workspace_id in (select public.my_workspace_ids()))
  with check (workspace_id in (select public.my_workspace_ids()));

create policy "deal_member_delete"
  on public.deals for delete to authenticated
  using (workspace_id in (select public.my_workspace_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ACTIVITIES
-- ─────────────────────────────────────────────────────────────────────────────

create table public.activities (
  id           uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  lead_id      uuid references public.leads(id) on delete cascade,
  deal_id      uuid references public.deals(id) on delete cascade,
  tipo         text not null
                 check (tipo in ('nota', 'ligacao', 'email', 'reuniao', 'tarefa')),
  descricao    text not null,
  realizado_em timestamptz default now(),
  created_by   uuid references auth.users on delete set null,
  created_at   timestamptz default now(),
  constraint activities_context_check check (lead_id is not null or deal_id is not null)
);

alter table public.activities enable row level security;
alter table public.activities force row level security;

create index activities_workspace_id_idx on public.activities (workspace_id);
create index activities_lead_id_idx      on public.activities (lead_id);
create index activities_deal_id_idx      on public.activities (deal_id);
create index activities_realizado_em_idx on public.activities (workspace_id, realizado_em desc);

create policy "activity_member_select"
  on public.activities for select to authenticated
  using (workspace_id in (select public.my_workspace_ids()));

create policy "activity_member_insert"
  on public.activities for insert to authenticated
  with check (workspace_id in (select public.my_workspace_ids()));

create policy "activity_member_update"
  on public.activities for update to authenticated
  using      (workspace_id in (select public.my_workspace_ids()))
  with check (workspace_id in (select public.my_workspace_ids()));

create policy "activity_member_delete"
  on public.activities for delete to authenticated
  using (workspace_id in (select public.my_workspace_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. TRIGGER: cria workspace + member ao criar profile
--    handle_new_user (migration 20260428) insere em profiles.
--    Este trigger dispara DEPOIS, quando o profile já existe.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_workspace()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workspace_id uuid;
begin
  insert into public.workspaces (owner_id, nome)
  values (new.id, coalesce(new.nome, 'Meu Workspace'))
  returning id into v_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_workspace_id, new.id, 'owner');

  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_workspace();

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Controle de acesso às funções internas
--
--    REVOKE de PUBLIC remove o grant padrão herdado de pg_catalog.
--    GRANT específico devolve só o necessário para cada role.
--
--    handle_new_workspace: só o trigger chama — nenhum role externo precisa.
--    set_updated_at:       só triggers chamam — nenhum role externo precisa.
--    my_workspace_ids:     as policies das tabelas chamam com o contexto do
--                          usuário autenticado — precisa de GRANT para authenticated.
-- ─────────────────────────────────────────────────────────────────────────────

revoke execute on function public.handle_new_workspace() from public;
revoke execute on function public.set_updated_at()       from public;
revoke execute on function public.my_workspace_ids()     from public;

grant execute on function public.my_workspace_ids() to authenticated;
