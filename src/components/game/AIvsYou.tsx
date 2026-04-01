'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AIvsYouProps {
  aiCall: 'bull' | 'bear'
  aiTarget: number
  aiReasoning: string
  confidence: number
  userCall?: 'bull' | 'bear' | null
  userTarget?: number | null
  isCorrect?: boolean | null
  aiIsCorrect?: boolean | null
  pointsEarned?: number | null
  resolvedPrice?: number | null
  scored: boolean
}

export function AIvsYou({
  aiCall, aiTarget, aiReasoning, confidence,
  userCall, userTarget, isCorrect, aiIsCorrect,
  pointsEarned, resolvedPrice, scored
}: AIvsYouProps) {
  function CallBadge({ call, correct }: { call?: 'bull' | 'bear' | null; correct?: boolean | null }) {
    if (!call) return <span className="text-muted-foreground text-sm">—</span>
    const isBull = call === 'bull'
    const color = scored && correct != null
      ? correct ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-red-500/20 text-red-400 border-red-500/40'
      : isBull ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'
    return (
      <span className={`px-3 py-1 rounded-full border font-semibold text-sm ${color}`}>
        {isBull ? '▲ LONG' : '▼ SHORT'}
      </span>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* User side */}
      <Card className={`border-2 ${scored && isCorrect ? 'border-green-500/60' : scored ? 'border-red-500/60' : 'border-muted'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">You</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CallBadge call={userCall} correct={isCorrect} />
          {userTarget && (
            <div className="text-sm text-muted-foreground">
              Target: <span className="font-mono text-foreground">${userTarget.toLocaleString()}</span>
            </div>
          )}
          {scored && pointsEarned != null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-2xl font-bold ${pointsEarned > 0 ? 'text-green-400' : 'text-muted-foreground'}`}
            >
              +{pointsEarned} pts
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* AI side */}
      <Card className={`border-2 ${scored && aiIsCorrect ? 'border-green-500/60' : scored ? 'border-red-500/60' : 'border-muted'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            AI
            <Badge variant="outline" className="text-xs">{confidence}% conf.</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CallBadge call={aiCall} correct={aiIsCorrect} />
          <div className="text-sm text-muted-foreground">
            Target: <span className="font-mono text-foreground">${aiTarget.toLocaleString()}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{aiReasoning}</p>
        </CardContent>
      </Card>

      {scored && resolvedPrice && (
        <div className="col-span-2 text-center text-sm text-muted-foreground">
          Resolved at <span className="font-mono text-foreground">${resolvedPrice.toLocaleString()}</span>
        </div>
      )}
    </div>
  )
}
