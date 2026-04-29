import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DrawerProvider from '@/components/layout/DrawerProvider'
import Navbar from '@/components/layout/Navbar'
import Drawer from '@/components/layout/Drawer'
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
    <DrawerProvider>
      <div className="min-h-screen max-w-md mx-auto">
        {diasRestantes !== null && <TrialBanner diasRestantes={diasRestantes} />}
        <Navbar />
        <Drawer />
        <main className="px-0">
          {children}
        </main>
      </div>
    </DrawerProvider>
  )
}
