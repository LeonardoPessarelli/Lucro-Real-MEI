-- Adiciona coluna valor na tabela leads
-- O campo valor representa o valor estimado do negócio diretamente no lead.

alter table public.leads
  add column if not exists valor numeric(12,2) not null default 0 check (valor >= 0);
