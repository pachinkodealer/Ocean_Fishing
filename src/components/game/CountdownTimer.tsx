'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  resolveAt: string
  onExpire?: () => void
}

export function CountdownTimer({ resolveAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('')
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    function update() {
      const diff = new Date(resolveAt).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Scoring...')
        setExpired(true)
        onExpire?.()
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`)
    }

    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [resolveAt, onExpire])

  return (
    <div className={`text-center font-mono text-2xl font-bold tabular-nums ${expired ? 'text-muted-foreground' : 'text-primary'}`}>
      {timeLeft}
    </div>
  )
}
