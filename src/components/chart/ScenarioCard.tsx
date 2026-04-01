import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Scenario } from '@/types/database'

interface ScenarioCardProps {
  type: 'bull' | 'bear'
  scenario: Scenario
  currentPrice: number
}

export function ScenarioCard({ type, scenario, currentPrice }: ScenarioCardProps) {
  const isBull = type === 'bull'
  const pctToTarget = ((scenario.target - currentPrice) / currentPrice * 100).toFixed(2)

  return (
    <Card className={`border-2 ${isBull ? 'border-green-500/40' : 'border-red-500/40'}`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-lg flex items-center gap-2 ${isBull ? 'text-green-500' : 'text-red-500'}`}>
          <span>{isBull ? '▲' : '▼'}</span>
          {isBull ? 'Bull' : 'Bear'} Scenario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Target</span>
          <span className="font-mono font-semibold">
            ${scenario.target.toLocaleString()}
            <span className={`ml-2 text-xs ${isBull ? 'text-green-400' : 'text-red-400'}`}>
              ({isBull ? '+' : ''}{pctToTarget}%)
            </span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Invalidation</span>
          <span className="font-mono">${scenario.invalidation.toLocaleString()}</span>
        </div>
        <p className="text-muted-foreground border-t pt-2 mt-2 text-xs leading-relaxed">
          {scenario.reasoning}
        </p>
      </CardContent>
    </Card>
  )
}
