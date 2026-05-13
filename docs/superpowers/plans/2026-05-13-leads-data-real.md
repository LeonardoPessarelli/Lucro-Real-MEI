# Leads & Pipeline com Dados Reais (M8) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir `useLeads` hook por Server Components + Server Actions, corrigir todos os erros TypeScript existentes, criar a migration SQL pendente e configurar o cron no Vercel.

**Architecture:** As páginas `/leads` e `/pipeline` viram Server Components que buscam dados no Supabase e passam `Lead[]` como props para Client Components. Mutations usam as Server Actions já existentes (`src/lib/actions/leads.ts`) com `useTransition`. O hook `useLeads` é deletado.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase (server client via cookies), TypeScript, Tailwind v4, Server Actions, `useTransition`

---

## Mapa de arquivos

| Ação | Arquivo |
|------|---------|
| Criar | `src/components/leads/LeadsClient.tsx` |
| Criar | `supabase/migrations/20260513_leads_colunas_m8.sql` |
| Criar | `lucro-real-mei/vercel.json` |
| Modificar | `src/lib/leads.ts` — adicionar `bgColor` ao `STAGE_CONFIG`, remover `MOCK_LEADS` |
| Modificar | `src/components/leads/NegocioModal.tsx` — corrigir schema Zod, campos faltantes no `onSave` |
| Modificar | `src/components/leads/LeadCard.tsx` — corrigir `valor ?? 0` e `responsavel ?? ''` |
| Modificar | `src/components/leads/KanbanColumn.tsx` — corrigir `valor ?? 0` |
| Modificar | `src/components/leads/KanbanBoard.tsx` — receber `leads: Lead[]` como prop, remover `useLeads` |
| Modificar | `src/app/(app)/leads/page.tsx` — virar Server Component |
| Modificar | `src/app/(app)/pipeline/page.tsx` — virar Server Component |
| Modificar | `src/lib/dashboard-mock.ts` — remover `'proposta'` dos estagios ativos, corrigir `valor ?? 0` |
| Modificar | `src/lib/__tests__/dashboard-mock.test.ts` — remover referências a `'proposta'`, adicionar campos faltantes no `makeLeads` |
| Deletar | `src/hooks/useLeads.ts` |

---

## Task 1: Corrigir `src/lib/leads.ts` — adicionar `bgColor` ao `STAGE_CONFIG`

**Files:**
- Modify: `src/lib/leads.ts`

Vários componentes usam `stage.bgColor` mas o tipo só tem `bg`. Vamos renomear `bg` → `bgColor` para alinhar o tipo com o uso real.

- [ ] **Step 1: Editar `src/lib/leads.ts`**

Substituir o conteúdo inteiro pelo seguinte:

```ts
export type LeadEstagio = 'novo' | 'negociacao' | 'ganho' | 'perdido'

export interface Lead {
  id: string
  workspace_id: string
  nome: string
  colaborador: string | null
  contato: string | null
  origem: string | null
  servico: string | null
  valor: number | null
  anotacoes: string | null
  estagio: LeadEstagio
  responsavel: string | null
  prazo: string | null
  ganho_em: string | null
  lancamento_criado: boolean
  created_at: string
  updated_at: string
}

export const STAGE_ORDER: LeadEstagio[] = ['novo', 'negociacao', 'ganho', 'perdido']

export const STAGE_CONFIG: Record<LeadEstagio, { label: string; color: string; bgColor: string }> = {
  novo:       { label: 'Novo',       color: '#3b82f6', bgColor: 'rgba(59,130,246,0.15)'  },
  negociacao: { label: 'Negociação', color: '#a855f7', bgColor: 'rgba(168,85,247,0.15)'  },
  ganho:      { label: 'Ganho',      color: '#4ade80', bgColor: 'rgba(74,222,128,0.15)'  },
  perdido:    { label: 'Perdido',    color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)'   },
}

export const ORIGENS = ['Instagram', 'Indicação', 'Site', 'Google', 'WhatsApp', 'Outro']
```

- [ ] **Step 2: Verificar que não há mais `bg:` no arquivo**

