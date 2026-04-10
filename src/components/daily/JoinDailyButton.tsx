'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function JoinDailyButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleJoin() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/daily/join', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      router.push(`/play/${data.gameId}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleJoin}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors"
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
        ) : '⚡'}
        {loading ? 'Joining...' : "Join Today's Challenge"}
      </button>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}
