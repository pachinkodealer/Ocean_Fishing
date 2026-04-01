import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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
      <nav className="border-b px-4 py-3 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/dashboard" className="font-bold text-lg">4H Game</Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/play" className="text-muted-foreground hover:text-foreground transition-colors">Play</Link>
          <Link href="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors">Leaderboard</Link>
          <div className="flex items-center gap-3">
            <span className="font-mono font-semibold text-primary">{profile?.points ?? 0} pts</span>
            {(profile?.streak ?? 0) > 0 && (
              <span className="text-orange-400 text-xs font-semibold">{profile?.streak} 🔥</span>
            )}
            <span className="text-muted-foreground">{profile?.username}</span>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