```bash
grep -n "bg:" lucro-real-mei/src/lib/leads.ts
```

Esperado: sem output.

- [ ] **Step 3: Commit**

```bash
cd lucro-real-mei
git add src/lib/leads.ts
git commit -m "fix(leads): renomear bg → bgColor no STAGE_CONFIG"
```

---

## Task 2: Corrigir `src/lib/dashboard-mock.ts` e seu teste

**Files:**
- Modify: `src/lib/dashboard-mock.ts`
- Modify: `src/lib/__tests__/dashboard-mock.test.ts`

`dashboard-mock.ts` referencia `'proposta'` (removida do tipo) e usa `l.valor` sem null-guard. O teste também passa `'proposta'` e não inclui os campos novos do tipo `Lead`.

- [ ] **Step 1: Editar `src/lib/dashboard-mock.ts`**

Substituir `ESTAGIOS_ATIVOS` e corrigir o `reduce`:

```ts
import type { Lead } from './leads'

export interface MesHistorico {
  mes: string
  faturamento: number
  isCurrent: boolean
}

export interface MetricasLeads {
  totalLeads: number
  negociosAbertos: number
  valorPipeline: number
  taxaConversao: number | null
}

export interface FinanceiroMes {
  total_entradas: number
  pote_custos: number
  pote_reserva: number
  pote_salario: number
  pote_custos_restante: number
  pote_reserva_restante: number
  pote_salario_restante: number
  lucro_pessoal: number
}

const ESTAGIOS_ATIVOS = ['novo', 'negociacao'] as const

export function calcularMetricasLeads(leads: Lead[]): MetricasLeads {
  const ativos = leads.filter(l => (ESTAGIOS_ATIVOS as readonly string[]).includes(l.estagio))
  const ganhos = leads.filter(l => l.estagio === 'ganho').length
  const perdidos = leads.filter(l => l.estagio === 'perdido').length
  const total = ganhos + perdidos

  return {
    totalLeads: leads.length,
    negociosAbertos: ativos.length,
    valorPipeline: ativos.reduce((s, l) => s + (l.valor ?? 0), 0),
    taxaConversao: total === 0 ? null : Math.round((ganhos / total) * 100),
  }
}
```

- [ ] **Step 2: Editar `src/lib/__tests__/dashboard-mock.test.ts`**

Substituir `makeLeads` para incluir campos obrigatórios do tipo `Lead`, e remover todos os usos de `'proposta'`:

```ts
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { calcularMetricasLeads } from '../dashboard-mock'
import type { Lead } from '../leads'

const makeLeads = (estagios: Lead['estagio'][]): Lead[] =>
  estagios.map((estagio, i) => ({
    id: String(i),
    workspace_id: 'ws-test',
    nome: `Lead ${i}`,
    colaborador: null,
    contato: '',
    valor: 1000,
    origem: 'Site',
    servico: 'Serviço',
    anotacoes: null,
    estagio,
    responsavel: '',
    prazo: null,
    ganho_em: null,
    lancamento_criado: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

describe('calcularMetricasLeads', () => {
  it('conta total de leads', () => {
    const leads = makeLeads(['novo', 'negociacao', 'ganho'])
    expect(calcularMetricasLeads(leads).totalLeads).toBe(3)
  })

  it('conta negócios abertos (novo + negociacao)', () => {
    const leads = makeLeads(['novo', 'negociacao', 'ganho', 'perdido'])
    expect(calcularMetricasLeads(leads).negociosAbertos).toBe(2)
  })

  it('soma valor do pipeline (leads ativos)', () => {
    const leads = makeLeads(['novo', 'negociacao', 'ganho'])
    expect(calcularMetricasLeads(leads).valorPipeline).toBe(2000)
  })

  it('calcula taxa de conversão', () => {
    const leads = makeLeads(['ganho', 'ganho', 'ganho', 'perdido'])
    expect(calcularMetricasLeads(leads).taxaConversao).toBe(75)
  })

  it('retorna null para taxa quando não há ganho nem perdido', () => {
    const leads = makeLeads(['novo', 'negociacao'])
    expect(calcularMetricasLeads(leads).taxaConversao).toBeNull()
  })

  it('retorna zeros para lista vazia', () => {
    const m = calcularMetricasLeads([])
    expect(m.totalLeads).toBe(0)
    expect(m.negociosAbertos).toBe(0)
    expect(m.valorPipeline).toBe(0)
    expect(m.taxaConversao).toBeNull()
  })
})
```

