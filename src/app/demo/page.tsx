'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DemoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startDemo = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/demo/seed', { method: 'POST' })
      const body = await res.json()
      if (!res.ok) {
        setError(body.error || 'Demo seed failed')
        return
      }
      router.push(body.path)
    } catch {
      setError('Could not start demo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="hero-surface rounded-[30px] border border-white/8 p-8 sm:p-12">
        <div className="max-w-3xl space-y-5">
          <span className="status-pill">Judge demo route</span>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
            One click shows the full VIVID loop.
          </h1>
          <p className="text-base leading-8 text-zinc-400 sm:text-lg">
            This route seeds a polished living meme so reviewers can skip API latency and see the
            complete product: identity, chat, content, visuals, Telegram activation, Four.Meme
            export, and BNB soul proof.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={startDemo} disabled={loading} className="btn-primary">
              {loading ? 'Waking demo meme...' : 'Run Pandaudit demo'}
            </button>
            <Link href="/" className="btn-secondary text-center">
              Create from scratch
            </Link>
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Trigger', 'A concept enters VIVID and becomes one canonical character genome.'],
          ['Action', 'The meme speaks, generates content, exports for Four.Meme, and can anchor on BNB.'],
          ['Result', 'Judges get a live organism, not a static launch-kit generator.'],
        ].map(([title, body]) => (
          <div key={title} className="card p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#f3ba2f]">{title}</p>
            <p className="mt-3 text-sm leading-7 text-zinc-300">{body}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

