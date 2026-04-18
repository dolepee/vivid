'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CharacterSpec } from '@/lib/types'

const EXAMPLES = [
  'a cat that gives terrible financial advice',
  'a sleep-deprived panda that audits meme coins with fortune cookies',
  'a paranoid toaster that thinks every launch is a rug pull',
  'a wholesome grandma who accidentally became a degen',
  'an ancient frog philosopher who only speaks in trading metaphors',
]

const GENERATION_PHASES = [
  { at: '0.1s', label: 'Parsing cultural signal', detail: 'Prompt intent is normalized into a launchable meme concept.' },
  { at: '0.8s', label: 'Building canonical genome', detail: 'Name, ticker, lore, tone, worldview, and motifs are locked together.' },
  { at: '1.4s', label: 'Generating launch voice', detail: 'Chat voice, social copy, replies, and holder language are derived from one spec.' },
  { at: '2.1s', label: 'Rendering visual cortex', detail: 'Image prompts inherit the same identity instead of drifting randomly.' },
  { at: '2.8s', label: 'Preparing Four.Meme export', detail: 'Launch copy, lore anchor, ticker, and visual package are staged.' },
  { at: '3.4s', label: 'Soul hash ready', detail: 'The identity can be anchored on BNB as proof of one canonical soul.' },
]

const PROOF_BADGES = [
  ['BNB Testnet Proof', 'Soul registry anchor'],
  ['Telegram Persona', 'Holders can talk to it'],
  ['Four.Meme Export', 'Launch kit ready'],
  ['Persistent Memory', 'One canonical voice'],
]

const PROCESS_STEPS = [
  ['Prompt', 'One meme idea or viral signal enters the chamber.'],
  ['Action', 'VIVID creates the living character, voice, visuals, and launch copy.'],
  ['Proof', 'The soul hash can be anchored on BNB for auditability.'],
  ['Result', 'Creators export a Four.Meme-ready token identity with Telegram life.'],
]

const FALLBACK_MEMES = [
  {
    id: 'vivid-demo-pandaudit',
    name: 'Pandaudit',
    ticker: 'PANDY',
    tagline: 'Fortune cookies for suspicious contracts.',
    vibe: 'proof-ready',
    hasImages: true,
    postCount: 6,
    chatCount: 4,
  },
]

