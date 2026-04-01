import { NextResponse } from 'next/server'

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const res = await fetch(`${appUrl}/api/score`, {
    method: 'POST',
    headers: {
      'x-cron-secret': process.env.CRON_SECRET!,
    },
  })
  const data = await res.json()
  return NextResponse.json(data)
}
