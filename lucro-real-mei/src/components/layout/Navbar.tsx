'use client'
import { usePathname } from 'next/navigation'
import { MobileSidebar } from './Sidebar'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads':     'Leads',
  '/pipeline':  'Pipeline',
  '/config':    'Configurações',
  '/':          'Início',
  '/resumo':    'Resumo',
  '/assinatura': 'Assinatura',
}

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // sub-rotas: /leads/[id] → 'Leads'
  const base = '/' + pathname.split('/')[1]
  return PAGE_TITLES[base] ?? 'Lucro Real MEI'
}

function UserAvatar({ initials }: { initials: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
      <span className="text-accent text-xs font-bold">{initials}</span>
    </div>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const title    = getTitle(pathname)

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14 bg-bg/90 backdrop-blur border-b border-border">
      {/* Hamburguer — só mobile */}
      <MobileSidebar />

      <h1 className="flex-1 font-semibold text-base">{title}</h1>

      {/* Avatar fake */}
      <UserAvatar initials="DF" />
    </header>
  )
}
