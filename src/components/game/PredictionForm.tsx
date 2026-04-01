'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PredictionFormProps {
  gameId: string
  currentPrice: number
  onSubmit: (direction: 'bull' | 'bear', targetPrice?: number) => Promise<void>
  disabled?: boolean
}

export function PredictionForm({ gameId, currentPrice, onSubmit, disabled }: PredictionFormProps) {
  const [direction, setDirection] = useState<'bull' | 'bear' | null>(null)
  const [targetPrice, setTargetPrice] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!direction) return
    setLoading(true)
    await onSubmit(direction, targetPrice ? parseFloat(targetPrice) : undefined)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2 block">Your Call</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDirection('bull')}
            className={`p-4 rounded-xl border-2 font-semibold text-lg transition-all
              ${direction === 'bull'
                ? 'border-green-500 bg-green-500/10 text-green-500'
                : 'border-muted hover:border-green-500/50 text-muted-foreground'}`}
          >
            ▲ LONG
          </button>
          <button
            type="button"
            onClick={() => setDirection('bear')}
            className={`p-4 rounded-xl border-2 font-semibold text-lg transition-all
              ${direction === 'bear'
                ? 'border-red-500 bg-red-500/10 text-red-500'
                : 'border-muted hover:border-red-500/50 text-muted-foreground'}`}
          >
            ▼ SHORT
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target">Target Price <span className="text-muted-foreground">(optional, +25 pts if hit)</span></Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="target"
            type="number"
            step="0.01"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder={currentPrice.toFixed(2)}
            className="pl-7 font-mono"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!direction || loading || disabled}
      >
        {loading ? 'Submitting...' : 'Lock In My Call'}
      </Button>
    </form>
  )
}
