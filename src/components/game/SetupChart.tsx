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

const CHART_HEIGHT = 340
const MARGINS = { top: 12, right: 72, left: 0, bottom: 0 }
const INNER_H = CHART_HEIGHT - MARGINS.top - MARGINS.bottom

const BULL   = '#00ba74'
const BEAR   = '#fa2050'
const GRID   = 'rgba(255,255,255,0.04)'
const TICK   = '#4a5568'
const ENTRY  = '#f0b429'

const INTRADAY = new Set(['15M', '30M', '1H'])

function formatPrice(p: number) {
  if (p >= 1000) return p.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (p >= 1)    return p.toFixed(2)
  return p.toFixed(4)
}

function formatTooltipTime(ms: number) {
  return new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function makeCandleShape(yMin: number, yMax: number) {
  const span = yMax - yMin
  const toY  = (price: number) => (1 - (price - yMin) / span) * INNER_H

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function CandleShape(props: any) {
    const { x, width, payload } = props
    if (!payload) return null
    const { open, high, low, close } = payload

    const highY   = toY(high)
    const lowY    = toY(low)
    const openY   = toY(open)
    const closeY  = toY(close)
    const isGreen = close >= open
    const color   = isGreen ? BULL : BEAR
    const cx      = x + width / 2
    const bodyTop = Math.min(openY, closeY)
    const bodyH   = Math.max(2, Math.abs(closeY - openY))
    const bw      = Math.max(4, width - 2)

    return (
      <g>
        {/* wick */}
        <line x1={cx} y1={highY} x2={cx} y2={lowY} stroke={color} strokeWidth={1} />
        {/* body */}
        <rect x={cx - bw / 2} y={bodyTop} width={bw} height={bodyH} fill={color} rx={1.5} />
      </g>
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const isGreen = d.close >= d.open
  return (
    <div style={{ background: '#0d1117', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ color: TICK, fontSize: 10, fontFamily: 'monospace', marginBottom: 6 }}>{formatTooltipTime(d.time)}</p>
      <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.6 }}>
        <div style={{ color: TICK }}>O <span style={{ color: '#c9d1d9' }}>{formatPrice(d.open)}</span></div>
        <div style={{ color: TICK }}>H <span style={{ color: BULL }}>{formatPrice(d.high)}</span></div>
        <div style={{ color: TICK }}>L <span style={{ color: BEAR }}>{formatPrice(d.low)}</span></div>
        <div style={{ color: TICK }}>C <span style={{ color: isGreen ? BULL : BEAR, fontWeight: 600 }}>{formatPrice(d.close)}</span></div>
      </div>
    </div>
  )
}

export function SetupChart({ gameId }: { gameId: string }) {
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
      <div style={{ borderRadius: 16, background: '#0d1117', height: CHART_HEIGHT }} className="animate-pulse" />
    )
  }

  if (!data || data.klines.length === 0) return null

  const { klines, entryPrice, keyLevels } = data
  const timeframe  = data.timeframe ?? '4H'
  const isIntraday = INTRADAY.has(timeframe)

  const prices  = [...klines.flatMap(k => [k.high, k.low]), entryPrice]
  const pad     = (Math.max(...prices) - Math.min(...prices)) * 0.08
  const yMin    = Math.min(...prices) - pad
  const yMax    = Math.max(...prices) + pad
  const yDomain: [number, number] = [yMin, yMax]

  const visibleLevels = keyLevels.filter(l => l.price >= yMin && l.price <= yMax)

  const CandleShape = makeCandleShape(yMin, yMax)

  const tickStep = (() => {
    const raw = (yMax - yMin) / 5
    const mag = Math.pow(10, Math.floor(Math.log10(raw)))
    return Math.ceil(raw / mag) * mag
  })()
  const yTicks: number[] = []
  for (let t = Math.ceil(yMin / tickStep) * tickStep; t <= yMax; t += tickStep) yTicks.push(t)

  const xTicks       = klines.filter((_, i) => i % 6 === 0).map(k => k.time)
  const formatXTick  = (ms: number) =>
    isIntraday
      ? new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric' })

  return (
    <div style={{ borderRadius: 16, background: '#0d1117', overflow: 'hidden' }}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <ComposedChart data={klines} margin={MARGINS} barCategoryGap="18%">
          <CartesianGrid stroke={GRID} strokeDasharray="none" vertical={false} />

          <XAxis
            dataKey="time"
            ticks={xTicks}
            tickFormatter={formatXTick}
            tick={{ fontSize: 10, fill: TICK, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            tickFormatter={formatPrice}
            tick={{ fontSize: 10, fill: TICK, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            width={68}
            orientation="right"
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
          />

          {/* Key levels — lines only, no labels (shown in PriceLevels below) */}
          {visibleLevels.map((lvl, i) => (
            <ReferenceLine
              key={i}
              y={lvl.price}
              stroke={lvl.type === 'resistance' ? 'rgba(250,100,60,0.45)' : 'rgba(80,160,255,0.45)'}
              strokeDasharray="3 5"
              strokeWidth={1}
            />
          ))}

          {/* Entry candle highlighted in amber */}
          <ReferenceLine
            y={entryPrice}
            stroke={ENTRY}
            strokeWidth={1}
            strokeDasharray="4 4"
            strokeOpacity={0.7}
          />

          <Bar dataKey="close" shape={<CandleShape />} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
