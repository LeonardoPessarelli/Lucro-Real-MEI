-- Leads: pipeline de vendas do MEI
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  nome text not null,
  contato text not null default '',
  valor numeric(10,2) not null default 0,
  origem text not null default '',
  servico text not null default '',
  anotacoes text,
  estagio text not null default 'novo'
    check (estagio in ('novo', 'em_contato', 'proposta', 'fechado', 'perdido')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.leads enable row level security;

create policy "leads_owner_select" on public.leads
  for select using ((select auth.uid()) = user_id);

create policy "leads_owner_insert" on public.leads
  for insert with check ((select auth.uid()) = user_id);

create policy "leads_owner_update" on public.leads
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "leads_owner_delete" on public.leads
  for delete using ((select auth.uid()) = user_id);

create index leads_user_estagio on public.leads(user_id, estagio);
create index leads_user_created on public.leads(user_id, created_at desc);

-- Atualiza updated_at automaticamente
create or replace function public.touch_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.touch_updated_at();