- [ ] **Step 3: Rodar os testes**

```bash
cd lucro-real-mei && npm test
```

Esperado: todos os testes passam (incluindo os 6 de `dashboard-mock`).

- [ ] **Step 4: Commit**

```bash
git add src/lib/dashboard-mock.ts src/lib/__tests__/dashboard-mock.test.ts
git commit -m "fix(dashboard-mock): remover proposta, corrigir valor null, campos Lead"
```

---

## Task 3: Corrigir `NegocioModal.tsx` — schema Zod e campos faltantes

**Files:**
- Modify: `src/components/leads/NegocioModal.tsx`

O schema Zod ainda inclui `'proposta'`. O `onSave` não passa `updated_at`, `lancamento_criado`, `ganho_em`, `colaborador` — campos que fazem parte do tipo `Lead` mas não são editáveis pelo usuário.

- [ ] **Step 1: Corrigir o schema e o `onSave` em `NegocioModal.tsx`**

Localizar e substituir o schema:

```ts
// ANTES:
const schema = z.object({
  ...
  estagio: z.enum(['novo', 'proposta', 'negociacao', 'ganho', 'perdido']),
  ...
})
```

```ts
// DEPOIS:
const schema = z.object({
  servico:     z.string().min(1, 'Título obrigatório'),
  nome:        z.string().min(1, 'Lead/empresa obrigatório'),
  contato:     z.string().min(1, 'Contato obrigatório'),
  responsavel: z.string().min(1, 'Responsável obrigatório'),
  origem:      z.string().min(1, 'Selecione a origem'),
  estagio:     z.enum(['novo', 'negociacao', 'ganho', 'perdido']),
  prazo:       z.string().optional(),
  anotacoes:   z.string().optional(),
})
```

Localizar e substituir o `onSave` dentro de `onSubmit`:

```ts
// ANTES:
onSave({
  servico:     data.servico,
  nome:        data.nome,
  contato:     data.contato,
  valor:       centavos / 100,
  responsavel: data.responsavel,
  origem:      data.origem,
  estagio:     data.estagio as LeadEstagio,
  prazo:       data.prazo || null,
  anotacoes:   data.anotacoes || null,
})
```

```ts
// DEPOIS:
onSave({
  servico:           data.servico,
  nome:              data.nome,
  contato:           data.contato,
  valor:             centavos / 100,
  responsavel:       data.responsavel,
  origem:            data.origem,
  estagio:           data.estagio as LeadEstagio,
  prazo:             data.prazo || null,
  anotacoes:         data.anotacoes || null,
  colaborador:       lead?.colaborador ?? null,
  ganho_em:          lead?.ganho_em ?? null,
  lancamento_criado: lead?.lancamento_criado ?? false,
  updated_at:        lead?.updated_at ?? new Date().toISOString(),
})
```

Também corrigir o `useState` inicial de `centavos` que passa `lead.valor` sem null-guard:

```ts
// ANTES:
const [centavos, setCentavos] = useState(() =>
  lead ? reaisParaCentavos(lead.valor) : 0
)
```

```ts
// DEPOIS:
const [centavos, setCentavos] = useState(() =>
  lead ? reaisParaCentavos(lead.valor ?? 0) : 0
)
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd lucro-real-mei && npx tsc --noEmit 2>&1 | grep NegocioModal
```

Esperado: sem erros em `NegocioModal.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/leads/NegocioModal.tsx
git commit -m "fix(NegocioModal): corrigir schema Zod sem proposta, campos Lead completos"
```

---

## Task 4: Corrigir `LeadCard.tsx` e `KanbanColumn.tsx` — null-guards e `bgColor`

