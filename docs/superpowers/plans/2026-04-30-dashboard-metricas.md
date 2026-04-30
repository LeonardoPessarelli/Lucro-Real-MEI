# Dashboard de Métricas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a rota `/dashboard` de "Em breve" em uma tela completa de métricas do negócio com dois tabs: Visão Geral (4 cards + financeiro + pipeline) e Histórico (gráfico de faturamento).

**Architecture:** Client Component com estado `activeTab` controla qual tab está visível. Dados financeiros e de leads vêm de mocks estáticos — sem Supabase. Componentes em `src/components/dashboard/` são isolados e recebem dados como props.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, TypeScript, Vitest. SVG puro para o gráfico de barras (sem biblioteca externa).

---

## Mapa de Arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `src/lib/dashboard-mock.ts` | Criar | Dados mockados: histórico mensal e financeiro do mês |
| `src/components/dashboard/MetricCards.tsx` | Criar | 4 cards do topo (leads, pipeline, conversão) |
| `src/components/dashboard/MetricasFinanceiras.tsx` | Criar | Faturamento + barras dos 3 potes |
| `src/components/dashboard/PipelineSnapshot.tsx` | Criar | Lista de estágios com barra proporcional |
| `src/components/dashboard/HistoricoFaturamento.tsx` | Criar | Gráfico SVG de barras dos últimos 6 meses |
| `src/app/(app)/dashboard/page.tsx` | Reescrever | Client Component com tabs |
| `src/lib/__tests__/dashboard-mock.test.ts` | Criar | Testes das funções de cálculo dos cards |

---

## Task 1: Dados mockados e funções de cálculo

**Files:**
- Create: `src/lib/dashboard-mock.ts`
- Create: `src/lib/__tests__/dashboard-mock.test.ts`

- [ ] **Step 1: Escrever o teste**

