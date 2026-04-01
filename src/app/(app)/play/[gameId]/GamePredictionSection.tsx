'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PredictionForm } from '@/components/game/PredictionForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function GamePredictionSection({ gameId, currentPrice }: { gameId: string; currentPrice: number }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(direction: 'bull' | 'bear', targetPrice?: number) {
    setError(null)
    const res = await fetch(`/api/games/${gameId}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction, target_price: targetPrice }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to submit prediction')
      return
    }
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make Your Call</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
        )}
        <PredictionForm
          gameId={gameId}
          currentPrice={currentPrice}
          onSubmit={handleSubmit}
        />
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
          <p>+10 pts — correct direction</p>
          <p>+25 pts — target price hit</p>
          <p>+5/10/20 bonus — streak (3/5/10)</p>
        </div>
      </CardContent>
    </Card>
  )
}
