import { NextResponse } from 'next/server'
import { runScoring } from '@/lib/scoring/runScoring'

export async function GET() {
  try {
    const result = await runScoring()
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
