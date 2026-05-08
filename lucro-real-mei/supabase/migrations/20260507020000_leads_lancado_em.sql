-- Coluna que marca quando o lead em Ganho foi automaticamente lançado como receita.
-- NULL = ainda não lançado. Preenchida pela Server Action ao criar a transaction.
alter table public.leads
  add column if not exists lancado_em timestamptz default null;
