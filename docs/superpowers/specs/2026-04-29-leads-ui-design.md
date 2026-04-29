# Gestão de Leads UI — Design Spec

**Data:** 2026-04-29
**Branch:** `feat/leads-ui`
**Abordagem:** UI-first com dados mockados (sem Supabase)

---

## Escopo

Esta feature entrega três coisas na mesma branch:

1. **Navegação hambúrguer global** — substitui o BottomNav atual
2. **Tela `/leads`** — lista de leads com filtro por estágio e modal de cadastro
3. **Tela `/pipeline`** — kanban com scroll horizontal e drag-and-drop

Todos os dados são mockados em `src/lib/leads.ts`. Nenhuma chamada ao Supabase.

---

## Tipo de Dado

```ts
// src/lib/leads.ts
export type LeadEstagio = 'novo' | 'em_contato' | 'proposta' | 'fechado' | 'perdido'

export interface Lead {
  id: string
  nome: string
  contato: string          // WhatsApp, e-mail ou telefone
  valor: number            // valor estimado do negócio em R$
  origem: string           // Instagram, indicação, site, etc.
  servico: string          // serviço de interesse
  anotacoes: string | null
  estagio: LeadEstagio
  created_at: string
}
```

O arquivo também exporta `MOCK_LEADS: Lead[]` com ~5 leads de exemplo cobrindo todos os estágios, e `STAGE_CONFIG` com label, cor e ordem de cada estágio.

### Cores dos estágios

| Estágio | Cor |
|---|---|
| novo | `#3b82f6` (azul) |
| em_contato | `#f59e0b` (amarelo) |
| proposta | `#a855f7` (roxo) |
| fechado | `#4ade80` (verde) |
| perdido | `#ef4444` (vermelho) |

---

## 1. Navegação Hambúrguer

### Substituição do BottomNav

O arquivo `src/components/ui/BottomNav.tsx` é deletado. O layout `src/app/(app)/layout.tsx` remove a importação do BottomNav e o padding-bottom associado (`pb-24`).

### Navbar (`src/components/layout/Navbar.tsx`)

Já existe — será expandido com:
- Botão hambúrguer à esquerda que abre o Drawer
- Título da página ao centro (já existente)
- Botão "+" à direita: na Home e Resumo abre `LancamentoModal`; em Leads e Pipeline abre `LeadModal`; nas demais telas não aparece

### Drawer (`src/components/layout/Drawer.tsx`)

Novo componente Client Component:
- Slide da esquerda com `transform: translateX` animado
- Overlay escuro (`bg-black/60`) fecha o drawer ao clicar
- Lista de itens de navegação com ícone + label:
  - 🏠 Início (`/`)
  - 🧾 Resumo (`/resumo`)
  - 👥 Leads (`/leads`)
  - 📋 Pipeline (`/pipeline`)
  - 📊 Potes (`/config`)
  - 💳 Plano (`/assinatura`)
- Item ativo destacado com `text-verde`
- Fecha ao clicar em qualquer link

### DrawerProvider (`src/components/layout/DrawerProvider.tsx`)

Client Component leve que fornece `{ drawerOpen, toggleDrawer, closeDrawer }` via Context. O layout Server Component envolve os filhos com `<DrawerProvider>` — assim Navbar e Drawer compartilham estado sem prop drilling.

### Layout (`src/app/(app)/layout.tsx`)

- Remove `BottomNav`
- Remove `pb-24`
- Envolve `children` com `<DrawerProvider>`
- Renderiza `<Navbar>` e `<Drawer>` dentro do provider

---

## 2. Tela `/leads`

**Arquivo:** `src/app/(app)/leads/page.tsx` — Client Component (precisa de estado para filtro e modal)

### Estrutura visual

```
PageHeader: "Leads"  [+ Novo Lead]
─────────────────────────────────
Chips de filtro (scroll horizontal):
  Todos · Novo · Em contato · Proposta · Fechado · Perdido
─────────────────────────────────
Lista de LeadCards filtrados
  (ou EmptyState se vazio)
```

### LeadCard (`src/components/leads/LeadCard.tsx`)

Card reutilizado em `/leads` e no kanban:

```
┌─ [barra colorida 3px] ──────────────────────────────┐
│  Nome do Lead                    [badge estágio]     │
│  💼 Serviço · R$ 1.200                              │
│  📍 Origem · há X dias                              │
└──────────────────────────────────────────────────────┘
```

