'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CharacterSpec } from '@/lib/types'

const EXAMPLES = [
  'a cat that gives terrible financial advice',
  'a sentient bread loaf who believes carbs will save humanity',
  'an ancient frog philosopher who only speaks in trading metaphors',
  'a paranoid toaster that thinks everything is a rug pull',
  'a wholesome grandma who accidentally became a degen',
]

const GENERATION_PHASES = [
  { at: '0.1s', label: 'Initializing neural pathways', detail: 'Allocating cognitive surface and binding prompt intent.' },
  { at: '0.8s', label: 'Synthesizing lore matrix', detail: 'Building a canonical origin story and worldview spine.' },
  { at: '1.4s', label: 'Rendering visual vectors', detail: 'Projecting surfaces, symbols, and tonal artifacts.' },
  { at: '2.2s', label: 'Injecting personality', detail: 'Locking vibe, tone, and signature speech pattern.' },
  { at: '2.9s', label: 'Anchoring speech pattern', detail: 'Testing consistency against the character genome.' },
  { at: '3.4s', label: 'Sealing launch kit', detail: 'Preparing identity for chat, visuals, and Four.meme export.' },
]

interface MemeSummary {
  id: string
  name: string
  ticker: string
  tagline: string
  vibe: string
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
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
      .then(d => setFeatured((d.memes || []).slice(0, 4)))
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
        typingTimerRef.current = setTimeout(tick, 16)
      } else {
        setIsTypingPrompt(false)
      }
    }

    typingTimerRef.current = setTimeout(tick, 28)
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
    }, 360)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: concept.trim() }),
      })

      const data = await res.json()

      const elapsed = Date.now() - startedAt
      if (elapsed < 2600) {
        await sleep(2600 - elapsed)
      }

      if (!res.ok || data.error) {
        setError(data.error || 'Generation failed')
        return
      }

      const character = data.character as CharacterSpec
      router.push(`/meme/${character.id}`)
    } catch {
      const elapsed = Date.now() - startedAt
      if (elapsed < 2600) {
        await sleep(2600 - elapsed)
      }
      setError('Failed to connect to server')
    } finally {
      clearInterval(logInterval)
      setIsGenerating(false)
    }
  }

  const activePhaseIndex = useMemo(
    () => Math.min(Math.max(logLines.length - 1, 0), GENERATION_PHASES.length - 1),
    [logLines.length]
  )

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
                    VIVID is assembling a living meme from a single signal.
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                    The interface should feel like a birth event, not a form submit. This overlay
                    stays in control until the organism is stable enough to wake up.
                  </p>
                </div>
              </div>

              <div className="card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#f3ba2f]">Incoming concept</p>
                    <p className="mt-3 text-sm leading-7 text-zinc-200 sm:text-base">“{concept.trim()}”</p>
                  </div>
                  <div className="rounded-full border border-[#f3ba2f]/14 bg-[#f3ba2f]/8 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#ffe29a]">
                    phase {activePhaseIndex + 1}/{GENERATION_PHASES.length}
                  </div>
                </div>
              </div>

              <div className="terminal-panel">
                <div className="terminal-header">
                  <span>Life core log stream</span>
                  <span>do not interrupt incubation</span>
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

            <div className="space-y-8">
              <div className="incubation-orb">
                <div className="incubation-core" />
              </div>

              <div className="card p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#f3ba2f]">Stability ladder</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Character genome formation</h3>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-600">
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
        </div>
      )}

      <div className="space-y-14">
        <section className="hero-surface overflow-hidden rounded-[30px] border border-white/8 px-6 py-10 sm:px-10 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="status-pill">AI-native meme foundry</span>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
                  Don’t generate a meme.
                  <span className="block text-[#f3ba2f]">Incubate a lifeform.</span>
                </h1>
                <p className="max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                  VIVID takes one concept and hardens it into a single canonical character spec,
                  then derives chat voice, images, launch copy, and Four.meme export from that same
                  living core.
                </p>
              </div>
            </div>

            <div className="card relative overflow-hidden p-5 sm:p-6">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#f3ba2f]/50 to-transparent" />
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#f3ba2f]">Core loop</p>
                  <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    breathing
                  </span>
                </div>
                <div className="grid gap-3">
                  {[
                    'Signal enters the prompt chamber',
                    'VIVID assembles a canonical identity',
                    'Visuals and voice are derived from one genome',
                    'Launch package exits ready for Four.meme',
                  ].map((item, index) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                      <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#f3ba2f]/14 bg-[#f3ba2f]/10 text-[11px] font-medium text-[#ffe29a]">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-6 text-zinc-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl space-y-5">
          <div className="card glow-accent p-6 sm:p-8 space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#f3ba2f]">Prompt chamber</p>
                <label className="text-sm font-medium text-zinc-200">
                  What should VIVID bring to life?
                </label>
              </div>
              <p className="text-xs text-zinc-600">
                {isTypingPrompt
                  ? 'Injecting suggestion into prompt field...'
                  : concept.length > 0
                    ? `${concept.length} chars`
                    : 'Press Enter to begin incubation'}
              </p>
            </div>

            <textarea
              value={concept}
              onChange={e => setConcept(e.target.value)}
              disabled={isGenerating}
              placeholder="Describe a meme organism, paste a viral signal, or hand VIVID something internet-weird..."
              rows={4}
              className="w-full resize-none rounded-[18px] border border-white/10 bg-black/35 px-5 py-4 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#f3ba2f]/45 disabled:opacity-80"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleGenerate()
                }
              }}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm text-zinc-500">
                VIVID does not improvise each artifact separately. It locks a single character
                genome first, then everything downstream has to obey it.
              </p>
              <button
                onClick={handleGenerate}
                disabled={!concept.trim() || isGenerating}
                className="btn-primary self-start sm:self-auto"
              >
                {isGenerating ? 'Incubating...' : 'Give it a soul'}
              </button>
            </div>
          </div>

          {error && (
            <div className="card border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-center text-xs uppercase tracking-[0.18em] text-zinc-600">
              Try one of these
            </p>
            <div className="suggestion-ticker">
              <div className="suggestion-track">
                {[...EXAMPLES, ...EXAMPLES].map((example, index) => (
                  <button
                    key={`${example}-${index}`}
                    onClick={() => typeSuggestion(example)}
                    className="suggestion-pill"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {featured.length > 0 && (
          <section className="mx-auto max-w-5xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">Proof of recent life</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                  Recently created
                </h2>
              </div>
              <a href="/gallery" className="btn-secondary text-xs">Open gallery</a>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {featured.map(meme => (
                <a
                  key={meme.id}
                  href={`/meme/${meme.id}`}
                  className="card card-hover block space-y-3 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-white">{meme.name}</h3>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#f3ba2f]">
                        ${meme.ticker}
                      </p>
                    </div>
                    <span className="rounded-full border border-[#f3ba2f]/14 bg-[#f3ba2f]/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#ffe29a]">
                      {meme.vibe}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-zinc-400">{meme.tagline}</p>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
