'use client'

import { useEffect, useState } from 'react'
import {
  ComposedChart,
  Bar,
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

// Chart inner dimensions — must match margins + height below
const CHART_HEIGHT = 300
const MARGINS = { top: 16, right: 80, left: 4, bottom: 4 }
const INNER_H = CHART_HEIGHT - MARGINS.top - MARGINS.bottom

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatPrice(p: number) {
  if (p >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  if (p >= 1) return `$${p.toFixed(2)}`
  return `$${p.toFixed(4)}`
}

// Candlestick shape — uses closure over yDomain to compute pixel positions
function makeCandleShape(yMin: number, yMax: number) {
  const span = yMax - yMin
  const toY = (price: number) => (1 - (price - yMin) / span) * INNER_H

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function CandleShape(props: any) {
    const { x, width, payload } = props
    if (!payload) return null
    const { open, high, low, close } = payload

    const highY  = toY(high)
    const lowY   = toY(low)
    const openY  = toY(open)
    const closeY = toY(close)
    const isGreen = close >= open
    const color   = isGreen ? '#22c55e' : '#ef4444'
    const cx      = x + width / 2
    const bodyTop = Math.min(openY, closeY)
    const bodyH   = Math.max(1.5, Math.abs(closeY - openY))
    const bw      = Math.max(3, width - 3)

    return (
      <g>
        {/* Wick (high → low) */}
        <line x1={cx} y1={highY} x2={cx} y2={lowY}
          stroke={color} strokeWidth={1} strokeOpacity={0.55} />
        {/* Body */}
        <rect x={cx - bw / 2} y={bodyTop} width={bw} height={bodyH}
          fill={color} fillOpacity={0.85} rx={1} />
      </g>
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const isGreen = d.close >= d.open
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1.5 font-mono">{formatTime(d.time)}</p>
      <div className="space-y-0.5 font-mono">
        <p className="text-zinc-400">O <span className="text-zinc-200">{formatPrice(d.open)}</span></p>
        <p className="text-zinc-400">H <span className="text-green-400">{formatPrice(d.high)}</span></p>
        <p className="text-zinc-400">L <span className="text-red-400">{formatPrice(d.low)}</span></p>
        <p className="text-zinc-400">C <span className={`font-semibold ${isGreen ? 'text-green-400' : 'text-red-400'}`}>{formatPrice(d.close)}</span></p>
      </div>
    </div>
  )
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
        <div className="h-64 bg-muted rounded" />
      </div>
    )
  }

  if (!data || data.klines.length === 0) return null

  const { klines, entryPrice, resolvedPrice, aiCall, aiTarget, keyLevels } = data

  const allPrices = [
    ...klines.flatMap(k => [k.high, k.low]),
    entryPrice, aiTarget,
    ...(resolvedPrice ? [resolvedPrice] : []),
    ...keyLevels.map(l => l.price),
  ]
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const pad = (maxPrice - minPrice) * 0.10
  const yMin = minPrice - pad
  const yMax = maxPrice + pad
  const yDomain: [number, number] = [yMin, yMax]

  const CandleShape = makeCandleShape(yMin, yMax)

  const isUp = resolvedPrice ? resolvedPrice >= entryPrice : aiCall === 'bull'

  const directionPts = isCorrect ? 10 : 0
  const targetPts    = hitTarget ? 25 : 0
  const callLabel    = userCall ? userCall.toUpperCase() : '—'

  // X-axis: show every candle (15-min increments)
  const xTicks = klines.map(k => k.time)

  // Y-axis: compute clean round ticks
  const tickStep = (() => {
    const rawStep = (yMax - yMin) / 5
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
    return Math.ceil(rawStep / magnitude) * magnitude
  })()
  const yTickStart = Math.ceil(yMin / tickStep) * tickStep
  const yTicks: number[] = []
  for (let t = yTickStart; t <= yMax; t += tickStep) yTicks.push(t)

  return (
    <div className="rounded-xl border border-border overflow-hidden">

      {/* ── Score header ── */}
      <div className="px-5 py-4 border-b border-border bg-muted/30 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm tracking-tight">4H Result</h3>
          <span className={`text-lg font-mono font-bold ${(pointsEarned ?? 0) > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
            {(pointsEarned ?? 0) > 0 ? `+${pointsEarned}` : pointsEarned ?? 0} pts
          </span>
        </div>
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
                🔥 <span>Streak</span>
                <span className="font-semibold text-green-500">
                  +{(pointsEarned ?? 0) - directionPts - targetPts} pts
                </span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="px-2 pt-4 pb-2">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <ComposedChart data={klines} margin={MARGINS} barCategoryGap="10%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.07)"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              ticks={xTicks}
              tickFormatter={formatTime}
              tick={{ fontSize: 9, fill: '#a1a1aa', fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={{ stroke: 'rgba(255,255,255,0.07)', strokeOpacity: 0.5 }}
              interval={1}
            />
            <YAxis
              domain={yDomain}
              ticks={yTicks}
              tickFormatter={formatPrice}
              tick={{ fontSize: 9, fill: '#a1a1aa', fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              width={76}
              orientation="right"
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.07)', strokeWidth: 1, strokeDasharray: '3 3' }} />

            {/* Key levels */}
            {keyLevels.map((lvl, i) => (
              <ReferenceLine key={i} y={lvl.price}
                stroke={lvl.type === 'resistance' ? '#f97316' : '#3b82f6'}
                strokeDasharray="4 4" strokeOpacity={0.4} strokeWidth={1} />
            ))}

            {/* Entry */}
            <ReferenceLine y={entryPrice}
              stroke="#a1a1aa"
              strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value: `Entry ${formatPrice(entryPrice)}`, position: 'insideTopLeft', fontSize: 9, fill: '#a1a1aa', fontFamily: 'monospace' }}
            />

            {/* AI target */}
            <ReferenceLine y={aiTarget}
              stroke="#a855f7"
              strokeDasharray="4 4" strokeWidth={1.5}
              label={{ value: `AI ${formatPrice(aiTarget)}`, position: 'insideBottomLeft', fontSize: 9, fill: '#a855f7', fontFamily: 'monospace' }}
            />

            {/* Resolved close */}
            {resolvedPrice && (
              <ReferenceLine y={resolvedPrice}
                stroke={isUp ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                label={{ value: `Close ${formatPrice(resolvedPrice)}`, position: isUp ? 'insideTopLeft' : 'insideBottomLeft', fontSize: 9, fill: isUp ? '#22c55e' : '#ef4444', fontWeight: 'bold', fontFamily: 'monospace', dy: isUp ? -14 : 14 }}
              />
            )}

            {/* Candlesticks */}
            <Bar dataKey="close" shape={<CandleShape />} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 bg-green-500/70 rounded-sm" /> Bull candle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 bg-red-500/70 rounded-sm" /> Bear candle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t border-dashed border-muted-foreground/60" /> Entry
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t border-dashed border-purple-500" /> AI Target
          </span>
          {resolvedPrice && (
            <span className="flex items-center gap-1.5">
              <span className={`inline-block w-4 border-t-2 ${isUp ? 'border-green-500' : 'border-red-500'}`} /> Close
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