interface MemeSummary {
  id: string
  name: string
  ticker: string
  tagline: string
  vibe: string
  hasImages?: boolean
  postCount?: number
  chatCount?: number
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function StatusRow({
  label,
  value,
  active,
}: {
  label: string
  value: string
  active: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3 last:border-b-0">
      <span className="text-xs uppercase tracking-[0.18em] text-zinc-600">{label}</span>
      <span
        className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
          active
            ? 'border-[#f3ba2f]/20 bg-[#f3ba2f]/10 text-[#ffe29a]'
            : 'border-white/8 bg-white/[0.02] text-zinc-500'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [concept, setConcept] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [featured, setFeatured] = useState<MemeSummary[]>([])
  const [logLines, setLogLines] = useState<string[]>([])
  const [isTypingPrompt, setIsTypingPrompt] = useState(false)

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/session/all')
      .then(r => r.json())
      .then(d => setFeatured((d.memes || []).slice(0, 6)))
      .catch(() => {})

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }
  }, [])

  const typeSuggestion = (text: string) => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)

    setError(null)
    setIsTypingPrompt(true)
    setConcept('')

    let index = 0

    const tick = () => {
      index += 1
      setConcept(text.slice(0, index))

      if (index < text.length) {
        typingTimerRef.current = setTimeout(tick, 14)
      } else {
        setIsTypingPrompt(false)
      }
    }

    typingTimerRef.current = setTimeout(tick, 24)
  }

  const handleGenerate = async () => {
    if (!concept.trim() || isGenerating) return

    setIsGenerating(true)
    setError(null)
    setLogLines([`[${GENERATION_PHASES[0].at}] ${GENERATION_PHASES[0].label}...`])

    const startedAt = Date.now()
    let phaseIndex = 1

    const logInterval = setInterval(() => {
      if (phaseIndex >= GENERATION_PHASES.length) return
      const next = GENERATION_PHASES[phaseIndex]
      setLogLines(prev => [...prev, `[${next.at}] ${next.label}...`])
      phaseIndex += 1
    }, 340)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: concept.trim() }),
      })

      const data = await res.json()

      const elapsed = Date.now() - startedAt
      if (elapsed < 2400) {
        await sleep(2400 - elapsed)
      }

      if (!res.ok || data.error) {
        setError(data.error || 'Generation failed')
        return
      }

      const character = data.character as CharacterSpec
      router.push(`/meme/${character.id}`)
    } catch {
      const elapsed = Date.now() - startedAt
      if (elapsed < 2400) {
        await sleep(2400 - elapsed)
      }
      setError('Failed to connect to VIVID engine.')
    } finally {
      clearInterval(logInterval)
      setIsGenerating(false)
    }
  }

  const activePhaseIndex = useMemo(
    () => Math.min(Math.max(logLines.length - 1, 0), GENERATION_PHASES.length - 1),
    [logLines.length]
  )

  const displayedMemes = featured.length > 0 ? featured : FALLBACK_MEMES
  const soulPreviewActive = concept.trim().length > 0 || isGenerating

  return (
    <>
      {isGenerating && (
        <div className="incubation-screen">
          <div className="incubation-grid mx-auto max-w-7xl">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="status-pill">Incubation in progress</span>
                <div className="space-y-3">
                  <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">
                    VIVID is assembling a token identity, not a random asset pack.
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                    One prompt becomes one canonical soul. Every voice line, image, post, Telegram
                    reply, and Four.Meme export is forced to obey that core.
                  </p>
                </div>
              </div>

              <div className="terminal-panel">
                <div className="terminal-header">
                  <span>Life core log stream</span>
                  <span>phase {activePhaseIndex + 1}/{GENERATION_PHASES.length}</span>
                </div>
                <div className="terminal-body">
                  {logLines.map(line => {
                    const closing = line.indexOf(']')
                    const time = line.slice(1, closing)
                    const text = line.slice(closing + 2)
                    return (
                      <div key={line} className="terminal-line">
                        <time>{time}</time>
                        <span>{text}</span>
                      </div>
                    )
                  })}
                  <span className="terminal-cursor" />
                </div>
              </div>
            </div>

            <div className="card p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#f3ba2f]">Stability ladder</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Genome formation</h3>
                </div>
                <span className="rounded-full border border-[#f3ba2f]/14 bg-[#f3ba2f]/8 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#ffe29a]">
                  live
                </span>
              </div>

              <div className="incubation-phase-list">
                {GENERATION_PHASES.map((phase, index) => (
                  <div
                    key={phase.label}
                    className={`incubation-phase ${index === activePhaseIndex ? 'incubation-phase-active' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{phase.label}</p>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        {phase.at}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-6 text-zinc-500">{phase.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="landing-grid-bg space-y-10 pb-10">
        <section className="relative overflow-hidden rounded-[34px] border border-white/8 px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
          <div className="signal-ribbon" />
          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <div className="mx-auto mb-5 w-fit rounded-md border border-white/8 bg-white/[0.04] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400">
              &gt; vivid_engine: <span className="text-emerald-300">active</span>{' '}
              {'// bnb soul proof ready'}
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              Do not generate a meme.
              <span className="block text-[#f3ba2f]">Incubate a lifeform.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
              Built for Four.Meme creators who want every token to launch with identity, voice,
              lore, artwork, Telegram presence, and BNB-chain soul proof.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/demo" className="btn-primary btn-deploy text-center">
                Run Pandaudit demo
              </Link>
              <a href="#incubator" className="btn-secondary text-center">
                Create from scratch
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PROOF_BADGES.map(([label, value]) => (
                <div key={label} className="proof-badge">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {PROCESS_STEPS.map(([label, body], index) => (
            <div key={label} className="process-node">
              <div className="flex items-center justify-between gap-4">
                <span>[0{index + 1}]</span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#f3ba2f]/40 to-transparent" />
              </div>
              <h3>{label}</h3>
              <p>{body}</p>
            </div>
          ))}
        </section>

        <section id="incubator" className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_360px]">
          <div className="card glow-accent p-5 sm:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#f3ba2f]">Input chamber</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                  Describe the meme organism.
                </h2>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-600">
                {isTypingPrompt
                  ? 'typing sample'
                  : concept.length > 0
                    ? `${concept.length} chars`
                    : 'enter executes'}
              </p>
            </div>

            <textarea
              value={concept}
              onChange={e => setConcept(e.target.value)}
              disabled={isGenerating}
              placeholder=">>> Describe a meme-organism, paste a viral signal, or tune something internet weird..."
              rows={5}
              className="w-full resize-none rounded-[18px] border border-white/10 bg-[#07090f]/80 px-5 py-4 font-mono text-sm leading-7 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#f3ba2f]/45 disabled:opacity-80"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleGenerate()
                }
              }}
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-xs leading-6 text-zinc-500">
                VIVID locks one canonical genome first. Chat voice, social posts, visuals, Telegram,
                and Four.Meme export are all derived from that same spec.
              </p>
              <button
                onClick={handleGenerate}
                disabled={!concept.trim() || isGenerating}
                className="btn-primary self-start sm:self-auto"
              >
                {isGenerating ? 'Executing...' : 'Execute'}
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="mt-5 space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">Prompt presets</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map(example => (
                  <button
                    key={example}
                    onClick={() => typeSuggestion(example)}
                    className="suggestion-pill"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="soul-preview-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#f3ba2f]">Live soul preview</p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {soulPreviewActive ? 'Genome warming' : 'Dormant organism'}
                </h3>
              </div>
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                {isGenerating ? 'live' : 'standby'}
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-white/8 bg-black/25 p-4">
              <StatusRow label="Name" value={isGenerating ? 'forming' : 'pending'} active={soulPreviewActive} />
              <StatusRow label="Ticker" value={isGenerating ? 'binding' : 'pending'} active={isGenerating} />
              <StatusRow label="Voice" value={isGenerating ? 'locking' : 'pending'} active={isGenerating} />
              <StatusRow label="Visuals" value={isGenerating ? 'rendering' : 'pending'} active={isGenerating} />
              <StatusRow label="BNB proof" value={isGenerating ? 'hashing' : 'ready after birth'} active={isGenerating} />
              <StatusRow label="Four.Meme" value={isGenerating ? 'staging' : 'export after birth'} active={isGenerating} />
            </div>

            <div className="mt-5 rounded-2xl border border-[#f3ba2f]/12 bg-[#f3ba2f]/8 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#ffe29a]">
                Judge-safe route
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Skip API latency and open a pre-seeded organism with BNB proof, Telegram activation,
                chat, content, visuals, and export ready.
              </p>
              <Link href="/demo" className="btn-secondary mt-4 inline-flex text-xs">
                Open demo route
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">Living memes gallery</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                Proof of recent life
              </h2>
            </div>
            <Link href="/gallery" className="btn-secondary w-fit text-xs">
              Open full gallery
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {displayedMemes.slice(0, 3).map(meme => {
              const href = meme.id === 'vivid-demo-pandaudit' ? '/demo' : `/meme/${meme.id}`

              return (
                <Link key={meme.id} href={href} className="living-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3>{meme.name}</h3>
                      <p>${meme.ticker}</p>
                    </div>
                    <span>{meme.vibe}</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">{meme.tagline}</p>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div>
                      <strong>{meme.hasImages ? 'yes' : 'no'}</strong>
                      <span>visuals</span>
                    </div>
                    <div>
                      <strong>{meme.chatCount || 0}</strong>
                      <span>chats</span>
                    </div>
                    <div>
                      <strong>{meme.postCount || 0}</strong>
                      <span>posts</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}
