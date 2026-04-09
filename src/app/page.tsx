'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CharacterSpec } from '@/lib/types'

const EXAMPLES = [
  'a cat that gives terrible financial advice',
  'a sentient bread loaf who believes carbs will save humanity',
  'an ancient frog philosopher who only speaks in trading metaphors',
  'a paranoid toaster that thinks everything is a rug pull',
  'a wholesome grandma who accidentally became a degen',
]

export default function Home() {
  const router = useRouter()
  const [concept, setConcept] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!concept.trim() || isGenerating) return

    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: concept.trim() }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Generation failed')
        return
      }

      const character = data.character as CharacterSpec
      router.push(`/meme/${character.id}`)
    } catch {
      setError('Failed to connect to server')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 pt-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-white">
          Every meme deserves a soul
        </h1>
        <p className="text-zinc-400 max-w-lg mx-auto text-lg">
          Type a concept. VIVID creates a complete meme character with personality,
          lore, visuals, and a living voice. Launch ready for Four.meme.
        </p>
      </div>

      {/* Input */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="card glow-purple p-6 space-y-4">
          <label className="text-sm font-medium text-zinc-300">
            What's your meme concept?
          </label>
          <textarea
            value={concept}
            onChange={e => setConcept(e.target.value)}
            placeholder="Describe a meme character, paste a trending topic, or just throw a weird idea..."
            rows={3}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleGenerate()
              }
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-600">
              {concept.length > 0 ? `${concept.length} chars` : 'Enter to generate'}
            </span>
            <button
              onClick={handleGenerate}
              disabled={!concept.trim() || isGenerating}
              className="btn-primary"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                'Give it a soul'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="card p-4 border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Examples */}
        <div className="space-y-2">
          <p className="text-xs text-zinc-600 text-center">Try one of these:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLES.map(ex => (
              <button
                key={ex}
                onClick={() => setConcept(ex)}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:border-purple-500/30 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Concept', desc: 'Type any idea or trending topic' },
            { step: '2', title: 'Character', desc: 'AI creates name, lore, personality, voice' },
            { step: '3', title: 'Visuals', desc: '3 consistent meme images generated' },
            { step: '4', title: 'Alive', desc: 'Chat with your meme. Export for Four.meme' },
          ].map(s => (
            <div key={s.step} className="card p-4 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center text-sm font-bold mx-auto">
                {s.step}
              </div>
              <p className="text-sm font-semibold text-white">{s.title}</p>
              <p className="text-xs text-zinc-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
