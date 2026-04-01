import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const FREE_FEATURES = ['3 calls per day', 'AI scenario analysis', 'Leaderboard access']
const PRO_FEATURES = [
  'Unlimited calls per day',
  'AI scenario analysis',
  'Leaderboard access',
  'Advanced AI confidence scores',
  'Priority scoring',
  'Pro badge on leaderboard',
]

export default function UpgradePage() {
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
              <Badge variant="outline">Current</Badge>
            </CardTitle>
            <p className="text-2xl font-bold">$0</p>
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
              <Badge className="bg-yellow-400 text-black hover:bg-yellow-400">Recommended</Badge>
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
            <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-300" disabled>
              Coming Soon
            </Button>
            <p className="text-xs text-center text-muted-foreground">Stripe integration coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
