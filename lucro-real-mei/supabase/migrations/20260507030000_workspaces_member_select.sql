-- Corrige RLS de workspaces: membros (não apenas o owner) conseguem ler
-- o workspace ao qual pertencem.
--
-- A policy anterior "workspace_owner_select" só permitia ao owner ver o
-- seu próprio workspace. Qualquer membro convidado ficava sem acesso.
-- Substituímos por uma policy que usa my_workspace_ids(), que já lê
-- workspace_members com SECURITY DEFINER (evita recursão RLS).

drop policy if exists "workspace_owner_select" on public.workspaces;

create policy "workspace_member_select"
  on public.workspaces for select to authenticated
  using (id in (select public.my_workspace_ids()));
