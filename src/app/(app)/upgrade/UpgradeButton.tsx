'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function UpgradeButton({ isPro }: { isPro: boolean }) {
  const [loading, setLoading] = useState(false)

  if (isPro) {
    return (
      <Button className="w-full" variant="outline" disabled>
        You&apos;re on Pro ✓
      </Button>
    )
  }

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button
      className="w-full bg-yellow-400 text-black hover:bg-yellow-300"
      onClick={handleUpgrade}
      disabled={loading}
    >
      {loading ? 'Redirecting...' : 'Upgrade to Pro — $9/mo'}
    </Button>
  )
}