**Files:**
- Modify: `src/components/leads/LeadCard.tsx`
- Modify: `src/components/leads/KanbanColumn.tsx`

`lead.valor` é `number | null`, então todo `.toLocaleString()` precisa de `?? 0`. `lead.responsavel` é `string | null`, então `iniciais()` precisa de null-guard. `bgColor` agora existe no tipo (Task 1).

- [ ] **Step 1: Corrigir `LeadCard.tsx`**

Localizar e substituir as 2 ocorrências de `lead.valor.toLocaleString`:

```ts
// Ocorrência 1 (modo kanban, linha ~65):
// ANTES:
{lead.valor.toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})}

// DEPOIS:
{(lead.valor ?? 0).toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})}
```

```ts
// Ocorrência 2 (modo lista, linha ~143):
// ANTES:
{lead.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}

// DEPOIS:
{(lead.valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
```

Localizar e corrigir `iniciais(lead.responsavel)`:

```ts
// ANTES:
{iniciais(lead.responsavel)}

// DEPOIS:
{iniciais(lead.responsavel ?? '')}
```

Localizar e corrigir `stage.bgColor` no modo lista (linha ~119):

```ts
// ANTES:
style={{ color: stage.color, backgroundColor: stage.bg }}

// (se estiver como stage.bg — já estava como bgColor após Task 1, só verificar)
```

- [ ] **Step 2: Corrigir `KanbanColumn.tsx`**

Localizar `l.valor` no reduce:

```ts
// ANTES:
const totalValor = leads.reduce((acc, l) => acc + l.valor, 0)

// DEPOIS:
const totalValor = leads.reduce((acc, l) => acc + (l.valor ?? 0), 0)
```

- [ ] **Step 3: Verificar TypeScript**

```bash
cd lucro-real-mei && npx tsc --noEmit 2>&1 | grep -E "LeadCard|KanbanColumn"
```

Esperado: sem erros nestes arquivos.

- [ ] **Step 4: Commit**

```bash
git add src/components/leads/LeadCard.tsx src/components/leads/KanbanColumn.tsx
git commit -m "fix(leads): null-guard em valor e responsavel, bgColor consistente"
```

---

## Task 5: Corrigir `KanbanBoard.tsx` — receber `leads` como prop, remover `useLeads`

**Files:**
- Modify: `src/components/leads/KanbanBoard.tsx`

Remover o `useLeads()`. Receber `leads: Lead[]` como prop. Mutations chamam as Server Actions com `useTransition`.

- [ ] **Step 1: Reescrever `src/components/leads/KanbanBoard.tsx`**

