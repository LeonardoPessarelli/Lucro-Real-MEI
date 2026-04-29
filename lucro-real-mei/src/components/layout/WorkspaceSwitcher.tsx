'use client'
import { useState } from 'react'
import { ChevronDown, Check, Building2 } from 'lucide-react'

const WORKSPACES_MOCK = [
  { id: '1', name: 'Minha Empresa', initials: 'ME' },
  { id: '2', name: 'Freelance',     initials: 'FL' },
]

export default function WorkspaceSwitcher() {
  const [active, setActive]   = useState(WORKSPACES_MOCK[0])
  const [open,   setOpen]     = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-card2 hover:bg-border transition-colors text-sm"
      >
        <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Building2 size={13} className="text-accent" />
        </div>
        <span className="flex-1 text-left truncate font-medium">{active.name}</span>
        <ChevronDown size={14} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-card border border-border rounded-lg py-1 shadow-xl">
          {WORKSPACES_MOCK.map(ws => (
            <button
              key={ws.id}
              onClick={() => { setActive(ws); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-card2 text-sm transition-colors"
            >
              <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent text-[10px] font-bold">{ws.initials}</span>
              </div>
              <span className="flex-1 text-left truncate">{ws.name}</span>
              {ws.id === active.id && <Check size={13} className="text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