- Borda esquerda colorida pela cor do estágio
- Badge com label do estágio e cor de fundo suave
- Toque no card → abre `LeadModal` em modo edição

### StageFilter (`src/components/leads/StageFilter.tsx`)

- Chips horizontais com scroll, sem quebra de linha
- "Todos" selecionado por padrão
- Chip ativo: fundo `bg-verde` texto preto; inativo: `bg-card2` texto `gray-400`

### LeadModal (`src/components/leads/LeadModal.tsx`)

Modal de cadastro e edição. Campos:
- Nome / Empresa (obrigatório)
- Contato — WhatsApp, e-mail ou telefone (obrigatório)
- Valor estimado R$ (número, obrigatório)
- Origem — select: Instagram, Indicação, Site, Google, Outro
- Serviço de interesse (texto livre, obrigatório)
- Anotações (textarea, opcional)
- Estágio inicial — select com todos os 5 estágios

Validação com Zod + react-hook-form (padrão já usado no projeto).

Ações: Salvar (adiciona/edita no estado local) · Cancelar · Excluir (só em modo edição).

---

## 3. Tela `/pipeline`

**Arquivo:** `src/app/(app)/pipeline/page.tsx` — Client Component

### Estrutura visual

```
[← scroll horizontal →]
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Novo  2 │ │Contato  1│ │Proposta 1│ │Fechado  1│ │Perdido  0│
│──────────│ │──────────│ │──────────│ │──────────│ │──────────│
│ LeadCard │ │ LeadCard │ │ LeadCard │ │ LeadCard │ │  (vazio) │
│ LeadCard │ │          │ │          │ │          │ │  ········│
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

- Cada coluna: `min-w-[240px]`, altura total da viewport menos header
- Cards compactos: só nome, serviço e valor (sem origem/data para economizar espaço)
- Coluna vazia: área tracejada com "Arraste leads aqui"

### KanbanBoard (`src/components/leads/KanbanBoard.tsx`)

- Usa `@dnd-kit/core` e `@dnd-kit/sortable`
- Estado local `leads: Lead[]` — reset ao recarregar (comportamento esperado com dados mockados)
- Ao soltar em nova coluna: atualiza `estagio` do lead no estado

### KanbanColumn (`src/components/leads/KanbanColumn.tsx`)

- Header com cor do estágio + label + contagem
- `SortableContext` com os leads da coluna
- Aceita drop de cards de outras colunas (`useDroppable`)

---

## 4. Componentes — Resumo

| Arquivo | Novo / Modificado |
|---|---|
| `src/lib/leads.ts` | novo |
| `src/components/layout/DrawerProvider.tsx` | novo |
| `src/components/layout/Drawer.tsx` | novo |
| `src/components/layout/Navbar.tsx` | modificado |
| `src/components/leads/LeadCard.tsx` | novo |
| `src/components/leads/LeadModal.tsx` | novo |
| `src/components/leads/StageFilter.tsx` | novo |
| `src/components/leads/KanbanBoard.tsx` | novo |
| `src/components/leads/KanbanColumn.tsx` | novo |
| `src/app/(app)/leads/page.tsx` | novo |
| `src/app/(app)/pipeline/page.tsx` | novo |
| `src/app/(app)/layout.tsx` | modificado |
| `src/components/ui/BottomNav.tsx` | deletado |

---

## 5. Dependência Nova

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Biblioteca leve (~20kb gzip), feita para React, com suporte a touch/mobile.

---

## 6. Estados Vazios e Erros

- `/leads` sem leads → `EmptyState` com "Nenhum lead ainda. Toque em + para adicionar."
- Filtro sem resultado → mensagem inline "Nenhum lead neste estágio"
- Coluna do kanban vazia → área tracejada "Arraste leads aqui"
- Drag-and-drop: estado local, sem persistência (reset ao reload esperado)

---

## 7. Testes

Nenhum teste unitário novo. A feature é puramente apresentação com dados mockados. `npm test` e `npm run build` devem continuar passando sem alterações.

---

## 8. Fora de Escopo

- Persistência no Supabase (fica para branch futura, igual M8 para transações)
- Notificações ou lembretes de follow-up
- Conversão automática de lead fechado em transação
