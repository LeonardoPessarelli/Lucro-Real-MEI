'use client'
import { STAGE_ORDER, STAGE_CONFIG, type LeadEstagio } from '@/lib/leads'

interface Props {
  selected: LeadEstagio | 'todos'
  onChange: (v: LeadEstagio | 'todos') => void
  counts?: Partial<Record<LeadEstagio, number>>
}

export default function StageFilter({ selected, onChange, counts }: Props) {
  const all = [{ key: 'todos' as const, label: 'Todos' }, ...STAGE_ORDER.map(e => ({ key: e, label: STAGE_CONFIG[e].label }))]
  return (
    <div className="flex flex-wrap gap-2">
      {all.map(({ key, label }) => {
        const active = selected === key
        const count = key !== 'todos' ? counts?.[key] : undefined
        return (
          <button key={key} onClick={() => onChange(key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${active ? 'bg-verde text-black' : 'bg-card2 text-gray-400'}`}>
            {label}{count !== undefined ? ` ${count}` : ''}
          </button>
        )
      })}
    </div>
  )
}
