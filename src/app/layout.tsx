import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'VIVID | Living Meme AI',
  description:
    'Living Meme AI for Four.Meme. Turn one concept into token identity, lore, visuals, Telegram voice, launch copy, and BNB soul proof.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0d0906]/95 px-5 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="avatar-orb w-9 h-9 rounded-xl bg-[radial-gradient(circle_at_30%_30%,#fff1c7,#ffd76a_52%,#2b1806)] flex items-center justify-center text-[#241703] font-bold text-sm">
                V
              </div>
              <span className="font-bold text-lg text-white">VIVID</span>
            </Link>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]">
              <Link href="/demo" className="nav-bracket">
                Demo
              </Link>
              <Link href="/" className="nav-bracket hidden sm:inline-flex">
                Incubator
              </Link>
              <Link href="/gallery" className="nav-bracket">
                Gallery
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
