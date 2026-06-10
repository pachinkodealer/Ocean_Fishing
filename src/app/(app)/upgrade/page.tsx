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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Upgrade to Pro</h1>
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
                  <span className="text-primary">✓</span> {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pro */}
        <Card className="border-gold/30 bg-gold/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pro
              {isPro
                ? <Badge className="bg-gold text-black hover:bg-gold">Active</Badge>
                : <Badge className="bg-gold text-black hover:bg-gold">Recommended</Badge>}
            </CardTitle>
            <p className="text-2xl font-bold">$3 <span className="text-base font-normal text-muted-foreground">/month</span></p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="text-sm flex items-center gap-2">
                  <span className="text-primary">✓</span> {f}
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