Crie `lucro-real-mei/src/lib/__tests__/dashboard-mock.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  calcularMetricasLeads,
  HISTORICO_MOCK,
  FINANCEIRO_MES_MOCK,
} from '../dashboard-mock'
import { MOCK_LEADS } from '../leads'

describe('calcularMetricasLeads', () => {
  it('conta total de leads', () => {
    const m = calcularMetricasLeads(MOCK_LEADS)
    expect(m.totalLeads).toBe(MOCK_LEADS.length)
  })

  it('conta negócios abertos (novo + proposta + negociacao)', () => {
    const m = calcularMetricasLeads(MOCK_LEADS)
    const esperado = MOCK_LEADS.filter(l =>
      ['novo', 'proposta', 'negociacao'].includes(l.estagio)
    ).length
    expect(m.negociosAbertos).toBe(esperado)
  })

  it('soma valor do pipeline (leads ativos)', () => {
    const m = calcularMetricasLeads(MOCK_LEADS)
    const esperado = MOCK_LEADS.filter(l =>
      ['novo', 'proposta', 'negociacao'].includes(l.estagio)
    ).reduce((s, l) => s + l.valor, 0)
    expect(m.valorPipeline).toBe(esperado)
  })

  it('calcula taxa de conversão', () => {
    const m = calcularMetricasLeads(MOCK_LEADS)
    const ganhos = MOCK_LEADS.filter(l => l.estagio === 'ganho').length
    const perdidos = MOCK_LEADS.filter(l => l.estagio === 'perdido').length
    const esperado = Math.round((ganhos / (ganhos + perdidos)) * 100)
    expect(m.taxaConversao).toBe(esperado)
  })

  it('retorna null para taxa quando não há ganho nem perdido', () => {
    const leads = MOCK_LEADS.filter(l => l.estagio === 'novo')
    const m = calcularMetricasLeads(leads)
    expect(m.taxaConversao).toBeNull()
  })

  it('HISTORICO_MOCK tem exatamente 6 meses', () => {
    expect(HISTORICO_MOCK).toHaveLength(6)
  })

  it('HISTORICO_MOCK tem exatamente 1 mês atual', () => {
    expect(HISTORICO_MOCK.filter(m => m.isCurrent)).toHaveLength(1)
  })

  it('FINANCEIRO_MES_MOCK tem total_entradas positivo', () => {
    expect(FINANCEIRO_MES_MOCK.total_entradas).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

```bash
cd lucro-real-mei && npx vitest run src/lib/__tests__/dashboard-mock.test.ts
```

Esperado: erro `Cannot find module '../dashboard-mock'`

- [ ] **Step 3: Criar `src/lib/dashboard-mock.ts`**

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

const ESTAGIOS_ATIVOS = ['novo', 'proposta', 'negociacao'] as const

export function calcularMetricasLeads(leads: Lead[]): MetricasLeads {
  const ativos = leads.filter(l => (ESTAGIOS_ATIVOS as readonly string[]).includes(l.estagio))
  const ganhos = leads.filter(l => l.estagio === 'ganho').length
  const perdidos = leads.filter(l => l.estagio === 'perdido').length
  const total = ganhos + perdidos

  return {
    totalLeads: leads.length,
    negociosAbertos: ativos.length,
    valorPipeline: ativos.reduce((s, l) => s + l.valor, 0),
    taxaConversao: total === 0 ? null : Math.round((ganhos / total) * 100),
  }
}

export const HISTORICO_MOCK: MesHistorico[] = [
  { mes: 'Nov', faturamento: 8200,  isCurrent: false },
  { mes: 'Dez', faturamento: 11500, isCurrent: false },
  { mes: 'Jan', faturamento: 7800,  isCurrent: false },
  { mes: 'Fev', faturamento: 9400,  isCurrent: false },
  { mes: 'Mar', faturamento: 12300, isCurrent: false },
  { mes: 'Abr', faturamento: 10500, isCurrent: true  },
]

export const FINANCEIRO_MES_MOCK: FinanceiroMes = {
  total_entradas:       10500,
  pote_custos:          4200,
  pote_reserva:         2100,
  pote_salario:         4200,
  pote_custos_restante: 2800,
  pote_reserva_restante:2100,
  pote_salario_restante:3150,
  lucro_pessoal:        3150,
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

```bash
cd lucro-real-mei && npx vitest run src/lib/__tests__/dashboard-mock.test.ts
```

Esperado: 8 testes passando.

- [ ] **Step 5: Commit**

```bash
git add lucro-real-mei/src/lib/dashboard-mock.ts lucro-real-mei/src/lib/__tests__/dashboard-mock.test.ts
git commit -m "feat(dashboard): adiciona dados mock e funções de cálculo de métricas"
```

---

## Task 2: Componente MetricCards

**Files:**
- Create: `lucro-real-mei/src/components/dashboard/MetricCards.tsx`

- [ ] **Step 1: Criar o componente**

Crie `lucro-real-mei/src/components/dashboard/MetricCards.tsx`:

```tsx
import { formatCurrency } from '@/lib/potes'
import type { MetricasLeads } from '@/lib/dashboard-mock'

interface CardConfig {
  icon: string
  label: string
  value: string
  color: string
}

interface Props {
  metricas: MetricasLeads
}

function buildCards(metricas: MetricasLeads): CardConfig[] {
  return [
    {
      icon: '👥',
      label: 'TOTAL DE LEADS',
      value: String(metricas.totalLeads),
      color: '#818cf8',
    },
    {
      icon: '💼',
      label: 'NEGÓCIOS ABERTOS',
      value: String(metricas.negociosAbertos),
      color: '#3b82f6',
    },
    {
      icon: '💰',
      label: 'VALOR PIPELINE',
      value: formatCurrency(metricas.valorPipeline),
      color: '#22d3ee',
    },
    {
      icon: '📈',
      label: 'TAXA CONVERSÃO',
      value: metricas.taxaConversao === null ? '—' : `${metricas.taxaConversao}%`,
      color: '#4ade80',
    },
  ]
}

