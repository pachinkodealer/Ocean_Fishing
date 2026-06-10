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

interface SetupChartData {
  klines: KlinePoint[]
  entryPrice: number
  keyLevels: KeyLevel[]
  timeframe?: string
}

interface SetupChartProps {
  gameId: string
}

const CHART_HEIGHT = 320
const MARGINS = { top: 16, right: 80, left: 4, bottom: 4 }
const INNER_H = CHART_HEIGHT - MARGINS.top - MARGINS.bottom

// Visible, reliable chart colors (CSS vars are oklch — invalid inside hsl())
const AXIS_TICK = '#a1a1aa'
const GRID_LINE = 'rgba(255,255,255,0.07)'

const INTRADAY = new Set(['15M', '30M', '1H'])

function formatTooltipTime(ms: number) {
  return new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatPrice(p: number) {
  if (p >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  if (p >= 1) return `$${p.toFixed(2)}`
  return `$${p.toFixed(4)}`
}

function makeCandleShape(yMin: number, yMax: number, entryPrice: number) {
  const span = yMax - yMin
  const toY = (price: number) => (1 - (price - yMin) / span) * INNER_H

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function CandleShape(props: any) {
    const { x, width, payload } = props
    if (!payload) return null
    const { open, high, low, close } = payload

    const isEntry = Math.abs(close - entryPrice) / entryPrice < 0.0005
    const highY  = toY(high)
    const lowY   = toY(low)
    const openY  = toY(open)
    const closeY = toY(close)
    const isGreen = close >= open
    const color   = isEntry ? '#f59e0b' : isGreen ? '#22c55e' : '#ef4444'
    const cx      = x + width / 2
    const bodyTop = Math.min(openY, closeY)
    const bodyH   = Math.max(1.5, Math.abs(closeY - openY))
    const bw      = Math.max(3, width - 3)

    return (
      <g>
        <line x1={cx} y1={highY} x2={cx} y2={lowY}
          stroke={color} strokeWidth={1} strokeOpacity={isEntry ? 0.9 : 0.55} />
        <rect x={cx - bw / 2} y={bodyTop} width={bw} height={bodyH}
          fill={color} fillOpacity={isEntry ? 1 : 0.85} rx={1} />
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
      <p className="text-zinc-400 mb-1.5 font-mono">{formatTooltipTime(d.time)}</p>
      <div className="space-y-0.5 font-mono">
        <p className="text-zinc-400">O <span className="text-zinc-200">{formatPrice(d.open)}</span></p>
        <p className="text-zinc-400">H <span className="text-green-400">{formatPrice(d.high)}</span></p>
        <p className="text-zinc-400">L <span className="text-red-400">{formatPrice(d.low)}</span></p>
        <p className="text-zinc-400">C <span className={`font-semibold ${isGreen ? 'text-green-400' : 'text-red-400'}`}>{formatPrice(d.close)}</span></p>
      </div>
    </div>
  )
}

export function SetupChart({ gameId }: SetupChartProps) {
  const [data, setData] = useState<SetupChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/games/${gameId}/setup-chart`)
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

  const { klines, entryPrice, keyLevels } = data
  const timeframe = data.timeframe ?? '4H'
  const isIntraday = INTRADAY.has(timeframe)

  // Scale to the candles + entry only — far-away key levels must not
  // compress the price action
  const candlePrices = [...klines.flatMap(k => [k.high, k.low]), entryPrice]
  const candleMin = Math.min(...candlePrices)
  const candleMax = Math.max(...candlePrices)
  const pad = (candleMax - candleMin) * 0.08
  const yMin = candleMin - pad
  const yMax = candleMax + pad
  const yDomain: [number, number] = [yMin, yMax]

  // Only draw key levels that fall inside the visible range
  const visibleLevels = keyLevels.filter(l => l.price >= yMin && l.price <= yMax)

  const CandleShape = makeCandleShape(yMin, yMax, entryPrice)

  const tickStep = (() => {
    const rawStep = (yMax - yMin) / 6
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
    return Math.ceil(rawStep / magnitude) * magnitude
  })()
  const yTickStart = Math.ceil(yMin / tickStep) * tickStep
  const yTicks: number[] = []
  for (let t = yTickStart; t <= yMax; t += tickStep) yTicks.push(t)

  // Time axis: intraday games show clock time, 4H shows date + hour
  const xTicks = klines.filter((_, i) => i % 5 === 0).map(k => k.time)
  const formatXTick = (ms: number) =>
    isIntraday
      ? new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric' })

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="font-semibold text-sm tracking-tight">ETH Perps · {timeframe} Context</h3>
        <span className="text-xs text-muted-foreground font-mono">{klines.length} candles · entry highlighted</span>
      </div>

      <div className="px-2 pt-4 pb-2">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <ComposedChart data={klines} margin={MARGINS} barCategoryGap="10%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={GRID_LINE}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              ticks={xTicks}
              tickFormatter={formatXTick}
              tick={{ fontSize: 10, fill: AXIS_TICK, fontFamily: 'monospace' }}
              axisLine={{ stroke: GRID_LINE }}
              tickLine={{ stroke: GRID_LINE }}
            />
            <YAxis
              domain={yDomain}
              ticks={yTicks}
              tickFormatter={formatPrice}
              tick={{ fontSize: 10, fill: AXIS_TICK, fontFamily: 'monospace' }}
              axisLine={{ stroke: GRID_LINE }}
              tickLine={false}
              width={76}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: GRID_LINE, strokeWidth: 1, strokeDasharray: '3 3' }} />

            {visibleLevels.map((lvl, i) => (
              <ReferenceLine key={i} y={lvl.price}
                stroke={lvl.type === 'resistance' ? '#f97316' : '#3b82f6'}
                strokeDasharray="4 4" strokeOpacity={0.5} strokeWidth={1}
                label={{ value: lvl.label, position: 'insideTopRight', fontSize: 8, fill: lvl.type === 'resistance' ? '#f97316' : '#3b82f6', fontFamily: 'monospace', dy: -4 }}
              />
            ))}

            <ReferenceLine y={entryPrice}
              stroke="#f59e0b"
              strokeWidth={1.5}
              label={{ value: `Entry ${formatPrice(entryPrice)}`, position: 'insideTopLeft', fontSize: 9, fill: '#f59e0b', fontFamily: 'monospace' }}
            />

            <Bar dataKey="close" shape={<CandleShape />} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 bg-green-500/70 rounded-sm" /> Bull
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 bg-red-500/70 rounded-sm" /> Bear
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 bg-amber-500 rounded-sm" /> Entry
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t border-dashed border-orange-400/70" /> Resistance
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t border-dashed border-blue-400/70" /> Support
          </span>
        </div>
      </div>
    </div>
  )
}
