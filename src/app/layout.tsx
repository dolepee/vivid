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
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0A0D14]/95 px-5 py-2.5 backdrop-blur-md">
          <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center">
            <Link href="/" className="flex items-center gap-2 justify-self-start">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-amber-500/30 bg-amber-500 text-sm font-bold text-[#0A0D14] shadow-[0_0_18px_rgba(217,119,6,0.2)]">
                V
              </div>
              <span className="text-base font-bold tracking-[0.02em] text-zinc-100">VIVID</span>
            </Link>
            <div className="flex items-center gap-2 justify-self-center font-mono text-xs uppercase tracking-[0.18em]">
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
            <div aria-hidden="true" />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
