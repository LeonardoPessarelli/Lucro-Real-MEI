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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. UPDATE policy em transactions (estava faltando)
-- ============================================================
create policy "owner_update"
  on public.transactions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 3. Tornar explícito que subscriptions só service_role escreve
-- ============================================================
create policy "service_role_insert"
  on public.subscriptions
  for insert
  with check (auth.role() = 'service_role');

create policy "service_role_update"
  on public.subscriptions
  for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service_role_delete"
  on public.subscriptions
  for delete
  using (auth.role() = 'service_role');
