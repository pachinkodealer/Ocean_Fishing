'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function UpgradeButton({ isPro }: { isPro: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isPro) {
    return (
      <Button className="w-full" variant="outline" disabled>
        You&apos;re on Pro ✓
      </Button>
    )
  }

  async function handleUpgrade() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Something went wrong')
        setLoading(false)
      }
    } catch (e) {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        className="w-full bg-yellow-400 text-black hover:bg-yellow-300"
        onClick={handleUpgrade}
        disabled={loading}
      >
        {loading ? 'Redirecting...' : 'Upgrade to Pro — $3/mo'}
      </Button>
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  )
}