```tsx
'use client'
import { useState, useTransition } from 'react'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { STAGE_ORDER, STAGE_CONFIG } from '@/lib/leads'
import { createLeadAction, updateLeadAction, deleteLeadAction, moveLeadEstagioAction } from '@/lib/actions/leads'
import KanbanColumn from './KanbanColumn'
import NegocioModal from './NegocioModal'

function StatBox({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="pipeline-stat">
      <p className="pipeline-stat-label">{label}</p>
      <p className="pipeline-stat-value" style={{ color: accent }}>{value}</p>
      {sub && <p className="pipeline-stat-sub">{sub}</p>}
    </div>
  )
}

interface Props {
  leads: Lead[]
}

export default function KanbanBoard({ leads }: Props) {
  const [modal, setModal] = useState<
    { mode: 'new'; estagio: LeadEstagio } | { mode: 'edit'; lead: Lead } | null
  >(null)
  const [, startTransition] = useTransition()

  const abertos  = leads.filter(l => l.estagio !== 'perdido' && l.estagio !== 'ganho')
  const fechados = leads.filter(l => l.estagio === 'ganho')
  const totalAberto  = abertos.reduce((s, l) => s + (l.valor ?? 0), 0)
  const totalFechado = fechados.reduce((s, l) => s + (l.valor ?? 0), 0)
  const totalGeral   = leads.filter(l => l.estagio !== 'perdido').reduce((s, l) => s + (l.valor ?? 0), 0)
  const totalConcluidosOuPerdidos = leads.filter(l => l.estagio === 'ganho' || l.estagio === 'perdido').length
  const winRate = totalConcluidosOuPerdidos > 0
    ? Math.round((fechados.length / totalConcluidosOuPerdidos) * 100)
    : 0

  function fmt(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  }

  function handleSave(data: Omit<Lead, 'id' | 'workspace_id' | 'created_at'>) {
    if (!modal) return
    startTransition(async () => {
      if (modal.mode === 'new') {
        await createLeadAction({ ...data, estagio: modal.estagio ?? data.estagio })
      } else {
        await updateLeadAction(modal.lead.id, data)
      }
    })
    setModal(null)
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteLeadAction(id)
    })
    setModal(null)
  }

  function handleMover(id: string, direcao: 'subir' | 'descer') {
    const lead = leads.find(l => l.id === id)
    if (!lead) return
    const idx = STAGE_ORDER.indexOf(lead.estagio)
    const nextIdx = direcao === 'subir' ? idx - 1 : idx + 1
    if (nextIdx < 0 || nextIdx >= STAGE_ORDER.length) return
    const nextEstagio = STAGE_ORDER[nextIdx]
    startTransition(async () => {
      await moveLeadEstagioAction(id, nextEstagio)
    })
  }

  return (
    <div className="pipeline-root">
      <div className="pipeline-header">
        <div className="pipeline-header-stats">
          <StatBox
            label="Pipeline aberto"
            value={fmt(totalAberto)}
            sub={`${abertos.length} negócio${abertos.length !== 1 ? 's' : ''}`}
          />
          <div className="pipeline-stat-divider" />
          <StatBox
            label="Ganhos (mês)"
            value={fmt(totalFechado)}
            sub={`${fechados.length} negócio${fechados.length !== 1 ? 's' : ''}`}
            accent="#4ade80"
          />
          <div className="pipeline-stat-divider" />
          <StatBox
            label="Win rate"
            value={`${winRate}%`}
            sub={`${fechados.length}/${totalConcluidosOuPerdidos} fechados`}
            accent={winRate >= 50 ? '#4ade80' : '#f59e0b'}
          />
        </div>

        <div className="pipeline-global-bar">
          {STAGE_ORDER.filter(s => s !== 'perdido').map(estagio => {
            const stageVal = leads.filter(l => l.estagio === estagio).reduce((s, l) => s + (l.valor ?? 0), 0)
            const pct = totalGeral > 0 ? (stageVal / totalGeral) * 100 : 0
            const stage = STAGE_CONFIG[estagio]
            return pct > 0 ? (
              <div
                key={estagio}
                className="pipeline-global-bar-segment"
                style={{ width: `${pct}%`, backgroundColor: stage.color }}
                title={`${stage.label}: ${Math.round(pct)}%`}
              />
            ) : null
          })}
        </div>

        <button
          className="pipeline-new-btn"
          onClick={() => setModal({ mode: 'new', estagio: 'novo' })}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Novo negócio
        </button>
      </div>

      <div className="px-4 pb-8 space-y-3 mt-2">
        {STAGE_ORDER.map((estagio, i) => (
          <KanbanColumn
            key={estagio}
            estagio={estagio}
            leads={leads.filter(l => l.estagio === estagio)}
            totalPipeline={totalAberto}
            isFirst={i === 0}
            isLast={i === STAGE_ORDER.length - 1}
            onEdit={lead => setModal({ mode: 'edit', lead })}
            onAddNew={est => setModal({ mode: 'new', estagio: est })}
            onMover={handleMover}
          />
        ))}
      </div>

      {modal && (
        <NegocioModal
          mode={modal.mode}
          lead={modal.mode === 'edit' ? modal.lead : undefined}
          defaultEstagio={modal.mode === 'new' ? modal.estagio : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd lucro-real-mei && npx tsc --noEmit 2>&1 | grep KanbanBoard
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/leads/KanbanBoard.tsx
git commit -m "refactor(KanbanBoard): receber leads como prop, mutations via Server Actions"
```

---

