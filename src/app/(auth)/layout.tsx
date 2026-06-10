import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <span className="w-2.5 h-2.5 rounded-full bg-primary group-hover:shadow-[0_0_10px_var(--primary)] transition-shadow" />
        <span className="font-bold text-xl tracking-tight">4H Game</span>
      </Link>
      {children}
    </div>
  )
}
