# Spec: Leads & Pipeline com Dados Reais (M8)

**Data:** 2026-05-13
**Branch:** `feat/leads-data` (nova passagem — código já em main, itens pendentes do plano)
**Objetivo:** Substituir o `useLeads` hook por Server Components + Server Actions, corrigir inconsistência de nomenclatura no banco, criar migration pendente e configurar cron no Vercel.

---

## Contexto

O PR #18 mergeou a maior parte do M8. Dois itens ficaram pendentes:
- `vercel.json` com cron job para `/api/cron/leads-ganho`
- Migration SQL com colunas `colaborador`, `ganho_em`, `lancamento_criado`

Além disso, existe uma inconsistência: o tipo `Lead` usa `lancamento_criado` (boolean), mas a migration `20260507020000` adicionou `lancado_em` (timestamptz). O `useLeads` hook também tem `STAGE_ORDER` com `'proposta'` (já removida do tipo) e `rowToLead` incompleto sem os campos novos.

A decisão é migrar `LeadsPage` e `PipelinePage` para Server Components (padrão já usado em Home e Dashboard), deletar o hook, e manter os componentes visuais intactos.

---

## Arquitetura

### Fluxo de dados

```
Supabase (banco)
   ↓ query no servidor
page.tsx — Server Component
   ↓ props: Lead[]
LeadsClient.tsx / KanbanBoard.tsx — Client Component
   ↓ user action (criar, editar, mover, deletar)
Server Action (src/lib/actions/leads.ts)
   ↓ revalidatePath('/leads') + revalidatePath('/pipeline')
page.tsx recarrega automaticamente ✓
```

### Princípio

- **Servidor busca, cliente apenas exibe e dispara mutations**
- Nenhum componente visual muda de aparência
- Supabase JS no cliente não é mais usado para leads

---

## Banco de Dados

### Migration: `20260513_leads_colunas_m8.sql`

Adiciona (com `IF NOT EXISTS`) as colunas que o código espera mas o banco pode não ter:

```sql
alter table public.leads
  add column if not exists colaborador      text        default null,
  add column if not exists ganho_em         timestamptz default null,
  add column if not exists lancamento_criado boolean     default false;
```

Atualiza o check constraint de `estagio` para remover `'proposta'`:

```sql
alter table public.leads drop constraint if exists leads_estagio_check;
alter table public.leads add constraint leads_estagio_check
  check (estagio in ('novo', 'negociacao', 'ganho', 'perdido'));
```

O campo `lancado_em` existente coexiste — não é dropado.

---

## Arquivos

### Novos

| Arquivo | Descrição |
|---------|-----------|
| `src/components/leads/LeadsClient.tsx` | Client Component que recebe `Lead[]`, controla busca/filtro/modal. Extrai a lógica interativa de `leads/page.tsx`. |
| `supabase/migrations/20260513_leads_colunas_m8.sql` | Migration com colunas pendentes + fix do constraint. |
| `lucro-real-mei/vercel.json` | Cron `0 9 * * *` apontando para `/api/cron/leads-ganho`. |

### Modificados

| Arquivo | O que muda |
|---------|-----------|
| `src/app/(app)/leads/page.tsx` | Vira `async` Server Component. Busca leads do Supabase (`workspace_members` → `leads`). Passa `leads: Lead[]` para `LeadsClient`. |
| `src/app/(app)/pipeline/page.tsx` | Vira `async` Server Component. Mesma query. Passa `leads: Lead[]` para `KanbanBoard`. |
| `src/components/leads/KanbanBoard.tsx` | Remove `useLeads()`. Recebe `leads: Lead[]` como prop. Mutations continuam via Server Actions com `startTransition`. Remove `'use client'` implícito do import do hook. |
| `src/lib/leads.ts` | Remove `MOCK_LEADS` se ainda presente. Sem mudança em tipos ou configs. |

### Deletados

| Arquivo | Motivo |
|---------|--------|
| `src/hooks/useLeads.ts` | Substituído pelo padrão Server Component + Server Actions. |

### Não muda

- `LeadCard`, `KanbanColumn`, `NegocioModal`, `StageFilter` — zero alteração visual
- `src/lib/actions/leads.ts` — Server Actions já corretas com `revalidatePath`
- `src/app/(app)/dashboard/page.tsx` — já é Server Component e funciona
- `src/app/api/cron/leads-ganho/route.ts` — endpoint já pronto

---

## Componente LeadsClient

```tsx
'use client'
// Props: leads iniciais vindos do servidor
// Estado local: busca (string), filtro (LeadEstagio | 'todos'), modal
// Mutations: chama createLeadAction / updateLeadAction / deleteLeadAction com useTransition
// Filtragem: feita em memória sobre os leads recebidos via props
```

## KanbanBoard — mudança mínima

```tsx
// Antes: const { leads, loading, ... } = useLeads()
// Depois: recebe props { leads: Lead[] }
// moveEstagio: chama moveLeadEstagioAction diretamente com useTransition
// Modal de criar/editar: chama createLeadAction / updateLeadAction
```

---

## vercel.json

```json
{
  "crons": [{
    "path": "/api/cron/leads-ganho",
    "schedule": "0 9 * * *"
  }]
}
```

Variável `CRON_SECRET` deve ser adicionada no Vercel Dashboard (instrução no plano de implementação).

---

## Critérios de sucesso

- [ ] `npm run build` sem erros
- [ ] `npm test` passa (8 testes existentes)
- [ ] `npx tsc --noEmit` sem erros
- [ ] Criar lead na UI persiste após reload da página
- [ ] Mover lead de estágio persiste após reload
- [ ] Deletar lead persiste após reload
- [ ] Busca e filtro funcionam na lista de leads
- [ ] Dashboard exibe métricas reais
- [ ] `vercel.json` presente com cron configurado
- [ ] Migration SQL pronta para executar no Supabase Dashboard
