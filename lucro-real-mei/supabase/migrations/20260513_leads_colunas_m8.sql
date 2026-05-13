-- Colunas pendentes do M8: colaborador, ganho_em, lancamento_criado
-- Corrige divergência entre código (lancamento_criado boolean) e migration anterior (lancado_em timestamptz)
-- O campo lancado_em coexiste e não é removido.

alter table public.leads
  add column if not exists colaborador       text        default null,
  add column if not exists ganho_em          timestamptz default null,
  add column if not exists lancamento_criado boolean     default false;

-- Remove proposta do constraint de estagio
alter table public.leads drop constraint if exists leads_estagio_check;
alter table public.leads add constraint leads_estagio_check
  check (estagio in ('novo', 'negociacao', 'ganho', 'perdido'));
