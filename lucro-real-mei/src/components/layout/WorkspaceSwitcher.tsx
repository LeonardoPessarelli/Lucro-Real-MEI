'use client'
import { useState } from 'react'
import { ChevronDown, Check, Building2 } from 'lucide-react'

export interface WorkspaceItem {
  id: string
  nome: string
}

interface Props {
  workspaces: WorkspaceItem[]
  activeId: string
}

export default function WorkspaceSwitcher({ workspaces, activeId }: Props) {
  const [currentId, setCurrentId] = useState(activeId)
  const [open, setOpen] = useState(false)

  const current = workspaces.find(w => w.id === currentId) ?? workspaces[0]

  if (!current) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-card2 hover:bg-border transition-colors text-sm"
      >
        <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Building2 size={13} className="text-accent" />
        </div>
        <span className="flex-1 text-left truncate font-medium">{current.nome}</span>
        {workspaces.length > 1 && (
          <ChevronDown size={14} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {open && workspaces.length > 1 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-card border border-border rounded-lg py-1 shadow-xl">
          {workspaces.map(ws => (
            <button
              key={ws.id}
              onClick={() => { setCurrentId(ws.id); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-card2 text-sm transition-colors"
            >
              <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent text-[10px] font-bold">
                  {ws.nome.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="flex-1 text-left truncate">{ws.nome}</span>
              {ws.id === currentId && <Check size={13} className="text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
