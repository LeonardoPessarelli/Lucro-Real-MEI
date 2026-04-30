# Dashboard de Métricas — Design Spec

**Data:** 2026-04-30
**Branch:** `feat/dashboard-metricas`

---

## Contexto

A rota `/dashboard` existe mas exibe apenas "Em breve". Esta feature a transforma em uma tela completa de métricas do negócio, combinando dados financeiros (potes/transações) e dados de vendas (pipeline de leads).

Todos os dados são mockados — sem Supabase nesta fase. A migração para dados reais (Supabase + Asaas) acontece em branch futura, após testes.

---

## Escopo

1. **Tab "Visão Geral"** — 4 cards de métricas + bloco financeiro + bloco pipeline por estágio
2. **Tab "Histórico"** — gráfico de barras do faturamento dos últimos 6 meses

---

## Arquitetura

### Abordagem: Página com tabs (Client Component)

`/dashboard/page.tsx` vira um Client Component com estado `activeTab: 'overview' | 'historico'`. Duas tabs alternam o bloco de conteúdo exibido — sem rotas extras, sem slots Next.js.

### Arquivos novos

| Arquivo | Responsabilidade |
|---|---|
| `src/app/(app)/dashboard/page.tsx` | Reescrita — Client Component com tabs |
| `src/components/dashboard/MetricCards.tsx` | 4 cards do topo (Total Leads, Negócios Abertos, Valor Pipeline, Taxa Conversão) |
| `src/components/dashboard/MetricasFinanceiras.tsx` | Bloco financeiro do mês (faturamento + barras dos 3 potes) |
| `src/components/dashboard/PipelineSnapshot.tsx` | Bloco de pipeline por estágio (contagem + valor + barra proporcional) |
| `src/components/dashboard/HistoricoFaturamento.tsx` | Tab Histórico — gráfico de barras SVG dos últimos 6 meses |
| `src/lib/dashboard-mock.ts` | Dados mockados: histórico mensal + financeiro do mês atual |

Nenhum arquivo existente é modificado.

---

## Dados Mockados (`src/lib/dashboard-mock.ts`)

### Histórico de faturamento (6 meses)

```ts
export interface MesHistorico {
  mes: string      // "Nov", "Dez", "Jan", ...
  faturamento: number
  isCurrent: boolean
}

export const HISTORICO_MOCK: MesHistorico[] = [
  { mes: 'Nov', faturamento: 8200,  isCurrent: false },
  { mes: 'Dez', faturamento: 11500, isCurrent: false },
  { mes: 'Jan', faturamento: 7800,  isCurrent: false },
  { mes: 'Fev', faturamento: 9400,  isCurrent: false },
  { mes: 'Mar', faturamento: 12300, isCurrent: false },
  { mes: 'Abr', faturamento: 10500, isCurrent: true  },
]
```

### Financeiro do mês atual

```ts
export const FINANCEIRO_MES_MOCK = {
  total_entradas: 10500,
  pote_custos:    4200,   // 40%
  pote_reserva:   2100,   // 20%
  pote_salario:   4200,   // 40%
  pote_custos_restante:   2800,
  pote_reserva_restante:  2100,
  pote_salario_restante:  3150,
  lucro_pessoal:          3150,
}
```

Os dados de leads vêm diretamente de `MOCK_LEADS` já existente em `src/lib/leads.ts` — sem duplicação.

---

## Componentes

### `MetricCards.tsx`

Grid `2x2` no mobile, 4 colunas em desktop. Cada card:

```
┌─[borda topo 3px gradiente colorido]──────────┐
│  [ícone fundo arredondado]                   │
│                                              │
│  47                                          │  ← font-black text-3xl, cor do card
│  TOTAL DE LEADS                              │  ← text-xs uppercase tracking-wider gray-400
└──────────────────────────────────────────────┘
```

| Card | Métrica | Cor |
|---|---|---|
| Total de Leads | `MOCK_LEADS.length` | `#818cf8` roxo |
| Negócios Abertos | leads com `estagio` em `novo \| proposta \| negociacao` | `#3b82f6` azul |
| Valor Pipeline | soma de `valor` dos leads ativos (mesmo estágios acima) | `#22d3ee` ciano |
| Taxa de Conversão | `ganho / (ganho + perdido) * 100` formatado como `"X%"` | `#4ade80` verde |

A borda do topo é um `div` de 3px com `background: linear-gradient(90deg, <cor>, transparent)`.

### `MetricasFinanceiras.tsx`

Card com fundo `bg-card2`, exibe:
- Label "Faturamento do mês" + valor em destaque (`text-3xl font-black text-white`)
- Label "Lucro pessoal" + valor em `text-verde`
- 3 barras de progresso (idêntico visual ao `/resumo`):
  - 💼 Custos do negócio — `text-ambar` / `bg-ambar`
  - 🏦 Reserva de oportunidade — `text-roxo` / `bg-roxo`
  - ✅ Pró-labore — `text-verde` / `bg-verde`

Recebe `FINANCEIRO_MES_MOCK` como prop. Reutiliza o mesmo padrão visual de `PoteBar` do Resumo sem importar o componente diretamente (evita acoplamento — os valores são diferentes).

### `PipelineSnapshot.tsx`

Lista compacta de cada estágio na ordem de `STAGE_ORDER`:

```
Novo Lead      ████████░░░░   3 leads · R$ 12.500
Proposta       ██████░░░░░░   3 leads · R$ 31.000
Negociação     ██░░░░░░░░░░   1 lead  · R$  8.000
Ganho          ████████████   4 leads · R$ 40.500
Perdido        █░░░░░░░░░░░   1 lead  · R$  3.000
```

- Barra proporcional ao valor total do estágio em relação ao maior estágio
- Cor da barra vem de `STAGE_CONFIG[estagio].color`
- Calculado a partir de `MOCK_LEADS` diretamente

### `HistoricoFaturamento.tsx`

Gráfico de barras SVG simples (sem biblioteca externa):
- 6 barras verticais, uma por mês
- Altura proporcional ao faturamento (barra mais alta = 100% do espaço)
- Cor: `#4ade80` (verde) para todos os meses; mês atual com `opacity-100`, demais com `opacity-60`
- Valor em R$ acima de cada barra (`text-xs`)
- Label do mês abaixo da barra (`text-xs text-gray-400`)
- SVG com `viewBox` responsivo, sem altura fixa

---

## Layout da Página

```
PageHeader: "Dashboard"
─────────────────────────────────────
[Visão Geral]  [Histórico]            ← tabs
─────────────────────────────────────

TAB VISÃO GERAL:
  MetricCards (grid 2x2)
  MetricasFinanceiras
  PipelineSnapshot

TAB HISTÓRICO:
  HistoricoFaturamento
```

Tabs: botão com `border-b-2`. Ativo: `border-verde text-white`. Inativo: `border-transparent text-gray-400`.

---

## Estados

- Sem estado de loading (dados mockados, síncronos)
- Sem estado de erro
- Taxa de conversão: se não houver leads `ganho` nem `perdido`, exibe `"—"` em vez de `"0%"`

---

## Fora de Escopo

- Integração com Supabase (fase futura)
- Integração com Asaas (faturamento real de assinaturas)
- Filtro por período no Histórico
- Exportar relatório
- Gráfico de pizza/donut para potes
- Comparação mês a mês no modo Visão Geral
