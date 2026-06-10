import Link from 'next/link'

const FREE_FEATURES = ['3 calls per day', 'AI scenario analysis', 'Leaderboard access']
const PRO_FEATURES = ['Unlimited calls per day', 'AI scenario analysis', 'Leaderboard access', 'Priority scoring', 'Pro badge on leaderboard']

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Dark hero section ── */}
      <div className="bg-zinc-950 text-white flex flex-col">

        {/* Nav */}
        <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="font-bold text-xl tracking-tight text-white">4H Game</span>
          </span>
          <div className="flex gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2 text-sm font-medium bg-green-500 hover:bg-green-400 text-black rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="flex flex-col lg:flex-row items-center justify-center gap-16 px-6 py-24 max-w-6xl mx-auto w-full">

          {/* Left — copy */}
          <div className="flex flex-col items-start space-y-6 max-w-xl">
            <span className="text-xs font-medium px-3 py-1 rounded-full border border-green-500/40 bg-green-500/10 text-green-400">
              ⚡ Free to play · No credit card required
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Spot the Setup.<br />
              <span className="text-green-400">Beat the AI.</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Train your eyes to see setups faster — without risking a single dollar.
              Live ETH Perps setups, auto-detected. AI maps the key levels and makes its call.
              You make yours. Scored in as little as 15 minutes.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/signup" className="px-6 py-3 text-sm font-semibold bg-green-500 hover:bg-green-400 text-black rounded-lg transition-colors">
                Start Playing Free
              </Link>
              <Link href="/leaderboard" className="px-6 py-3 text-sm font-semibold border border-white/20 hover:border-white/40 text-white rounded-lg transition-colors">
                View Leaderboard
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500">
              {['Live ETH Perps data', '15M · 30M · 1H · 4H timeframes', 'No uploads needed'].map(s => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-green-500 inline-block" />{s}
                </span>
              ))}
            </div>
          </div>

          {/* Right — product preview card */}
          <div className="w-full max-w-sm flex-shrink-0">
            <p className="text-xs text-center text-zinc-500 mb-3 uppercase tracking-widest">Live example</p>
            <div className="rounded-2xl border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-green-500/20">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-bold font-mono text-base text-white">ETHUSDT</p>
                  <p className="text-xs text-zinc-500">4H · Entry $2,129.56</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Resolved at</p>
                  <p className="font-mono font-bold text-white">$2,201.40</p>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-300">Result of BULL</span>
                  <span className="text-green-400 font-mono font-bold text-xl">+35 pts</span>
                </div>
                <div className="text-sm text-zinc-500 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span>✅</span><span>Direction correct</span>
                    <span className="font-semibold text-green-400 ml-auto">+10 pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✅</span><span>Target hit $2,200</span>
                    <span className="font-semibold text-green-400 ml-auto">+25 pts</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2">
                  <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                    <p className="text-xs text-zinc-500 mb-0.5">You</p>
                    <span className="text-xs font-bold text-green-400">▲ LONG</span>
                  </div>
                  <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                    <p className="text-xs text-zinc-500 mb-0.5">AI · 71% conf.</p>
                    <span className="text-xs font-bold text-green-400">▲ LONG</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>
      </div>

      {/* ── Game preview section ── */}
      <div className="bg-zinc-900 border-t border-white/10 px-6 py-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-mono">Live example</p>
            <h2 className="text-2xl font-bold text-white">What a scored game looks like</h2>
            <p className="text-zinc-400 text-sm">Real analysis · Real score · Real competition</p>
          </div>

          {/* Mock game card */}
          <div className="rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl shadow-black/60">

            {/* Game header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold font-mono text-xl text-white">ETHUSDT</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/20 font-semibold">SCORED</span>
                </div>
                <p className="text-xs text-zinc-500">4H · Entry $2,229.99</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 mb-0.5">Resolved at</p>
                <p className="font-mono font-bold text-xl text-white">$2,369.76</p>
                <p className="text-xs text-green-400 font-semibold">▲ +6.27%</p>
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* Key levels */}
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 font-mono mb-3">Key Levels</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { type: 'resistance', label: 'Swing High', price: '$2,375' },
                    { type: 'resistance', label: 'Recent Resistance', price: '$2,336.9' },
                    { type: 'resistance', label: 'Immediate Res.', price: '$2,250' },
                    { type: 'support', label: 'EMA 50', price: '$2,214' },
                    { type: 'support', label: 'EMA 21', price: '$2,203' },
                    { type: 'support', label: 'Key Support', price: '$2,176' },
                    { type: 'support', label: 'Bid Wall', price: '$2,125' },
                  ].map((lvl) => (
                    <span key={lvl.price} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-mono ${
                      lvl.type === 'resistance'
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {lvl.type === 'resistance' ? '▲' : '▼'} {lvl.label} <span className="text-white/70">{lvl.price}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Scenario cards */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 space-y-3">
                  <p className="text-sm font-semibold text-green-400">▲ Bull Scenario</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Target</span>
                    <span className="font-mono text-white">$2,336.9 <span className="text-green-400 text-xs">(+4.8%)</span></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Invalidation</span>
                    <span className="font-mono text-white">$2,176</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">Price consolidating above EMA 21 and EMA 50 cluster. A reclaim of $2,250 could trigger momentum toward the $2,336 swing high.</p>
                </div>
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
                  <p className="text-sm font-semibold text-red-400">▼ Bear Scenario</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Target</span>
                    <span className="font-mono text-white">$2,125 <span className="text-red-400 text-xs">(-4.7%)</span></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Invalidation</span>
                    <span className="font-mono text-white">$2,250</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">Failure to hold above the EMA cluster and the 24H low at $2,176 would confirm bearish continuation toward the $2,125 bid wall.</p>
                </div>
              </div>

              {/* Score + AI vs You */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 font-mono">4H Result</p>
                    <p className="text-sm text-zinc-300 mt-0.5">
                      <span className="text-white font-medium">Result of BULL:</span>
                      <span className="ml-2">✅ Direction <span className="text-green-400 font-semibold">+10 pts</span></span>
                      <span className="mx-2 text-zinc-600">·</span>
                      <span>✅ Target <span className="text-green-400 font-semibold">+25 pts</span></span>
                    </p>
                  </div>
                  <span className="text-2xl font-mono font-bold text-green-400">+35 pts</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                    <p className="text-xs text-zinc-500 mb-1">You called</p>
                    <p className="text-lg font-bold text-green-400">🐂 BULL</p>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">Target $2,282.98</p>
                    <p className="text-sm font-semibold text-green-400 mt-1.5">✅ +35 pts</p>
                  </div>
                  <div className="rounded-lg border border-green-500/20 bg-white/5 p-3">
                    <p className="text-xs text-zinc-500 mb-1">AI called <span className="text-zinc-600">· 58% conf.</span></p>
                    <p className="text-lg font-bold text-green-400">🐂 BULL</p>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">Target $2,300</p>
                    <p className="text-xs text-zinc-500 mt-1.5">✅ Correct</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <p className="text-center text-sm text-zinc-500">
            Every call is scored automatically using live market data — in as little as 15 minutes.{' '}
            <Link href="/signup" className="text-green-400 hover:text-green-300 transition-colors">Play your first game free →</Link>
          </p>
        </div>
      </div>

      {/* ── Light sections below hero ── */}
      <main className="flex-1 flex flex-col items-center bg-background px-6 py-20 space-y-24">

        {/* How it works */}
        <section className="w-full max-w-4xl space-y-10">
          <h2 className="text-center text-2xl font-bold">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
            {[
              { icon: '⚡', step: '01', title: 'Get a live setup', desc: 'One click pulls a live ETH Perps setup straight from the market. Pick 15M, 30M, 1H, or 4H.' },
              { icon: '🤖', step: '02', title: 'AI makes its call', desc: 'AI maps key levels, generates Bull & Bear scenarios, and picks a side with confidence.' },
              { icon: '🏆', step: '03', title: 'Score & climb', desc: 'Price resolves automatically on your timeframe. Points for direction and target hits. Streaks earn bonuses.' },
            ].map((item, i) => (
              <div key={item.step} className="relative flex flex-col items-center text-center space-y-3 p-7 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                <span className="text-4xl">{item.icon}</span>
                <span className="text-xs font-mono text-muted-foreground">{item.step}</span>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                {i < 2 && (
                  <span className="hidden sm:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-lg z-10">→</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Simple pricing</h2>
            <p className="text-muted-foreground text-sm">Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="rounded-2xl border border-border p-6 space-y-5">
              <div>
                <p className="font-bold text-lg">Free</p>
                <p className="text-3xl font-extrabold mt-1">$0 <span className="text-base font-normal text-muted-foreground">/month</span></p>
              </div>
              <ul className="space-y-2">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-500">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="inline-flex items-center justify-center w-full border border-white/20 text-white hover:bg-white/10 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Start Free
              </Link>
            </div>
            {/* Pro */}
            <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/5 p-6 space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg">Pro</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400 text-black font-semibold">Recommended</span>
                </div>
                <p className="text-3xl font-extrabold mt-1">$3 <span className="text-base font-normal text-muted-foreground">/month</span></p>
              </div>
              <ul className="space-y-2">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full text-center px-4 py-2 text-sm font-semibold bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg transition-colors">
                Get Pro — $3/mo
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t bg-background px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <span className="font-mono font-semibold">4H Game</span>
        <div className="flex gap-4">
          <Link href="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link>
          <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          <Link href="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
        </div>
      </footer>

    </div>
  )
}
