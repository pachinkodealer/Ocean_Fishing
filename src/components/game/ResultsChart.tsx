'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

interface KlinePoint {
  time: number
  open: number
  high: number
  low: number
  close: number
}

interface KeyLevel {
  label: string
  price: number
  type: string
}

interface ChartData {
  klines: KlinePoint[]
  entryPrice: number
  resolvedPrice: number | null
  aiCall: string
  aiTarget: number
  keyLevels: KeyLevel[]
  bullTarget: number | null
  bearTarget: number | null
  status: string
}

interface ResultsChartProps {
  gameId: string
  userCall: 'bull' | 'bear' | null
  isCorrect: boolean | null
  pointsEarned: number | null
  hitTarget: boolean | null
}

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatPrice(p: number) {
  return p >= 1000 ? `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `$${p.toFixed(2)}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="bg-background border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="text-muted-foreground mb-1">{formatTime(d.time)}</p>
        <p>O: {formatPrice(d.open)}</p>
        <p>H: {formatPrice(d.high)}</p>
        <p>L: {formatPrice(d.low)}</p>
        <p className="font-semibold">C: {formatPrice(d.close)}</p>
      </div>
    )
  }
  return null
}

export function ResultsChart({ gameId, userCall, isCorrect, pointsEarned, hitTarget }: ResultsChartProps) {
  const [data, setData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/games/${gameId}/chart-data`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [gameId])

  if (loading) {
    return (
      <div className="rounded-xl border border-border p-6 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded mb-4" />
        <div className="h-48 bg-muted rounded" />
      </div>
    )
  }

  if (!data || data.klines.length === 0) return null

  const { klines, entryPrice, resolvedPrice, aiCall, aiTarget, keyLevels } = data

  // Build chart data — use close price for area
  const chartData = klines.map(k => ({ ...k, value: k.close }))

  // Determine price range with padding
  const allPrices = [
    ...klines.flatMap(k => [k.high, k.low]),
    entryPrice,
    aiTarget,
    ...(resolvedPrice ? [resolvedPrice] : []),
    ...keyLevels.map(l => l.price),
  ]
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const pad = (maxPrice - minPrice) * 0.1
  const yDomain = [minPrice - pad, maxPrice + pad]

  const isUp = resolvedPrice ? resolvedPrice >= entryPrice : aiCall === 'bull'
  const areaColor = isUp ? '#22c55e' : '#ef4444'
  const gradientId = `gradient-${gameId}`

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Score breakdown header */}
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-semibold text-sm">4H Result</h3>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            {/* Direction */}
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isCorrect === true ? 'bg-green-500/15 text-green-500' :
                isCorrect === false ? 'bg-red-500/15 text-red-500' :
                'bg-muted text-muted-foreground'
              }`}>
                {userCall ? userCall.toUpperCase() : '—'}
              </span>
              <span className="text-muted-foreground text-xs">
                {isCorrect === true ? '+10 pts ✓' : isCorrect === false ? '0 pts ✗' : ''}
              </span>
            </div>
            {/* Target */}
            {hitTarget !== null && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Target</span>
                <span className={`text-xs font-semibold ${hitTarget ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {hitTarget ? '+25 pts ✓' : '0 pts ✗'}
                </span>
              </div>
            )}
            {/* Total */}
            {pointsEarned !== null && (
              <div className="font-mono font-bold text-base">
                <span className={pointsEarned > 0 ? 'text-green-500' : 'text-muted-foreground'}>
                  +{pointsEarned} pts
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={areaColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={areaColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />

            <XAxis
              dataKey="time"
              tickFormatter={formatTime}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={yDomain}
              tickFormatter={formatPrice}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              width={68}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Key levels — subtle */}
            {keyLevels.map((lvl, i) => (
              <ReferenceLine
                key={i}
                y={lvl.price}
                stroke={lvl.type === 'resistance' ? '#f97316' : '#3b82f6'}
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                strokeWidth={1}
                label={{
                  value: `${lvl.type === 'resistance' ? '▲' : '▼'} ${formatPrice(lvl.price)}`,
                  position: 'insideTopRight',
                  fontSize: 9,
                  fill: lvl.type === 'resistance' ? '#f97316' : '#3b82f6',
                  opacity: 0.8,
                }}
              />
            ))}

            {/* Entry price */}
            <ReferenceLine
              y={entryPrice}
              stroke="hsl(var(--foreground))"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{
                value: `Entry ${formatPrice(entryPrice)}`,
                position: 'insideBottomRight',
                fontSize: 10,
                fill: 'hsl(var(--foreground))',
              }}
            />

            {/* AI target */}
            <ReferenceLine
              y={aiTarget}
              stroke="#a855f7"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `AI ${formatPrice(aiTarget)}`,
                position: 'insideTopLeft',
                fontSize: 10,
                fill: '#a855f7',
              }}
            />

            {/* Resolved price */}
            {resolvedPrice && (
              <ReferenceLine
                y={resolvedPrice}
                stroke={isUp ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                label={{
                  value: `Close ${formatPrice(resolvedPrice)}`,
                  position: 'insideTopRight',
                  fontSize: 10,
                  fill: isUp ? '#22c55e' : '#ef4444',
                  fontWeight: 'bold',
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="value"
              stroke={areaColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: areaColor }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-2 justify-center text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-px bg-foreground border-dashed border-t-2" />
            Entry
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-px bg-purple-500" />
            AI Target
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-px bg-orange-400" />
            Resistance
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-px bg-blue-500" />
            Support
          </span>
          {resolvedPrice && (
            <span className="flex items-center gap-1">
              <span className={`inline-block w-4 h-px ${isUp ? 'bg-green-500' : 'bg-red-500'}`} />
              Close
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
