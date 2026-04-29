import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DesktopSidebar } from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/ui/BottomNav'
import TrialBanner from '@/components/ui/TrialBanner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, trial_ends_at')
    .eq('user_id', user.id)
    .single()

  const diasRestantes = sub?.status === 'trial'
    ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar fixa — desktop */}
      <DesktopSidebar />

      {/* Coluna principal */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Trial banner */}
        {diasRestantes !== null && <TrialBanner diasRestantes={diasRestantes} />}

        {/* Topbar com hamburguer mobile */}
        <Navbar />

        {/* Conteúdo da página */}
        <main className="flex-1 px-4 py-6 lg:px-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* BottomNav — só mobile (lg:hidden) */}
      <BottomNav />
    </div>
  )
}
