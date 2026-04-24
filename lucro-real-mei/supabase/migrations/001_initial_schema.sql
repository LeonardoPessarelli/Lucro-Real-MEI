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
