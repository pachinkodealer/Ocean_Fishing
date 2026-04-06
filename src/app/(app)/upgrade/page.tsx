import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UpgradeButton } from './UpgradeButton'

const FREE_FEATURES = ['3 calls per day', 'AI scenario analysis', 'Leaderboard access']
const PRO_FEATURES = [
  'Unlimited calls per day',
  'AI scenario analysis',
  'Leaderboard access',
  'Advanced AI confidence scores',
  'Priority scoring',
  'Pro badge on leaderboard',
]

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user!.id)
    .single()

  const isPro = (profile as { plan: string } | null)?.plan === 'pro'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Upgrade to Pro</h1>
        <p className="text-muted-foreground">Unlock unlimited calls and more</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Free
              {!isPro && <Badge variant="outline">Current plan</Badge>}
            </CardTitle>
            <p className="text-2xl font-bold">$0 <span className="text-base font-normal text-muted-foreground">/month</span></p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pro */}
        <Card className="border-yellow-500/40 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pro
              {isPro
                ? <Badge className="bg-yellow-400 text-black hover:bg-yellow-400">Active</Badge>
                : <Badge className="bg-yellow-400 text-black hover:bg-yellow-400">Recommended</Badge>}
            </CardTitle>
            <p className="text-2xl font-bold">$9 <span className="text-base font-normal text-muted-foreground">/month</span></p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="text-sm flex items-center gap-2">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <UpgradeButton isPro={isPro} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