## Task 6: Criar `LeadsClient.tsx` e converter `leads/page.tsx` para Server Component

**Files:**
- Create: `src/components/leads/LeadsClient.tsx`
- Modify: `src/app/(app)/leads/page.tsx`

- [ ] **Step 1: Criar `src/components/leads/LeadsClient.tsx`**

```tsx
'use client'
import { useState, useTransition } from 'react'
import type { Lead, LeadEstagio } from '@/lib/leads'
import { createLeadAction, updateLeadAction, deleteLeadAction } from '@/lib/actions/leads'
import LeadCard from '@/components/leads/LeadCard'
import StageFilter from '@/components/leads/StageFilter'
import NegocioModal from '@/components/leads/NegocioModal'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'

interface Props {
  leads: Lead[]
}

export default function LeadsClient({ leads }: Props) {
  const [filtro, setFiltro] = useState<LeadEstagio | 'todos'>('todos')
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState<{ mode: 'new' } | { mode: 'edit'; lead: Lead } | null>(null)
  const [, startTransition] = useTransition()

  const filtered = leads
    .filter(l => filtro === 'todos' || l.estagio === filtro)
    .filter(l =>
      (l.nome ?? '').toLowerCase().includes(busca.toLowerCase()) ||
      (l.servico ?? '').toLowerCase().includes(busca.toLowerCase())
    )

  function handleSave(data: Omit<Lead, 'id' | 'workspace_id' | 'created_at'>) {
    if (!modal) return
    startTransition(async () => {
      if (modal.mode === 'new') {
        await createLeadAction(data)
      } else {
        await updateLeadAction(modal.lead.id, data)
      }
    })
    setModal(null)
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteLeadAction(id)
    })
    setModal(null)
  }

  return (
    <div className="px-4 pt-6 space-y-4 pb-8">
      <PageHeader
        title="Leads"
        action={
          <button
            onClick={() => setModal({ mode: 'new' })}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-verde text-black text-xl font-bold leading-none"
          >
            +
          </button>
        }
      />

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou serviço..."
          className="w-full bg-card2 rounded-xl pl-9 pr-4 py-3 text-sm text-gray-300 outline-none placeholder:text-gray-600"
        />
        {busca && (
          <button onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">✕</button>
        )}
      </div>

      <StageFilter selected={filtro} onChange={setFiltro} />

      {filtered.length === 0 ? (
        leads.length === 0 ? (
          <EmptyState
            icon="👥"
            title="Nenhum lead ainda"
            description="Toque em + para adicionar seu primeiro lead."
          />
        ) : (
          <p className="text-gray-500 text-sm text-center pt-8">Nenhum lead encontrado</p>
        )
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => setModal({ mode: 'edit', lead })}
            />
          ))}
        </div>
      )}

      {modal && (
        <NegocioModal
          mode={modal.mode}
          lead={modal.mode === 'edit' ? modal.lead : undefined}
          defaultEstagio="novo"
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Reescrever `src/app/(app)/leads/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Lead } from '@/lib/leads'
import LeadsClient from '@/components/leads/LeadsClient'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const leads: Lead[] = []

  if (member) {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('workspace_id', member.workspace_id)
      .order('created_at', { ascending: false })

    if (data) leads.push(...(data as Lead[]))
  }

  return <LeadsClient leads={leads} />
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
cd lucro-real-mei && npx tsc --noEmit 2>&1 | grep -E "leads/page|LeadsClient"
```

Esperado: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/components/leads/LeadsClient.tsx src/app/(app)/leads/page.tsx
git commit -m "feat(leads): converter página para Server Component + LeadsClient"
```

---

## Task 7: Converter `pipeline/page.tsx` para Server Component

**Files:**
- Modify: `src/app/(app)/pipeline/page.tsx`

