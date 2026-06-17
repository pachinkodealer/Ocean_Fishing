'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function GamePredictionSection({ gameId, currentPrice }: { gameId: string; currentPrice: number }) {
  const router = useRouter()
  const [direction, setDirection] = useState<'bull' | 'bear' | null>(null)
  const [targetPrice, setTargetPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!direction) return
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/games/${gameId}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction, target_price: targetPrice ? parseFloat(targetPrice) : undefined }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to submit prediction')
      setLoading(false)
      return
    }
    router.refresh()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 py-3 space-y-2">
        {error && (
          <p className="text-xs text-destructive text-center">{error}</p>
        )}

        {!direction ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDirection('bull')}
              className="py-4 rounded-xl border-2 border-green-500/40 bg-green-500/5 hover:bg-green-500/15 hover:border-green-500/70 text-green-500 font-bold text-lg transition-all active:scale-[0.97]"
            >
              ▲ LONG
            </button>
            <button
              type="button"
              onClick={() => setDirection('bear')}
              className="py-4 rounded-xl border-2 border-red-500/40 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/70 text-red-500 font-bold text-lg transition-all active:scale-[0.97]"
            >
              ▼ SHORT
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDirection(null)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all active:scale-[0.97]
                ${direction === 'bull'
                  ? 'border-green-500 bg-green-500/15 text-green-500'
                  : 'border-red-500 bg-red-500/15 text-red-500'}`}
            >
              {direction === 'bull' ? '▲ LONG' : '▼ SHORT'}
              <span className="ml-1.5 opacity-50 font-normal">×</span>
            </button>

            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={e => setTargetPrice(e.target.value)}
                placeholder={`${currentPrice.toFixed(0)} target (opt.)`}
                className="w-full pl-7 pr-3 py-3 rounded-xl border border-border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-shrink-0 px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97]
                ${direction === 'bull'
                  ? 'bg-green-500 hover:bg-green-400 text-black'
                  : 'bg-red-500 hover:bg-red-400 text-white'}
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? '...' : 'Lock In'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
