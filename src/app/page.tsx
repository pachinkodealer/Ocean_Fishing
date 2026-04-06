'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-xl font-mono">4H Game</span>
        <div className="flex gap-3">
          <Link href="/login" className={buttonVariants({ variant: 'ghost' })}>Sign In</Link>
          <Link href="/signup" className={buttonVariants()}>Get Started</Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-6 py-20 space-y-20">

        {/* Hero */}
        <section className="flex flex-col items-center text-center space-y-6 max-w-2xl">
          <span className="text-xs font-medium px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground">
            ⚡ Free to play · No credit card required
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Upload a Chart.<br />
            <span className="text-primary">Beat the AI.</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload any trading chart screenshot. AI extracts key levels and makes its own call.
            You call it too. Score points after 4 hours. Climb the leaderboard.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="/signup" className={buttonVariants({ size: 'lg' })}>
              Start Playing Free
            </Link>
            <Link href="/leaderboard" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              View Leaderboard
            </Link>
          </div>
        </section>

        {/* Mock game result card */}
        <section className="w-full max-w-sm">
          <p className="text-xs text-center text-muted-foreground mb-3 uppercase tracking-widest">Example result</p>
          <div className="rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div>
                <p className="font-bold font-mono text-base">ETHUSDT</p>
                <p className="text-xs text-muted-foreground">4H · Entry $2,129.56</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Resolved at</p>
                <p className="font-mono font-bold">$2,201.40</p>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Result of BULL</span>
                <span className="text-green-500 font-mono font-bold text-lg">+35 pts</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  <span>Direction</span>
                  <span className="font-semibold text-green-500 ml-auto">+10 pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  <span>Target hit $2,200</span>
                  <span className="font-semibold text-green-500 ml-auto">+25 pts</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border flex gap-3">
                <div className="flex-1 bg-muted/40 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-muted-foreground">You</p>
                  <span className="text-xs font-bold text-green-500">▲ LONG</span>
                </div>
                <div className="flex-1 bg-muted/40 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-muted-foreground">AI · 71% conf.</p>
                  <span className="text-xs font-bold text-green-500">▲ LONG</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full max-w-2xl space-y-6">
          <h2 className="text-center text-xl font-bold">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '📸', title: 'Upload your chart', desc: 'Screenshot any chart from TradingView or your broker.' },
              { icon: '🤖', title: 'AI makes its call', desc: 'Claude extracts key levels, generates Bull & Bear scenarios, and picks a side.' },
              { icon: '🏆', title: 'Score after 4H', desc: 'Price resolves. Points awarded for correct direction and target hits.' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center space-y-2 p-5 rounded-xl border border-border bg-muted/20">
                <span className="text-3xl">{item.icon}</span>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats bar */}
        <section className="w-full max-w-2xl">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground border-t border-b border-border py-5">
            {['3 game mechanics', '4H resolution', 'Weekly leaderboard', 'Free to start'].map(s => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                {s}
              </span>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>Free: 3 calls/day · Pro: unlimited at $9/mo</span>
        <div className="flex gap-4">
          <Link href="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link>
          <Link href="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
        </div>
      </footer>

    </div>
  )
}
