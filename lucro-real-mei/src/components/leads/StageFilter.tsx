import type { LeadEstagio } from '@/lib/leads'
import { STAGE_CONFIG, STAGE_ORDER } from '@/lib/leads'

interface Props {
  selected: LeadEstagio | 'todos'
  onChange: (v: LeadEstagio | 'todos') => void
}

export default function StageFilter({ selected, onChange }: Props) {
  const chips: { value: LeadEstagio | 'todos'; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    ...STAGE_ORDER.map(s => ({ value: s, label: STAGE_CONFIG[s].label })),
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {chips.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            selected === value
              ? 'bg-verde text-black'
              : 'bg-card2 text-gray-400'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
