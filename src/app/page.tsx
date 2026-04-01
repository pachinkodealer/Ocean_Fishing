'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-xl">4H Game</span>
        <div className="flex gap-3">
          <Link href="/login" className={buttonVariants({ variant: 'ghost' })}>Sign In</Link>
          <Link href="/signup" className={buttonVariants()}>Get Started</Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-8 py-20">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Upload a Chart.<br />
            <span className="text-primary">Beat the AI.</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Upload any trading chart screenshot. AI extracts key levels, generates Bull & Bear scenarios, makes its own call — then you make yours. Score points for correct direction and target hits. Compete on the leaderboard.
          </p>
        </div>

        <div className="flex gap-4">
          <Link href="/signup" className={buttonVariants({ size: 'lg' })}>Start Playing Free</Link>
          <Link href="/leaderboard" className={buttonVariants({ variant: 'outline', size: 'lg' })}>View Leaderboard</Link>
        </div>

        <div className="grid grid-cols-3 gap-8 max-w-2xl w-full pt-8 border-t">
          {[
            { label: 'Predict & Score', desc: 'Upload chart → AI analyzes → you call Long or Short → score after 4H' },
            { label: 'AI vs You', desc: 'The AI makes its own call simultaneously. Beat the AI to earn badges.' },
            { label: 'Leaderboard', desc: 'Weekly and all-time rankings. Compete with traders worldwide.' },
          ].map((f) => (
            <div key={f.label} className="text-left space-y-2">
              <p className="font-semibold">{f.label}</p>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Free: 3 calls/day · Pro: unlimited at $9/mo
        </p>
      </main>
    </div>
  )
}
