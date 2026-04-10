'use client'

import { useState } from 'react'

interface Props {
  gameId: string
}

export function ShareButton({ gameId }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/share/${gameId}`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My 4H Game Result', url })
        return
      } catch { /* user cancelled or not supported */ }
    }

    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 text-sm border border-border bg-card hover:bg-muted px-3 py-1.5 rounded-lg transition-colors"
    >
      {copied ? (
        <><span>✓</span> Link copied!</>
      ) : (
        <><span>🔗</span> Share result</>
      )}
    </button>
  )
}