- [ ] **Step 1: Reescrever `src/app/(app)/pipeline/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Lead } from '@/lib/leads'
import KanbanBoard from '@/components/leads/KanbanBoard'

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const leads: Lead[] = []

  if (member) {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('workspace_id', member.workspace_id)
      .order('created_at', { ascending: false })

    if (data) leads.push(...(data as Lead[]))
  }

  return (
    <div className="pt-4">
      <KanbanBoard leads={leads} />
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd lucro-real-mei && npx tsc --noEmit 2>&1 | grep "pipeline/page"
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/pipeline/page.tsx
git commit -m "feat(pipeline): converter página para Server Component"
```

---

## Task 8: Deletar `useLeads.ts`

**Files:**
- Delete: `src/hooks/useLeads.ts`

- [ ] **Step 1: Confirmar que nenhum arquivo importa o hook**

```bash
cd lucro-real-mei && grep -r "useLeads" src/
```

Esperado: sem output (nenhum arquivo deve referenciar o hook após Tasks 5 e 6).

- [ ] **Step 2: Deletar o arquivo**

```bash
rm src/hooks/useLeads.ts
```

- [ ] **Step 3: Verificar TypeScript geral**

```bash
cd lucro-real-mei && npx tsc --noEmit 2>&1 | grep -v "react-hook-form\|lucide-react\|@hookform\|Cannot find module 'zod'"
```

Esperado: sem erros além dos módulos não instalados (react-hook-form, zod, lucide-react — esses são erros de `npm install` pré-existentes não relacionados a esta task).

- [ ] **Step 4: Commit**

```bash
git add -A src/hooks/
git commit -m "chore: deletar useLeads hook substituído por Server Components"
```

---

## Task 9: Criar migration SQL e `vercel.json`

**Files:**
- Create: `supabase/migrations/20260513_leads_colunas_m8.sql`
- Create: `vercel.json` (na raiz de `lucro-real-mei/`)

- [ ] **Step 1: Criar `supabase/migrations/20260513_leads_colunas_m8.sql`**

```sql
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
```

> **Instrução manual:** Execute este SQL no Supabase Dashboard → SQL Editor do seu projeto.

- [ ] **Step 2: Criar `vercel.json` na raiz de `lucro-real-mei/`**

```json
{
  "crons": [
    {
      "path": "/api/cron/leads-ganho",
      "schedule": "0 9 * * *"
    }
  ]
}
```

> **Instrução manual:** Adicione a variável `CRON_SECRET` no Vercel Dashboard → Settings → Environment Variables com um valor seguro (ex: `openssl rand -hex 32`). Adicione também no `.env.local` local com o mesmo valor.

- [ ] **Step 3: Commit**

```bash
cd lucro-real-mei
git add supabase/migrations/20260513_leads_colunas_m8.sql vercel.json
git commit -m "feat(infra): migration colunas M8 + vercel.json cron leads-ganho"
```

---

## Task 10: Build final e verificação

- [ ] **Step 1: Rodar todos os testes**

```bash
cd lucro-real-mei && npm test
```

Esperado: todos os testes passam.

- [ ] **Step 2: Verificar TypeScript (erros relevantes)**

```bash
cd lucro-real-mei && npx tsc --noEmit 2>&1 | grep -v "react-hook-form\|lucide-react\|@hookform\|Cannot find module 'zod'"
```

Esperado: 0 erros relevantes ao código desta branch.

- [ ] **Step 3: Build**

```bash
cd lucro-real-mei && npm run build 2>&1 | tail -20
```

Esperado: `✓ Compiled successfully` sem erros.

- [ ] **Step 4: Commit final e push da branch**

```bash
git checkout -b feat/leads-data-v2
git push -u origin feat/leads-data-v2
```

---

## Checklist de critérios de sucesso

- [ ] `npm test` — todos os testes passam
- [ ] `npx tsc --noEmit` — sem erros nos arquivos desta branch
- [ ] `npm run build` — build sem erros
- [ ] Criar lead na UI persiste após reload
- [ ] Mover lead de estágio persiste após reload
- [ ] Deletar lead persiste após reload
- [ ] Busca e filtro funcionam na lista de leads
- [ ] Dashboard exibe métricas reais
- [ ] `vercel.json` presente com cron configurado
- [ ] Migration SQL pronta para executar no Supabase Dashboard
- [ ] `useLeads.ts` deletado
