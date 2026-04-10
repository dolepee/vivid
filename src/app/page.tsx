'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CharacterSpec } from '@/lib/types'

const EXAMPLES = [
  'a cat that gives terrible financial advice',
  'a sentient bread loaf who believes carbs will save humanity',
  'an ancient frog philosopher who only speaks in trading metaphors',
  'a paranoid toaster that thinks everything is a rug pull',
  'a wholesome grandma who accidentally became a degen',
]

const GENERATION_LOGS = [
  { at: '0.1s', text: 'Initializing neural pathways...' },
  { at: '0.8s', text: 'Synthesizing lore matrix...' },
  { at: '1.4s', text: 'Rendering visual vectors...' },
  { at: '2.2s', text: 'Injecting personality...' },
  { at: '2.9s', text: 'Anchoring speech pattern...' },
  { at: '3.4s', text: 'Sealing launch kit...' },
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
      .then(d => setFeatured((d.memes || []).slice(0, 3)))
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
        typingTimerRef.current = setTimeout(tick, 18)
      } else {
        setIsTypingPrompt(false)
      }
    }

    typingTimerRef.current = setTimeout(tick, 32)
  }

  const handleGenerate = async () => {
    if (!concept.trim() || isGenerating) return

    setIsGenerating(true)
    setError(null)
    setLogLines([`[${GENERATION_LOGS[0].at}] ${GENERATION_LOGS[0].text}`])

    const startedAt = Date.now()
    let logIndex = 1

    const logInterval = setInterval(() => {
      if (logIndex >= GENERATION_LOGS.length) return
      const next = GENERATION_LOGS[logIndex]
      setLogLines(prev => [...prev, `[${next.at}] ${next.text}`])
      logIndex += 1
    }, 320)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: concept.trim() }),
      })

      const data = await res.json()

      const elapsed = Date.now() - startedAt
      if (elapsed < 2200) {
        await sleep(2200 - elapsed)
      }

      if (!res.ok || data.error) {
        setError(data.error || 'Generation failed')
        return
      }

      const character = data.character as CharacterSpec
      router.push(`/meme/${character.id}`)
    } catch {
      const elapsed = Date.now() - startedAt
      if (elapsed < 2200) {
        await sleep(2200 - elapsed)
      }
      setError('Failed to connect to server')
    } finally {
      clearInterval(logInterval)
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-14">
      <section className="hero-surface rounded-[30px] border border-white/8 px-6 py-10 sm:px-10 sm:py-14">
        <div className="relative z-10 max-w-3xl space-y-6">
          <span className="status-pill">AI-native meme foundry</span>
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-[-0.04em] text-white">
              Every meme deserves
              <span className="block text-[#00d4aa]">a breathing soul.</span>
            </h1>
            <p className="max-w-2xl text-base sm:text-lg leading-8 text-zinc-400">
              VIVID turns a single concept into a living launch artifact: identity, lore, visuals,
              voice, and a Four.meme-ready export flow that feels more like incubating a lifeform
              than filling a form.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto space-y-5">
        <div className="card glow-accent p-6 sm:p-8 space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#00d4aa]">Prompt chamber</p>
              <label className="text-sm font-medium text-zinc-200">
                What should VIVID bring to life?
              </label>
            </div>
            <p className="text-xs text-zinc-600">
              {isTypingPrompt ? 'Injecting suggestion into prompt field...' : concept.length > 0 ? `${concept.length} chars` : 'Enter to animate'}
            </p>
          </div>

          <textarea
            value={concept}
            onChange={e => setConcept(e.target.value)}
            disabled={isGenerating}
            placeholder="Describe a meme organism, paste a viral signal, or throw VIVID a weird internet idea..."
            rows={4}
            className="w-full rounded-[18px] border border-white/10 bg-black/35 px-5 py-4 text-white placeholder-zinc-600 outline-none transition-colors focus:border-[#00d4aa]/45 disabled:opacity-80 resize-none"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleGenerate()
              }
            }}
          />

          {isGenerating ? (
            <div className="terminal-panel">
              <div className="terminal-header">
                <span>Generation theater</span>
                <span>VIVID core online</span>
              </div>
              <div className="terminal-body">
                {logLines.map(line => {
                  const time = line.slice(1, 5)
                  const text = line.slice(7)
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
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm text-zinc-500">
                VIVID will generate a canonical character spec first, then derive every downstream
                output from that same identity so the meme feels internally alive.
              </p>
              <button
                onClick={handleGenerate}
                disabled={!concept.trim()}
                className="btn-primary self-start sm:self-auto"
              >
                Give it a soul
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="card border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-xs text-center uppercase tracking-[0.18em] text-zinc-600">Try one of these</p>
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
        <section className="max-w-5xl mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">Proof of recent life</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Recently created</h2>
            </div>
            <a href="/gallery" className="btn-secondary text-xs">Open gallery</a>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {featured.map(meme => (
              <a
                key={meme.id}
                href={`/meme/${meme.id}`}
                className="card card-hover block space-y-3 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white">{meme.name}</h3>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#00d4aa]">${meme.ticker}</p>
                  </div>
                  <span className="rounded-full border border-[#00d4aa]/14 bg-[#00d4aa]/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#9bf4e0]">
                    {meme.vibe}
                  </span>
                </div>
                <p className="text-sm leading-6 text-zinc-400">{meme.tagline}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[
            { step: '01', title: 'Signal', desc: 'Feed VIVID a prompt, a mood, or a cultural flashpoint.' },
            { step: '02', title: 'Genome', desc: 'One canonical character spec defines the whole organism.' },
            { step: '03', title: 'Surface', desc: 'Visuals, chat voice, and content emerge from the same core.' },
            { step: '04', title: 'Deploy', desc: 'Export the final lifeform into Four.meme with conviction.' },
          ].map(item => (
            <div key={item.step} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-600">{item.step}</span>
                <span className="h-2 w-2 rounded-full bg-[#00d4aa] shadow-[0_0_18px_rgba(0,212,170,0.8)]" />
              </div>
              <h3 className="text-base font-semibold text-white">{item.title}</h3>
              <p className="text-sm leading-6 text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