export default function MetricCards({ metricas }: Props) {
  const cards = buildCards(metricas)

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-card2 rounded-2xl overflow-hidden">
          <div
            className="h-[3px]"
            style={{ background: `linear-gradient(90deg, ${card.color}, transparent)` }}
          />
          <div className="p-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3"
              style={{ backgroundColor: `${card.color}20` }}
            >
              {card.icon}
            </div>
            <p className="font-black text-2xl leading-none mb-1" style={{ color: card.color }}>
              {card.value}
            </p>
            <p className="text-xs uppercase tracking-wider text-gray-400">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd lucro-real-mei && npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add lucro-real-mei/src/components/dashboard/MetricCards.tsx
git commit -m "feat(dashboard): adiciona componente MetricCards com 4 cards de métricas"
```

---

## Task 3: Componente MetricasFinanceiras

**Files:**
- Create: `lucro-real-mei/src/components/dashboard/MetricasFinanceiras.tsx`

- [ ] **Step 1: Criar o componente**

Crie `lucro-real-mei/src/components/dashboard/MetricasFinanceiras.tsx`:

```tsx
import { formatCurrency } from '@/lib/potes'
import type { FinanceiroMes } from '@/lib/dashboard-mock'

interface PoteRowProps {
  icon: string
  label: string
  value: number
  total: number
  color: string
  barColor: string
}

function PoteRow({ icon, label, value, total, color, barColor }: PoteRowProps) {
  const pct = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-200 text-sm font-medium">{icon} {label}</span>
        <span className={`font-bold text-sm ${color}`}>{formatCurrency(value)}</span>
      </div>
      <div className="bg-[#1a1a1a] rounded-full h-2">
        <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

interface Props {
  financeiro: FinanceiroMes
}

export default function MetricasFinanceiras({ financeiro }: Props) {
  return (
    <div className="bg-card2 rounded-2xl p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Faturamento do mês</p>
          <p className="text-3xl font-black text-white">{formatCurrency(financeiro.total_entradas)}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Lucro pessoal</p>
          <p className="text-xl font-black text-[#4ade80]">{formatCurrency(financeiro.lucro_pessoal)}</p>
        </div>
      </div>
      <div className="space-y-3 pt-1">
        <PoteRow
          icon="💼" label="Custos do negócio"
          value={financeiro.pote_custos_restante} total={financeiro.pote_custos}
          color="text-[#f59e0b]" barColor="bg-[#f59e0b]"
        />
        <PoteRow
          icon="🏦" label="Reserva de oportunidade"
          value={financeiro.pote_reserva_restante} total={financeiro.pote_reserva}
          color="text-[#818cf8]" barColor="bg-[#818cf8]"
        />
        <PoteRow
          icon="✅" label="Pró-labore"
          value={financeiro.pote_salario_restante} total={financeiro.pote_salario}
          color="text-[#4ade80]" barColor="bg-[#4ade80]"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd lucro-real-mei && npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add lucro-real-mei/src/components/dashboard/MetricasFinanceiras.tsx
git commit -m "feat(dashboard): adiciona componente MetricasFinanceiras com barras dos potes"
```

---

## Task 4: Componente PipelineSnapshot

**Files:**
- Create: `lucro-real-mei/src/components/dashboard/PipelineSnapshot.tsx`

- [ ] **Step 1: Criar o componente**

Crie `lucro-real-mei/src/components/dashboard/PipelineSnapshot.tsx`:

```tsx
import { formatCurrency } from '@/lib/potes'
import { STAGE_CONFIG, STAGE_ORDER, type Lead } from '@/lib/leads'

interface Props {
  leads: Lead[]
}

export default function PipelineSnapshot({ leads }: Props) {
  const porEstagio = STAGE_ORDER.map(estagio => {
    const grupo = leads.filter(l => l.estagio === estagio)
    return {
      estagio,
      label: STAGE_CONFIG[estagio].label,
      color: STAGE_CONFIG[estagio].color,
      count: grupo.length,
      valor: grupo.reduce((s, l) => s + l.valor, 0),
    }
  })

  const maxValor = Math.max(...porEstagio.map(e => e.valor), 1)

  return (
    <div className="bg-card2 rounded-2xl p-4">
      <p className="text-gray-400 text-xs uppercase tracking-wider mb-4">Pipeline por estágio</p>
      <div className="space-y-3">
        {porEstagio.map(({ estagio, label, color, count, valor }) => {
          const pct = Math.round((valor / maxValor) * 100)
          return (
            <div key={estagio}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-200 font-medium">{label}</span>
                <span className="text-gray-400">
                  {count} lead{count !== 1 ? 's' : ''} · {formatCurrency(valor)}
                </span>
              </div>
              <div className="bg-[#1a1a1a] rounded-full h-1.5">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd lucro-real-mei && npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add lucro-real-mei/src/components/dashboard/PipelineSnapshot.tsx
git commit -m "feat(dashboard): adiciona componente PipelineSnapshot com barras por estágio"
```

---

## Task 5: Componente HistoricoFaturamento

**Files:**
- Create: `lucro-real-mei/src/components/dashboard/HistoricoFaturamento.tsx`

- [ ] **Step 1: Criar o componente**

Crie `lucro-real-mei/src/components/dashboard/HistoricoFaturamento.tsx`:

```tsx
import { formatCurrency } from '@/lib/potes'
import type { MesHistorico } from '@/lib/dashboard-mock'

interface Props {
  historico: MesHistorico[]
}

export default function HistoricoFaturamento({ historico }: Props) {
  const maxFaturamento = Math.max(...historico.map(m => m.faturamento), 1)
  const BAR_MAX_HEIGHT = 120
  const BAR_WIDTH = 32
  const GAP = 16
  const LABEL_HEIGHT = 40
  const VALUE_HEIGHT = 20
  const totalWidth = historico.length * (BAR_WIDTH + GAP) - GAP
  const svgHeight = BAR_MAX_HEIGHT + LABEL_HEIGHT + VALUE_HEIGHT

  return (
    <div className="bg-card2 rounded-2xl p-4">
      <p className="text-gray-400 text-xs uppercase tracking-wider mb-6">
        Faturamento — últimos 6 meses
      </p>
      <svg
        viewBox={`0 0 ${totalWidth} ${svgHeight}`}
        width="100%"
        className="overflow-visible"
      >
        {historico.map((mes, i) => {
          const barHeight = Math.max(4, Math.round((mes.faturamento / maxFaturamento) * BAR_MAX_HEIGHT))
          const x = i * (BAR_WIDTH + GAP)
          const barY = VALUE_HEIGHT + (BAR_MAX_HEIGHT - barHeight)
          const opacity = mes.isCurrent ? '1' : '0.45'

          return (
            <g key={mes.mes}>
              {/* valor acima da barra */}
              <text
                x={x + BAR_WIDTH / 2}
                y={VALUE_HEIGHT + (BAR_MAX_HEIGHT - barHeight) - 6}
                textAnchor="middle"
                fontSize="9"
                fill={mes.isCurrent ? '#4ade80' : '#9ca3af'}
              >
                {(mes.faturamento / 1000).toFixed(1)}k
              </text>

              {/* barra */}
              <rect
                x={x}
                y={barY}
                width={BAR_WIDTH}
                height={barHeight}
                rx="6"
                fill="#4ade80"
                opacity={opacity}
              />

              {/* label do mês */}
              <text
                x={x + BAR_WIDTH / 2}
                y={VALUE_HEIGHT + BAR_MAX_HEIGHT + 18}
                textAnchor="middle"
                fontSize="10"
                fill={mes.isCurrent ? '#ffffff' : '#6b7280'}
                fontWeight={mes.isCurrent ? '700' : '400'}
              >
                {mes.mes}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="mt-4 pt-4 border-t border-[#1a1a1a] flex justify-between text-xs text-gray-400">
        <span>Mês atual</span>
        <span className="text-white font-bold">
          {formatCurrency(historico.find(m => m.isCurrent)?.faturamento ?? 0)}
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd lucro-real-mei && npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add lucro-real-mei/src/components/dashboard/HistoricoFaturamento.tsx
git commit -m "feat(dashboard): adiciona gráfico SVG de histórico de faturamento"
```

---

## Task 6: Página /dashboard com tabs

**Files:**
- Rewrite: `lucro-real-mei/src/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Reescrever a página**

Substitua o conteúdo de `lucro-real-mei/src/app/(app)/dashboard/page.tsx` por:

```tsx
'use client'

import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import MetricCards from '@/components/dashboard/MetricCards'
import MetricasFinanceiras from '@/components/dashboard/MetricasFinanceiras'
import PipelineSnapshot from '@/components/dashboard/PipelineSnapshot'
import HistoricoFaturamento from '@/components/dashboard/HistoricoFaturamento'
import {
  calcularMetricasLeads,
  HISTORICO_MOCK,
  FINANCEIRO_MES_MOCK,
} from '@/lib/dashboard-mock'
import { MOCK_LEADS } from '@/lib/leads'

type Tab = 'overview' | 'historico'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',  label: 'Visão Geral' },
  { id: 'historico', label: 'Histórico'   },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const metricas = calcularMetricasLeads(MOCK_LEADS)

  return (
    <div className="px-4 pt-8 space-y-5">
      <PageHeader title="Dashboard" />

      {/* tabs */}
      <div className="flex gap-6 border-b border-[#1a1a1a]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'pb-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-[#4ade80] text-white'
                : 'border-transparent text-gray-400',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* conteúdo */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <MetricCards metricas={metricas} />
          <MetricasFinanceiras financeiro={FINANCEIRO_MES_MOCK} />
          <PipelineSnapshot leads={MOCK_LEADS} />
        </div>
      )}

      {activeTab === 'historico' && (
        <HistoricoFaturamento historico={HISTORICO_MOCK} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd lucro-real-mei && npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Rodar todos os testes**

```bash
cd lucro-real-mei && npm test
```

Esperado: todos os testes passam (8 existentes + 8 novos = 16 total).

- [ ] **Step 4: Commit**

```bash
git add lucro-real-mei/src/app/(app)/dashboard/page.tsx
git commit -m "feat(dashboard): implementa página /dashboard com tabs Visão Geral e Histórico"
```

---

## Task 7: Build final e verificação

- [ ] **Step 1: Rodar build de produção**

```bash
cd lucro-real-mei && npm run build
```

Esperado: build concluído sem erros. Warnings de lint são aceitáveis; erros de TypeScript ou de módulo não são.

- [ ] **Step 2: Testar no servidor local**

```bash
cd lucro-real-mei && npm run dev
```

Verificar manualmente:
- Abrir `http://localhost:3000/dashboard`
- Tab "Visão Geral" mostra: 4 cards no grid 2x2, bloco financeiro com barras dos potes, lista de pipeline por estágio
- Tab "Histórico" mostra: gráfico SVG com 6 barras, mês atual (Abr) mais brilhante
- Alternar entre tabs funciona sem reload
- Layout não quebra em viewport mobile (375px)

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "feat(dashboard): Dashboard de Métricas completo — cards, financeiro, pipeline e histórico"
```

---

## Self-Review

**Cobertura da spec:**
- ✅ 4 cards (Total Leads, Negócios Abertos, Valor Pipeline, Taxa Conversão) — Task 2
- ✅ Bloco financeiro com faturamento + lucro + 3 barras de pote — Task 3
- ✅ Pipeline snapshot por estágio com barra proporcional — Task 4
- ✅ Gráfico SVG de histórico, mês atual destacado — Task 5
- ✅ Tabs "Visão Geral" / "Histórico" com `border-verde` no ativo — Task 6
- ✅ Taxa de conversão exibe `"—"` quando sem ganho/perdido — Task 1 (teste) + Task 2
- ✅ Dados todos mockados, sem Supabase — Task 1
- ✅ Sem dependências novas — SVG puro — Task 5

**Consistência de tipos:**
- `MetricasLeads` definido em Task 1, consumido em Task 2 ✅
- `FinanceiroMes` definido em Task 1, consumido em Task 3 ✅
- `MesHistorico` definido em Task 1, consumido em Task 5 ✅
- `Lead` vem de `src/lib/leads.ts` existente, consumido em Tasks 4 e 6 ✅
- `calcularMetricasLeads` definido em Task 1, consumido em Task 6 ✅
