// Subtle full-viewport depth: faint trading grid + a soft glow near the top.
// Pure CSS, fixed behind content (pages opt in by sitting at z-10). Tuned
// subtler than the landing hero since app pages carry real content.
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage:
          'radial-gradient(50% 45% at 78% 8%, rgba(0,186,116,0.10), transparent 70%),' +
          'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 46px 46px, 46px 46px',
        maskImage: 'radial-gradient(150% 75% at 50% 0%, black 45%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(150% 75% at 50% 0%, black 45%, transparent 100%)',
      }}
    />
  )
}
