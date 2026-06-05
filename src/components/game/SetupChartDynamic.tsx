'use client'

import dynamic from 'next/dynamic'

export const SetupChartDynamic = dynamic(
  () => import('./SetupChart').then(m => m.SetupChart),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border h-72 animate-pulse bg-muted/30" />
    ),
  }
)
