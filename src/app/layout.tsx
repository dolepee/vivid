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
        <header className="border-b border-white/5 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm">V</div>
              <span className="font-bold text-lg text-white">VIVID</span>
            </a>
            <span className="text-xs text-zinc-500">Living Meme AI</span>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
