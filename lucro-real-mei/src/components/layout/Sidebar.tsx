'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Settings,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react'
import WorkspaceSwitcher, { type WorkspaceItem } from './WorkspaceSwitcher'
import LogoutButton from '@/components/ui/LogoutButton'

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/leads',        label: 'Leads',        icon: Users           },
  { href: '/pipeline',     label: 'Pipeline',     icon: GitBranch       },
  { href: '/config',       label: 'Configurações', icon: Settings        },
]

interface SidebarProps {
  workspaces: WorkspaceItem[]
  activeWorkspaceId: string
}

function SidebarContent({ workspaces, activeWorkspaceId, onNav }: SidebarProps & { onNav?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <TrendingUp size={16} className="text-black" />
        </div>
        <span className="font-display font-bold text-base tracking-tight">Lucro Real</span>
      </div>

      {/* Workspace switcher */}
      <div className="px-3 py-3 border-b border-border">
        <WorkspaceSwitcher workspaces={workspaces} activeId={activeWorkspaceId} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-accent/10 text-accent border-l-2 border-accent pl-[10px]'
                  : 'text-muted hover:text-white hover:bg-card2'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border">
        <LogoutButton className="flex items-center gap-2 text-muted hover:text-white text-sm transition-colors w-full px-3 py-2 rounded-lg hover:bg-card2" />
      </div>
    </div>
  )
}

/* ── Desktop sidebar (fixo, visível em lg+) ── */
export function DesktopSidebar({ workspaces, activeWorkspaceId }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-sidebar border-r border-border h-screen sticky top-0">
      <SidebarContent workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} />
    </aside>
  )
}

/* ── Mobile sidebar (Sheet hamburguer) ── */
export function MobileSidebar({ workspaces, activeWorkspaceId }: SidebarProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-lg hover:bg-card2 transition-colors"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-border transform transition-transform duration-200 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-card2 transition-colors text-muted hover:text-white"
          aria-label="Fechar menu"
        >
          <X size={18} />
        </button>
        <SidebarContent workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} onNav={() => setOpen(false)} />
      </div>
    </>
  )
}
