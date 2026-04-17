'use client'

import dynamic from 'next/dynamic'

export const ResultsChartDynamic = dynamic(
  () => import('./ResultsChart').then(m => m.ResultsChart),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border h-64 animate-pulse bg-muted/30" />
    ),
  }
)
