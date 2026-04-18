'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CharacterSpec } from '@/lib/types'

const EXAMPLES = [
  'a sleep-deprived panda that audits meme coins with fortune cookies',
  'a paranoid toaster that thinks every launch is a rug pull',
  'a cat that gives terrible financial advice',
]

const GENERATION_PHASES = [
  { at: '0.1s', label: 'Parsing cultural signal', detail: 'The prompt is normalized into a launchable meme organism.' },
  { at: '0.8s', label: 'Compiling canonical identity', detail: 'Name, ticker, lore, worldview, voice, and taboos are bound together.' },
  { at: '1.4s', label: 'Encoding core genome', detail: 'Posts, replies, Telegram behavior, and visual prompts inherit one spec.' },
  { at: '2.2s', label: 'Preparing on-chain anchor', detail: 'A deterministic soul hash is prepared for BNB proof.' },
]

const PIPELINE_STEPS = [
  {
    id: '01',
    title: 'Signal enters prompt chamber',
    body: 'One concept, trend, or weird internet signal becomes the source material.',
    icon: 'signal',
  },
  {
    id: '02',
    title: 'VIVID assembles identity',
    body: 'The meme receives a name, ticker, lore, voice, worldview, and constraints.',
    icon: 'bust',
  },
  {
    id: '03',
    title: 'Visuals and vectors are declared',
    body: 'Images, launch copy, chat, Telegram, and posts derive from one genome.',
    icon: 'dna',
  },
  {
    id: '04',
    title: 'Soul-lock anchors on-chain',
    body: 'A deterministic hash proves the character package did not drift.',
    icon: 'lock',
  },
]

const FALLBACK_MEMES = [
  {
    id: 'vivid-demo-pandaudit',
    name: 'Pandaudit',
    ticker: 'PANDY',
    tagline: 'Fortune cookies for suspicious contracts.',
    vibe: 'Exhausted yet oddly zen',
    createdAt: '2026-04-17T00:00:00.000Z',
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
  createdAt?: string
  hasImages?: boolean
  postCount?: number
  chatCount?: number
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function shortHash(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = Math.imul(31, hash) + input.charCodeAt(i)
    hash |= 0
  }
  return `0x${Math.abs(hash).toString(16).padStart(8, '0')}${input.slice(0, 8).replace(/[^a-z0-9]/gi, '').padEnd(8, '0').toLowerCase()}...`
}

function statusFor(meme: MemeSummary) {
  const source = `${meme.vibe} ${meme.tagline}`.toLowerCase()

  if (source.includes('rug') || source.includes('audit') || source.includes('suspicious')) {
    return 'TYPE: RISK_SENTINEL'
  }

  if (source.includes('ancient') || source.includes('philosopher')) {
    return 'TYPE: ANCIENT_VECTOR'
  }

  if (source.includes('cat') || source.includes('degen')) {
    return 'TYPE: CHAOTIC_ENIGMA'
  }

  return 'TYPE: STABLE_VIVID'
}

function traitVector(meme: MemeSummary) {
  const traits = [
    meme.vibe?.split(' ').slice(0, 2).join('_') || 'canonical',
    meme.hasImages ? 'VISUAL.V' : 'VISUAL.0',
    (meme.postCount || 0) > 0 ? 'POST.ON' : 'POST.0',
  ]

  return traits.join(', ').toUpperCase()
}

function formatTimestamp(value?: string) {
  if (!value) return 'pending'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'pending'

  return new Intl.DateTimeFormat('en', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function Icon({ name }: { name: string }) {
  if (name === 'signal') return <SignalIcon />
  if (name === 'bust') return <BustIcon />
  if (name === 'dna') return <DnaIcon />
  return <LockIcon />
}

function SignalIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10 text-amber-500/70">
      <path
        d="M4 25h7l3-9 5 18 5-26 5 26 5-14 3 5h7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M8 34h32" stroke="currentColor" strokeLinecap="round" strokeOpacity=".28" />
    </svg>
  )
}

function BustIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10 text-amber-500/70">
      <path
        d="M29.5 10.5c4.1 1.8 6.8 5.6 6.8 10 0 5.8-4.8 10.7-11 10.7-1.7 0-3.3-.4-4.7-1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M21.5 13.4c-3.8 1.5-6.1 4.8-6.1 8.8 0 4.3 2.7 8 6.8 9.3V37l-8.2 3.5h20.5L26.4 37v-4.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M28 16.5l4 1.8-3.1 2.5 2.3 3.5" fill="none" stroke="currentColor" strokeOpacity=".34" />
    </svg>
  )
}

function DnaIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10 text-amber-500/70">
      <path
        d="M15 7c14 8 14 26 0 34M33 7c-14 8-14 26 0 34"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path d="M18 14h12M16 22h16M16 30h16M18 38h12" stroke="currentColor" strokeLinecap="round" strokeOpacity=".42" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10 text-amber-500/70">
      <rect
        x="12"
        y="21"
        width="24"
        height="18"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M17 21v-5.5C17 9.7 20.1 6 24 6s7 3.7 7 9.5V21"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path d="M24 28v5" stroke="currentColor" strokeLinecap="round" strokeOpacity=".5" />
    </svg>
  )
}

function BurstIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M12 2v4m0 12v4M2 12h4m12 0h4M4.9 4.9l2.8 2.8m8.6 8.6 2.8 2.8m0-14.2-2.8 2.8m-8.6 8.6-2.8 2.8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity=".25" />
    </svg>
  )
}

function HeroVisualization() {
  return (
    <div className="hero-data-viz" aria-hidden="true">
      <svg className="hero-wave hero-wave-a" viewBox="0 0 1440 360" preserveAspectRatio="none">
        <path d="M0 208C180 34 321 307 506 164S832 77 1032 189 1260 311 1440 106" />
        <path d="M0 232C177 65 311 320 493 190S828 112 1029 217 1264 330 1440 141" />
        <path d="M0 256C178 97 308 340 502 218S831 151 1034 243 1264 348 1440 176" />
      </svg>
      <svg className="hero-wave hero-wave-b" viewBox="0 0 1440 360" preserveAspectRatio="none">
        <path d="M0 160C180 252 305 30 515 141s320 213 525 83 257-207 400-78" />
        <path d="M0 184C184 281 311 63 512 172s320 201 524 104 260-191 404-93" />
      </svg>
      <div className="orbital-ring orbital-ring-a" />
      <div className="orbital-ring orbital-ring-b" />
      <div className="orbital-ring orbital-ring-c" />
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
      .then(d => setFeatured((d.memes || []).slice(0, 8)))
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
        typingTimerRef.current = setTimeout(tick, 12)
      } else {
        setIsTypingPrompt(false)
      }
    }

    typingTimerRef.current = setTimeout(tick, 20)
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

      if (elapsed < 1800) {
        await sleep(1800 - elapsed)
      }

      if (!res.ok || data.error) {
        setError(data.error || 'Generation failed')
        return
      }

      const character = data.character as CharacterSpec
      router.push(`/meme/${character.id}`)
    } catch {
      const elapsed = Date.now() - startedAt
      if (elapsed < 1800) {
        await sleep(1800 - elapsed)
      }
      setError('Failed to connect to VIVID engine.')
    } finally {
      clearInterval(logInterval)
      setIsGenerating(false)
    }
  }

  const displayedMemes = featured.length > 0 ? featured : FALLBACK_MEMES

  return (
    <>
      {isGenerating && (
        <div className="terminal-loader">
          <div className="terminal-loader-panel">
            <div className="terminal-loader-header">
              <span>&gt; VIVID_ENGINE: ACTIVE</span>
              <span>compiling organism</span>
            </div>
            <div className="terminal-loader-body">
              {logLines.map(line => {
                const closing = line.indexOf(']')
                const time = line.slice(1, closing)
                const text = line.slice(closing + 2)
                return (
                  <div key={line} className="terminal-loader-line">
                    <time>[{time}]</time>
                    <span>{text}</span>
                  </div>
                )
              })}
              <span className="terminal-loader-cursor" />
            </div>
          </div>
        </div>
      )}

      <div className="terminal-home space-y-12 pb-12">
        <section className="hero-terminal relative overflow-hidden border border-white/10 px-5 py-12 sm:px-10 sm:py-16 lg:px-12">
          <HeroVisualization />

          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <div className="mx-auto mb-5 w-fit rounded-sm border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400">
              &gt; VIVID_ENGINE: <span className="text-emerald-400">ACTIVE</span> {'//'} HASH_SEED: 0xFFE8...e06c
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-[-0.055em] text-zinc-100 sm:text-6xl lg:text-7xl">
              Don&apos;t generate a meme.
              <span className="block text-amber-500 drop-shadow-[0_0_18px_rgba(217,119,6,0.28)]">
                Incubate a lifeform.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
              VIVID turns one concept into a canonical meme organism: identity, lore, chat voice,
              visuals, Telegram behavior, Four.Meme launch copy, and BNB-chain soul proof.
            </p>
          </div>
        </section>

        <section className="pipeline-grid">
          {PIPELINE_STEPS.map((step, index) => (
            <div key={step.id} className="pipeline-wrap">
              <div className="pipeline-card">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-xs text-amber-500">[{step.id}]</span>
                  <Icon name={step.icon} />
                </div>
                <h2 className="mt-4 font-mono text-sm font-medium text-zinc-100">{step.title}</h2>
                <p className="mt-2 text-xs leading-6 text-zinc-400">{step.body}</p>
              </div>
              {index < PIPELINE_STEPS.length - 1 && <span className="pipeline-arrow">-&gt;</span>}
            </div>
          ))}
        </section>

        <section id="incubator" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="input-chamber">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-white/10 pb-3">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-500">Input chamber</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                {isTypingPrompt ? 'JetBrains Mono // typing' : 'JetBrains Mono // ready'}
              </p>
            </div>

            <textarea
              value={concept}
              onChange={e => setConcept(e.target.value)}
              disabled={isGenerating}
              placeholder=">>> Describe a meme-organism, paste a viral signal, or tune something internet weird..."
              rows={5}
              className="terminal-textarea"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleGenerate()
                }
              }}
            />

            <div className="mt-5 flex flex-col gap-4 border-t border-white/10 pt-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  Prompt snippets
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map(example => (
                    <button
                      key={example}
                      onClick={() => typeSuggestion(example)}
                      className="terminal-suggestion"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!concept.trim() || isGenerating}
                className="terminal-execute"
              >
                <span>{isGenerating ? 'EXECUTING' : 'EXECUTE'}</span>
                <BurstIcon />
              </button>
            </div>

            {error && (
              <div className="mt-4 border border-red-500/25 bg-red-500/5 p-4">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </div>

          <aside className="terminal-side-panel">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-500">Judge-safe route</p>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-zinc-100">Pandaudit is already alive.</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Use the seeded demo when recording: chat, visuals, posts, Telegram activation, export, and BNB proof are already staged.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-400">
              <div className="terminal-stat">BNB proof</div>
              <div className="terminal-stat">3 visuals</div>
              <div className="terminal-stat">Telegram</div>
              <div className="terminal-stat">Export kit</div>
            </div>
            <Link href="/demo" className="terminal-demo-link">
              [ OPEN DEMO ]
            </Link>
          </aside>
        </section>

        <section className="terminal-table-shell">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-500">Recently created</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-100">Lifeform data grid</h2>
            </div>
            <Link href="/gallery" className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400 hover:text-amber-500">
              [ OPEN FULL GALLERY ]
            </Link>
          </div>

          <div className="overflow-x-auto border border-white/10 bg-white/[0.02] backdrop-blur-md">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  <th className="px-4 py-3 font-medium">[ HASH ]</th>
                  <th className="px-4 py-3 font-medium">[ ENTITY_NAME ]</th>
                  <th className="px-4 py-3 font-medium">[ TRAIT_VECTOR ]</th>
                  <th className="px-4 py-3 font-medium">[ STATUS ]</th>
                  <th className="px-4 py-3 font-medium">[ TIMESTAMP ]</th>
                </tr>
              </thead>
              <tbody>
                {displayedMemes.map(meme => {
                  const href = meme.id === 'vivid-demo-pandaudit' ? '/demo' : `/meme/${meme.id}`

                  return (
                    <tr key={meme.id} className="border-b border-white/[0.06] hover:bg-white/[0.05]">
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                        <Link href={href}>{shortHash(meme.id)}</Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={href} className="block">
                          <span className="block text-sm font-medium text-zinc-100">{meme.name}</span>
                          <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.12em] text-amber-500">
                            ${meme.ticker}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{traitVector(meme)}</td>
                      <td className="px-4 py-3">
                        <span className="status-badge">{statusFor(meme)}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">{formatTimestamp(meme.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}
