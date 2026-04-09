'use client'

import { useState, useEffect, useRef, use } from 'react'
import type { CharacterSpec, ChatMessage, ContentPost } from '@/lib/types'

interface MemeData {
  character: CharacterSpec
  chatHistory: ChatMessage[]
  images: string[]
  contentFeed: ContentPost[]
}

type Tab = 'character' | 'chat' | 'images' | 'content' | 'export'

export default function MemePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<MemeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('character')
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/session?id=${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.chatHistory])

  const sendChat = async () => {
    if (!chatInput.trim() || isSending || !data) return
    const msg = chatInput.trim()
    setChatInput('')

    setData(prev => prev ? {
      ...prev,
      chatHistory: [...prev.chatHistory, { role: 'user', content: msg }],
    } : prev)

    setIsSending(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memeId: id, message: msg }),
      })
      const { reply } = await res.json()
      setData(prev => prev ? {
        ...prev,
        chatHistory: [...prev.chatHistory, { role: 'assistant', content: reply }],
      } : prev)
    } catch {
      // Silent fail
    } finally {
      setIsSending(false)
    }
  }

  const generateImages = async () => {
    if (isGeneratingImages) return
    setIsGeneratingImages(true)
    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memeId: id }),
      })
      const { images } = await res.json()
      setData(prev => prev ? { ...prev, images } : prev)
    } catch {
      // Silent fail
    } finally {
      setIsGeneratingImages(false)
    }
  }

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400">Loading meme...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400">Meme not found. <a href="/" className="text-purple-400 underline">Create one</a></p>
      </div>
    )
  }

  const { character } = data

  const TABS: { key: Tab; label: string }[] = [
    { key: 'character', label: 'Identity' },
    { key: 'chat', label: 'Talk' },
    { key: 'images', label: 'Visuals' },
    { key: 'content', label: 'Feed' },
    { key: 'export', label: 'Launch' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{character.name}</h1>
          <p className="text-purple-400 font-mono text-sm">${character.ticker}</p>
          <p className="text-zinc-400 mt-1">{character.tagline}</p>
        </div>
        <a href="/" className="btn-secondary text-xs">New meme</a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5 pb-0">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t.key
                ? 'text-purple-400 bg-white/5 border-b-2 border-purple-500'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Identity Tab */}
        {tab === 'character' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5 space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-zinc-500">Origin Story</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">{character.originStory}</p>
            </div>
            <div className="card p-5 space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-zinc-500">Personality</h3>
              <div className="space-y-2">
                <div><span className="text-xs text-zinc-500">Vibe:</span> <span className="text-sm text-zinc-300">{character.vibe}</span></div>
                <div><span className="text-xs text-zinc-500">Tone:</span> <span className="text-sm text-zinc-300">{character.tone}</span></div>
                <div><span className="text-xs text-zinc-500">Speech:</span> <span className="text-sm text-zinc-300">{character.speechPattern}</span></div>
              </div>
            </div>
            <div className="card p-5 space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-zinc-500">Worldview</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">{character.memeWorldview}</p>
            </div>
            <div className="card p-5 space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-zinc-500">Signature Lines</h3>
              <div className="space-y-1">
                {character.signatureLines.map((line, i) => (
                  <p key={i} className="text-sm text-purple-300 italic">"{line}"</p>
                ))}
              </div>
            </div>
            <div className="card p-5 space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-zinc-500">Recurring Motifs</h3>
              <div className="flex flex-wrap gap-2">
                {character.recurringMotifs.map((m, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-300">{m}</span>
                ))}
              </div>
            </div>
            <div className="card p-5 space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-zinc-500">Never Talks About</h3>
              <div className="flex flex-wrap gap-2">
                {character.tabooTopics.map((t, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-300">{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {tab === 'chat' && (
          <div className="card p-4 flex flex-col" style={{ height: '500px' }}>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
              {data.chatHistory.length === 0 && (
                <p className="text-center text-zinc-600 text-sm py-8">
                  Say something to {character.name}. It'll respond in character.
                </p>
              )}
              {data.chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2 text-sm ${
                    msg.role === 'user' ? 'bubble-user text-purple-100' : 'bubble-meme text-zinc-200'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bubble-meme px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder={`Talk to ${character.name}...`}
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
              />
              <button onClick={sendChat} disabled={isSending || !chatInput.trim()} className="btn-primary text-sm">
                Send
              </button>
            </div>
          </div>
        )}

        {/* Images Tab */}
        {tab === 'images' && (
          <div className="space-y-4">
            {data.images.length === 0 ? (
              <div className="card p-8 text-center space-y-4">
                <p className="text-zinc-400 text-sm">No images yet. Generate 3 meme images for {character.name}.</p>
                <p className="text-xs text-zinc-600">Style: {character.visualStyle}</p>
                <button
                  onClick={generateImages}
                  disabled={isGeneratingImages}
                  className="btn-primary"
                >
                  {isGeneratingImages ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating images...
                    </span>
                  ) : (
                    'Generate images'
                  )}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {data.images.map((url, i) => (
                  <div key={i} className="card overflow-hidden">
                    <img src={url} alt={`${character.name} meme ${i + 1}`} className="w-full aspect-square object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Feed Tab */}
        {tab === 'content' && (
          <div className="space-y-3">
            {data.contentFeed.length === 0 ? (
              <p className="text-center text-zinc-600 text-sm py-8">No content generated yet.</p>
            ) : (
              data.contentFeed.map((post, i) => (
                <div key={i} className="card p-4 card-hover cursor-pointer" onClick={() => copyText(post.content, `post-${i}`)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-600">{post.type}</span>
                      <p className="text-sm text-zinc-200 mt-1">{post.content}</p>
                    </div>
                    <span className="text-[10px] text-zinc-600 whitespace-nowrap">
                      {copied === `post-${i}` ? 'Copied!' : 'Click to copy'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Export / Launch Tab */}
        {tab === 'export' && (
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Four.meme Launch Package</h3>
              <p className="text-xs text-zinc-500">Copy each field into Four.meme's create form.</p>

              {[
                { label: 'Name', value: character.name },
                { label: 'Ticker', value: character.ticker },
                { label: 'Description', value: `${character.tagline}\n\n${character.originStory}\n\n${character.memeWorldview}` },
                { label: 'Launch Post', value: character.launchCopy },
              ].map(field => (
                <div key={field.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-zinc-500">{field.label}</label>
                    <button
                      onClick={() => copyText(field.value, field.label)}
                      className="text-[10px] text-purple-400 hover:text-purple-300"
                    >
                      {copied === field.label ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-300 whitespace-pre-wrap">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Tokenomics Notes</h3>
              <p className="text-xs text-zinc-400">
                Suggested for {character.name} ({character.vibe} personality):
              </p>
              <div className="bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-300">
                <p>Total Supply: 1,000,000,000 ${character.ticker}</p>
                <p>Initial Liquidity: set via Four.meme defaults</p>
                <p>No pre-sale, no team allocation. Fair launch.</p>
              </div>
            </div>

            <a
              href="https://four.meme/create"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary block text-center"
            >
              Open Four.meme Create Page
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
