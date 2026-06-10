'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

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
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Play</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Live ETH Perps setup, auto-detected. Call it bull or bear.</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                ETHUSDT Perps
              </span>
              <span className="text-xs font-semibold bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full">
                Resolves in {selected.resolves}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Pulls the latest 30 candles from the ETH perpetual futures market, detects a live setup, and runs AI analysis — no screenshot needed.
            </p>
          </div>

          {/* Timeframe selector */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Timeframe</p>
            <div className="grid grid-cols-4 gap-2">
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf.value}
                  type="button"
                  onClick={() => setTimeframe(tf.value)}
                  className={`py-2 rounded-lg border text-sm font-medium transition-colors
                    ${timeframe === tf.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted text-muted-foreground hover:border-primary/50'}`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">{error}</p>
          )}

          <Button onClick={handleFindSetup} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing ETH {selected.label}...
              </span>
            ) : (
              `Find a ${selected.label} Setup & Play`
            )}
          </Button>

          <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
            <p>+10 pts — correct direction</p>
            <p>+25 pts — target price hit</p>
            <p>+5/10/20 bonus — streak (3/5/10)</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Have your own chart?{' '}
        <Link href="/play/upload" className="text-primary hover:underline">
          Upload a screenshot instead
        </Link>
      </p>
    </div>
  )
}
