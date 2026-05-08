'use client'
import { STAGE_ORDER, STAGE_CONFIG, type LeadEstagio } from '@/lib/leads'

interface Props {
  selected: LeadEstagio | 'todos'
  onChange: (v: LeadEstagio | 'todos') => void
  counts?: Partial<Record<LeadEstagio, number>>
}

export default function StageFilter({ selected, onChange, counts }: Props) {
  const options = [
    { key: 'todos' as const, label: 'Todos', color: null },
    ...STAGE_ORDER.map(e => ({ key: e, label: STAGE_CONFIG[e].label, color: STAGE_CONFIG[e].color })),
  ]
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
      {options.map(({ key, label, color }) => {
        const active = selected === key
        const count = key !== 'todos' ? counts?.[key as LeadEstagio] : undefined
        return (
          <button key={key} onClick={() => onChange(key)}
            style={active && color ? { background: color + '33', color, borderColor: color } : {}}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border whitespace-nowrap
              ${active && !color ? 'bg-verde/20 text-verde border-verde' : !active ? 'bg-card2 text-gray-400 border-transparent' : 'border'}`}>
            {label}{count !== undefined ? ` ${count}` : ''}
          </button>
        )
      })}
    </div>
  )
}
