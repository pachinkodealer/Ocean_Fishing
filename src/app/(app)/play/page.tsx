'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadZone } from '@/components/chart/UploadZone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const TIMEFRAMES = ['1H', '4H', '1D', '1W']

export default function PlayPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [ticker, setTicker] = useState('')
  const [timeframe, setTimeframe] = useState('4H')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !ticker) return
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('screenshot', file)
    formData.append('ticker', ticker.toUpperCase())
    formData.append('timeframe', timeframe)

    const res = await fetch('/api/games', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    router.push(`/play/${data.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Upload Your Chart</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <UploadZone onFile={handleFile} preview={preview} />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Chart Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker Symbol</Label>
              <Input
                id="ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="ETHUSDT"
                className="font-mono uppercase"
                required
              />
              <p className="text-xs text-muted-foreground">Binance perpetual symbols e.g. BTCUSDT, ETHUSDT</p>
            </div>

            <div className="space-y-2">
              <Label>Timeframe</Label>
              <div className="flex gap-2">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors
                      ${timeframe === tf ? 'border-primary bg-primary/10 text-primary' : 'border-muted text-muted-foreground hover:border-primary/50'}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">{error}</p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={!file || !ticker || loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              AI Analyzing Chart...
            </span>
          ) : (
            'Analyze Chart & Make Call'
          )}
        </Button>
      </form>
    </div>
  )
}
