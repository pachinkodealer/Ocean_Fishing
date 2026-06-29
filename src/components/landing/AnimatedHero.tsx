const BULL = '#00ba74'
const BEAR = '#fa2050'

// height/wick values are % of the candle column; delay staggers the build-in
const CANDLES = [
  { body: 30, wick: 46, wickBottom: 28, up: false, delay: 0.05 },
  { body: 26, wick: 40, wickBottom: 34, up: true,  delay: 0.15 },
  { body: 34, wick: 50, wickBottom: 40, up: true,  delay: 0.25 },
  { body: 24, wick: 44, wickBottom: 30, up: false, delay: 0.35 },
  { body: 40, wick: 52, wickBottom: 42, up: true,  delay: 0.45 },
  { body: 46, wick: 58, wickBottom: 48, up: true,  delay: 0.55 },
  { body: 30, wick: 50, wickBottom: 40, up: false, delay: 0.65 },
  { body: 50, wick: 62, wickBottom: 52, up: true,  delay: 0.75 },
  { body: 58, wick: 70, wickBottom: 58, up: true,  delay: 0.85 },
  { body: 52, wick: 66, wickBottom: 54, up: true,  delay: 0.95 },
]

export function AnimatedHero() {
  return (
    <div className="rounded-2xl bg-[#0a0e12] p-5 ring-1 ring-green-500/20 shadow-2xl shadow-black/50 overflow-hidden">
      {/* header */}
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <p className="text-[17px] font-semibold text-white tracking-tight leading-none">Beat the AI.</p>
          <p className="text-[11px] text-zinc-600 mt-1">Call the candle. No money at risk.</p>
        </div>
        <p className="ah-score text-right font-mono text-[11px] text-zinc-600 leading-tight">
          You <span className="text-green-400 font-medium">7</span> · <span className="text-red-400 font-medium">AI 5</span><br />this week
        </p>
      </div>

      {/* stage */}
      <div className="relative h-[120px] mt-1">
        {/* resistance line */}
        <div className="absolute left-0 right-0 top-[30%] border-t border-dashed" style={{ borderColor: 'rgba(250,100,60,.5)' }} />
        <span className="absolute right-0 font-mono text-[9px]" style={{ top: 'calc(30% - 14px)', color: 'rgba(250,100,60,.8)' }}>resistance</span>

        {/* candles */}
        <div className="absolute inset-0 flex items-end gap-[7px] px-0.5 pb-[18px]">
          {CANDLES.map((c, i) => {
            const color = c.up ? BULL : BEAR
            return (
              <div key={i} className="relative flex-1 h-full flex flex-col items-center justify-end">
                <span
                  className="ah-wick absolute"
                  style={{ width: 1.5, height: `${c.wick}%`, bottom: `${c.wickBottom}%`, background: color, animationDelay: `${c.delay}s` }}
                />
                <span
                  className="ah-body rounded-[2px]"
                  style={{ width: '62%', height: `${c.body}%`, background: color, animationDelay: `${c.delay}s` }}
                />
              </div>
            )
          })}
        </div>

        {/* scanning highlight */}
        <div
          className="ah-scan absolute top-0 w-[34px]"
          style={{ bottom: 18, background: 'linear-gradient(90deg,transparent,rgba(0,186,116,.18),transparent)' }}
        />

        {/* floating points */}
        <span className="ah-pts absolute top-[18%] font-mono font-bold text-sm text-green-400">+25</span>

        {/* the call */}
        <span
          className="ah-call absolute font-bold text-[15px] px-4 py-1.5 rounded-[10px]"
          style={{ background: '#0d2b0d', border: `1.5px solid ${BULL}`, color: BULL, boxShadow: '0 0 18px rgba(0,186,116,.35)' }}
        >
          ▲ LONG
        </span>

        {/* axis */}
        <div className="absolute left-0 right-0 bottom-0 flex justify-between font-mono text-[9px]" style={{ color: '#2b3440' }}>
          <span>09:00</span><span>11:00</span><span>13:00</span>
        </div>
      </div>
    </div>
  )
}
