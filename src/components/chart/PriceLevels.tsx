import type { KeyLevel } from '@/types/database'

const typeColors: Record<KeyLevel['type'], string> = {
  resistance: 'text-red-400 bg-red-400/10',
  support: 'text-green-400 bg-green-400/10',
  fib: 'text-yellow-400 bg-yellow-400/10',
  pivot: 'text-blue-400 bg-blue-400/10',
}

interface PriceLevelsProps {
  levels: KeyLevel[]
  currentPrice: number
}

export function PriceLevels({ levels, currentPrice }: PriceLevelsProps) {
  const sorted = [...levels].sort((a, b) => b.price - a.price)

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Key Levels</p>
      {sorted.map((level, i) => {
        const isAbove = level.price > currentPrice
        return (
          <div key={i} className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${typeColors[level.type]}`}>
                {level.type}
              </span>
              <span className="text-sm text-muted-foreground truncate max-w-32">{level.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{isAbove ? '▲' : '▼'}</span>
              <span className="font-mono text-sm font-semibold">${level.price.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
