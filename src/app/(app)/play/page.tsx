'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TIMEFRAMES = [
  { value: '15m', label: '15M', resolves: '15 min' },
  { value: '30m', label: '30M', resolves: '30 min' },
  { value: '1h',  label: '1H',  resolves: '1 hour' },
  { value: '4h',  label: '4H',  resolves: '4 hours' },
]

export default function PlayPage() {
  const router = useRouter()
  const [timeframe, setTimeframe] = useState('4h')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selected = TIMEFRAMES.find(t => t.value === timeframe)!

  async function handleFindSetup() {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeframe }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }
    router.push(`/play/${data.id}`)
  }

  return (
    <div className="max-w-sm mx-auto pt-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Play</h1>
        <p className="text-muted-foreground text-sm mt-1">ETH Perps · call it bull or bear</p>
      </div>

      {/* Timeframe selector */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Timeframe</p>
        <div className="grid grid-cols-4 gap-2">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.value}
              type="button"
              onClick={() => setTimeframe(tf.value)}
              className={`py-3 rounded-xl border-2 text-sm font-bold transition-all active:scale-[0.96]
                ${timeframe === tf.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
            >
              {tf.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Resolves in <span className="text-foreground font-medium">{selected.resolves}</span>
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl">{error}</p>
      )}

      <button
        onClick={handleFindSetup}
        disabled={loading}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Finding setup…
          </span>
        ) : (
          `Find ${selected.label} Setup`
        )}
      </button>
    </div>
  )
}
