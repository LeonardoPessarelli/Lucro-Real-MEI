'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useDrawer } from './DrawerProvider'
import WorkspaceSwitcher, { type WorkspaceItem } from './WorkspaceSwitcher'
import LogoutButton from '@/components/ui/LogoutButton'

const NAV_ITEMS = [
  { href: '/',         icon: '🏠', label: 'Início' },
  { href: '/resumo',   icon: '🧾', label: 'Resumo' },
  { href: '/leads',    icon: '👥', label: 'Leads' },
  { href: '/pipeline', icon: '📋', label: 'Pipeline' },
  { href: '/config',   icon: '📊', label: 'Divisão de Lucros' },
]

interface Props {
  workspaces: WorkspaceItem[]
  activeWorkspaceId: string
}

export default function Drawer({ workspaces, activeWorkspaceId }: Props) {
  const { drawerOpen, closeDrawer } = useDrawer()
  const pathname = usePathname()

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-200 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeDrawer}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-sidebar z-50 flex flex-col py-6 px-4 gap-4 transition-transform duration-200 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {workspaces.length > 0 && (
          <WorkspaceSwitcher workspaces={workspaces} activeId={activeWorkspaceId} />
        )}

        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold px-2 mb-3">Menu</p>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, icon, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeDrawer}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-card2 text-verde' : 'text-gray-400 hover:text-gray-200 hover:bg-card2'}`}
                >
                  <span className="text-lg">{icon}</span>
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto pt-4 border-t border-card2">
          <LogoutButton />
        </div>
      </div>
    </>
  )
}
