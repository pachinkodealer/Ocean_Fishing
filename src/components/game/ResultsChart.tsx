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
  return p >= 1000
    ? `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    : `$${p.toFixed(2)}`
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
        <div className="h-4 w-40 bg-muted rounded mb-4" />
        <div className="h-56 bg-muted rounded" />
      </div>
    )
  }

  if (!data || data.klines.length === 0) return null

  const { klines, entryPrice, resolvedPrice, aiCall, aiTarget, keyLevels } = data

  const chartData = klines.map(k => ({ ...k, value: k.close }))

  const allPrices = [
    ...klines.flatMap(k => [k.high, k.low]),
    entryPrice,
    aiTarget,
    ...(resolvedPrice ? [resolvedPrice] : []),
    ...keyLevels.map(l => l.price),
  ]
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const pad = (maxPrice - minPrice) * 0.12
  const yDomain = [minPrice - pad, maxPrice + pad]

  const isUp = resolvedPrice ? resolvedPrice >= entryPrice : aiCall === 'bull'
  const areaColor = isUp ? '#22c55e' : '#ef4444'
  const gradientId = `gradient-${gameId}`

  const directionPts = isCorrect ? 10 : 0
  const targetPts = hitTarget ? 25 : 0
  const callLabel = userCall ? userCall.toUpperCase() : '—'

  return (
    <div className="rounded-xl border border-border overflow-hidden">

      {/* ── Score header ── */}
      <div className="px-5 py-4 border-b border-border bg-muted/30 space-y-3">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm tracking-tight">4H Result</h3>
          <span className={`text-lg font-mono font-bold ${(pointsEarned ?? 0) > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
            {(pointsEarned ?? 0) > 0 ? `+${pointsEarned}` : pointsEarned ?? 0} pts
          </span>
        </div>

        {/* "Result of BULL/BEAR:" breakdown */}
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Result of {callLabel}:</span>
          <span className="ml-2 inline-flex items-center gap-1">
            {isCorrect ? '✅' : '❌'}
            <span>Direction</span>
            <span className={`font-semibold ${isCorrect ? 'text-green-500' : 'text-foreground'}`}>
              {isCorrect ? `+${directionPts} pts` : '0 pts'}
            </span>
          </span>
          <span className="mx-2 text-border">·</span>
          <span className="inline-flex items-center gap-1">
            {hitTarget ? '✅' : '❌'}
            <span>Target</span>
            <span className={`font-semibold ${hitTarget ? 'text-green-500' : 'text-foreground'}`}>
              {hitTarget ? `+${targetPts} pts` : '0 pts'}
            </span>
          </span>
          {(pointsEarned ?? 0) > directionPts + targetPts && (
            <>
              <span className="mx-2 text-border">·</span>
              <span className="inline-flex items-center gap-1">
                🔥
                <span>Streak bonus</span>
                <span className="font-semibold text-green-500">
                  +{(pointsEarned ?? 0) - directionPts - targetPts} pts
                </span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={areaColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={areaColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />

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

            {/* Key levels — no inline labels, colour only */}
            {keyLevels.map((lvl, i) => (
              <ReferenceLine
                key={i}
                y={lvl.price}
                stroke={lvl.type === 'resistance' ? '#f97316' : '#3b82f6'}
                strokeDasharray="4 4"
                strokeOpacity={0.45}
                strokeWidth={1}
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
                position: 'insideBottomLeft',
                fontSize: 10,
                fill: 'hsl(var(--muted-foreground))',
              }}
            />

            {/* AI target */}
            <ReferenceLine
              y={aiTarget}
              stroke="#a855f7"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `AI target ${formatPrice(aiTarget)}`,
                position: 'insideTopLeft',
                fontSize: 10,
                fill: '#a855f7',
              }}
            />

            {/* Resolved close */}
            {resolvedPrice && (
              <ReferenceLine
                y={resolvedPrice}
                stroke={isUp ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                label={{
                  value: `Close ${formatPrice(resolvedPrice)}`,
                  position: isUp ? 'insideTopLeft' : 'insideBottomLeft',
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
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 justify-center text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-dashed border-foreground/50" />
            Entry
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-purple-500" />
            AI Target
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-dashed border-orange-400" />
            Resistance
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-dashed border-blue-500" />
            Support
          </span>
          {resolvedPrice && (
            <span className="flex items-center gap-1.5">
              <span className={`inline-block w-5 border-t-2 ${isUp ? 'border-green-500' : 'border-red-500'}`} />
              Close
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
