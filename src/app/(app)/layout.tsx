import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppNav } from '@/components/nav/AppNav'
import { AmbientBackground } from '@/components/ui/ambient-background'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('username, points, streak, plan')
    .eq('id', user.id)
    .single()

  const profile = profileData as { username: string; points: number; streak: number; plan: string } | null

  return (
    <div className="min-h-screen bg-background">
      <AmbientBackground />
      <AppNav
        username={profile?.username ?? 'trader'}
        points={profile?.points ?? 0}
        streak={profile?.streak ?? 0}
      />
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
