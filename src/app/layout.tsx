import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VIVID | Living Meme AI',
  description: 'AI character engine for meme launches. Type a concept, get a living meme with personality, lore, visuals, and a voice.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-40 border-b border-white/5 bg-black/30 px-6 py-4 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="avatar-orb w-9 h-9 rounded-xl bg-[radial-gradient(circle_at_30%_30%,#fff1c7,#ffd76a_52%,#2b1806)] flex items-center justify-center text-[#241703] font-bold text-sm">
                V
              </div>
              <span className="font-bold text-lg text-white">VIVID</span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/gallery" className="text-xs text-zinc-500 hover:text-[#ffe29a] transition-colors">Gallery</a>
              <span className="status-pill hidden sm:inline-flex">Living Meme AI</span>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
