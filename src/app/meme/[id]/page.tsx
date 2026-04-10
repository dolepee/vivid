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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getPersonaFontClass(character: CharacterSpec) {
  const signal = [
    character.vibe,
    character.tone,
    character.speechPattern,
    character.originStory,
    character.name,
  ].join(' ').toLowerCase()

  if (/(ancient|oracle|myth|relic|philosopher|elder|monk|prophet)/.test(signal)) {
    return 'font-persona-serif'
  }

  if (/(machine|robot|toaster|terminal|protocol|paranoid|glitch|cyber|bot)/.test(signal)) {
    return 'font-persona-mono'
  }

  if (/(chaotic|degen|gremlin|wild|goblin|unhinged|feral)/.test(signal)) {
    return 'font-persona-chaotic'
  }

  return ''
}

function ErrorBanner({ message, onRetry, onDismiss }: { message: string; onRetry?: () => void; onDismiss: () => void }) {
  return (
    <div className="card flex items-center justify-between gap-3 border border-red-500/20 bg-red-500/5 p-3">
      <p className="flex-1 text-sm text-red-300">{message}</p>
      <div className="flex gap-2">
        {onRetry && (
          <button onClick={onRetry} className="rounded-lg bg-red-500/10 px-3 py-1 text-xs text-red-200 hover:bg-red-500/20">
            Retry
          </button>
        )}
        <button onClick={onDismiss} className="text-xs text-zinc-600 hover:text-zinc-400">dismiss</button>
      </div>
    </div>
  )
}

function PersonaAvatar({ character, imageUrl, compact = false }: { character: CharacterSpec; imageUrl?: string; compact?: boolean }) {
  const size = compact ? 'w-10 h-10' : 'w-18 h-18 sm:w-20 sm:h-20'
  const textSize = compact ? 'text-sm' : 'text-xl'

  return (
    <div className={`avatar-orb avatar-breathe ${size} rounded-[22px] bg-[radial-gradient(circle_at_30%_30%,rgba(36,241,197,0.9),rgba(0,212,170,0.45)_52%,rgba(4,36,31,0.9))] flex items-center justify-center text-[#02120e] font-semibold ${textSize}`}>
      {imageUrl ? (
        <img src={imageUrl} alt={`${character.name} avatar`} className="h-full w-full object-cover" />
      ) : (
        <span>{character.name.charAt(0)}</span>
      )}
    </div>
  )
}

function DeployModal({
  open,
  onClose,
  character,
  images,
  selectedImageIndex,
  onSelectImage,
  onCopyKit,
}: {
  open: boolean
  onClose: () => void
  character: CharacterSpec
  images: string[]
  selectedImageIndex: number
  onSelectImage: (index: number) => void
  onCopyKit: () => void
}) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const selectedImage = images[selectedImageIndex] || images[0]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel p-6 sm:p-8 space-y-6" onClick={event => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-[#00d4aa]">Hackathon export climax</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
              {character.name} is ready for Four.meme
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-zinc-400">
              Final check: identity locked, image selected, lore aligned. Ship the lifeform with a single decisive click.
            </p>
          </div>
          <button onClick={onClose} className="btn-secondary text-xs">Close</button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="card overflow-hidden p-3">
              {selectedImage ? (
                <img src={selectedImage} alt={`${character.name} selected`} className="aspect-square w-full rounded-[18px] object-cover" />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-[18px] bg-[radial-gradient(circle_at_30%_30%,rgba(36,241,197,0.25),rgba(0,212,170,0.08),transparent_70%)] text-6xl font-semibold text-[#00d4aa]">
                  {character.name.charAt(0)}
                </div>
              )}
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {images.map((url, index) => (
                  <button
                    key={url}
                    onClick={() => onSelectImage(index)}
                    className={`overflow-hidden rounded-2xl border-2 ${index === selectedImageIndex ? 'border-[#00d4aa] shadow-[0_0_30px_rgba(0,212,170,0.24)]' : 'border-transparent hover:border-white/10'}`}
                  >
                    <img src={url} alt={`Preview ${index + 1}`} className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">Token name</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{character.name}</h3>
                </div>
                <span className="rounded-full border border-[#00d4aa]/16 bg-[#00d4aa]/10 px-3 py-1 text-xs font-medium tracking-[0.18em] text-[#9bf4e0]">
                  ${character.ticker}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">Initial lore</p>
                <p className="text-sm leading-7 text-zinc-300">{character.originStory}</p>
              </div>
            </div>

            <div className="card p-5 space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">Launch posture</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600">Tagline</p>
                  <p className="mt-2 text-sm text-zinc-300">{character.tagline}</p>
                </div>
                <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-600">Voice signature</p>
                  <p className="mt-2 text-sm text-[#9bf4e0] italic">“{character.signatureLines[0]}”</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={onCopyKit} className="btn-secondary flex-1">Copy entire kit</button>
              <a
                href="https://four.meme/create"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary btn-deploy flex-1 text-center"
              >
                Deploy on Four.Meme
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MemePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<MemeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('character')
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [contentError, setContentError] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<string[]>([])

  const chatEndRef = useRef<HTMLDivElement>(null)
  const lastChatMsg = useRef<string>('')

  useEffect(() => {
    fetch(`/api/session?id=${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Session not found')
        return r.json()
      })
      .then(d => {
        if (d.error) {
          setLoading(false)
          return
        }
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.chatHistory, showTypingIndicator])

  useEffect(() => {
    setLoadedImages([])
    if (data?.images.length) {
      setSelectedImageIndex(current => Math.min(current, data.images.length - 1))
    } else {
      setSelectedImageIndex(0)
    }
  }, [data?.images.join('|')])

  const sendChat = async (retryMsg?: string) => {
    const msg = retryMsg || chatInput.trim()
    if (!msg || isSending || !data) return

    if (!retryMsg) setChatInput('')
    lastChatMsg.current = msg
    setChatError(null)

    if (!retryMsg) {
      setData(prev => prev ? {
        ...prev,
        chatHistory: [...prev.chatHistory, { role: 'user', content: msg }],
      } : prev)
    }

    setIsSending(true)
    setShowTypingIndicator(true)
    const typingStartedAt = Date.now()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memeId: id, message: msg }),
      })
      const body = await res.json()

      const elapsed = Date.now() - typingStartedAt
      if (elapsed < 1400) {
        await sleep(1400 - elapsed)
      }

      if (!res.ok) {
        setChatError(body.error || 'Chat failed')
        return
      }

      setData(prev => prev ? {
        ...prev,
        chatHistory: [...prev.chatHistory, { role: 'assistant', content: body.reply }],
      } : prev)
    } catch {
      const elapsed = Date.now() - typingStartedAt
      if (elapsed < 1400) {
        await sleep(1400 - elapsed)
      }
      setChatError('Network error. Check your connection.')
    } finally {
      setShowTypingIndicator(false)
      setIsSending(false)
    }
  }

  const generateImages = async () => {
    if (isGeneratingImages) return
    setIsGeneratingImages(true)
    setImageError(null)

    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memeId: id }),
      })
      const body = await res.json()
      if (!res.ok) {
        setImageError(body.error || 'Image generation failed')
        return
      }
      setData(prev => prev ? { ...prev, images: body.images } : prev)
    } catch {
      setImageError('Network error. Check your connection.')
    } finally {
      setIsGeneratingImages(false)
    }
  }

  const generateMoreContent = async () => {
    if (isGeneratingContent) return
    setIsGeneratingContent(true)
    setContentError(null)

    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memeId: id }),
      })
      const body = await res.json()

      if (!res.ok) {
        setContentError(body.error || 'Content generation failed')
        return
      }

      if (body.posts) {
        setData(prev => prev ? {
          ...prev,
          contentFeed: [...prev.contentFeed, ...body.posts],
        } : prev)
      }
    } catch {
      setContentError('Network error. Check your connection.')
    } finally {
      setIsGeneratingContent(false)
    }
  }

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const copyAllLaunch = () => {
    if (!data) return
    const { character } = data
    const all = [
      `Name: ${character.name}`,
      `Ticker: ${character.ticker}`,
      `\nDescription:\n${character.tagline}\n\n${character.originStory}\n\n${character.memeWorldview}`,
      `\nLaunch Post:\n${character.launchCopy}`,
    ].join('\n')
    copyText(all, 'all-launch')
  }

  if (loading) {
    return (
      <div className="card hero-surface flex min-h-[340px] items-center justify-center p-10">
        <div className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[#00d4aa]">Restoring organism</p>
          <h2 className="text-2xl font-semibold text-white">Waking the meme back up...</h2>
          <div className="mx-auto flex w-fit gap-2">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card p-12 text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.18em] text-zinc-600">No lifeform found</p>
        <h2 className="text-2xl font-semibold text-white">This meme is missing or expired.</h2>
        <a href="/" className="btn-primary inline-block">Create a new meme</a>
      </div>
    )
  }

  const { character } = data
  const personaFontClass = getPersonaFontClass(character)
  const avatarImage = data.images[selectedImageIndex] || data.images[0]

  const tabs: { key: Tab; label: string }[] = [
    { key: 'character', label: 'Identity' },
    { key: 'chat', label: 'Talk' },
    { key: 'images', label: 'Visuals' },
    { key: 'content', label: 'Feed' },
    { key: 'export', label: 'Launch' },
  ]

  return (
    <>
      <div className="space-y-7">
        <div className="card hero-surface flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <PersonaAvatar character={character} imageUrl={avatarImage} />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-white">{character.name}</h1>
                <span className="rounded-full border border-[#00d4aa]/14 bg-[#00d4aa]/8 px-3 py-1 text-xs font-medium tracking-[0.18em] text-[#9bf4e0]">
                  ${character.ticker}
                </span>
              </div>
              <p className="max-w-2xl text-sm sm:text-base text-zinc-400">{character.tagline}</p>
              <div className="status-pill">Character online</div>
            </div>
          </div>
          <div className="flex gap-2">
            <a href="/gallery" className="btn-secondary text-xs">Gallery</a>
            <a href="/" className="btn-secondary text-xs">New meme</a>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-white/5 pb-0">
          {tabs.map(tabItem => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`whitespace-nowrap rounded-t-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === tabItem.key
                  ? 'border-b-2 border-[#00d4aa] bg-white/[0.03] text-[#9bf4e0]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        <div className="min-h-[420px]">
          {tab === 'character' && (
            <div className="space-y-4">
              <div className="card glow-accent p-5 space-y-4">
                <h3 className="text-xs uppercase tracking-[0.18em] text-[#00d4aa]">Character consistency proof</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">Vibe</span>
                    <p className="mt-2 text-sm font-medium text-white">{character.vibe}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">Tone</span>
                    <p className="mt-2 text-sm font-medium text-white">{character.tone}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">Catchphrase</span>
                    <p className="mt-2 text-sm italic text-[#9bf4e0]">“{character.signatureLines[0]}”</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">Worldview</span>
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-300">{character.memeWorldview}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setTab('chat'); setChatInput('Tell me your origin story') }}
                  className="text-xs text-[#9bf4e0] hover:text-white"
                >
                  Ask this character about their origin story →
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="card p-5 space-y-3">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-600">Origin story</h3>
                  <p className="text-sm leading-7 text-zinc-300">{character.originStory}</p>
                </div>
                <div className="card p-5 space-y-3">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-600">Personality</h3>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <p><span className="text-zinc-500">Vibe:</span> {character.vibe}</p>
                    <p><span className="text-zinc-500">Tone:</span> {character.tone}</p>
                    <p><span className="text-zinc-500">Speech:</span> {character.speechPattern}</p>
                  </div>
                </div>
                <div className="card p-5 space-y-3">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-600">Recurring motifs</h3>
                  <div className="flex flex-wrap gap-2">
                    {character.recurringMotifs.map(motif => (
                      <span key={motif} className="rounded-full border border-[#00d4aa]/12 bg-[#00d4aa]/8 px-2.5 py-1 text-xs text-[#9bf4e0]">
                        {motif}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="card p-5 space-y-3">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-600">Never talks about</h3>
                  <div className="flex flex-wrap gap-2">
                    {character.tabooTopics.map(topic => (
                      <span key={topic} className="rounded-full border border-red-500/12 bg-red-500/8 px-2.5 py-1 text-xs text-red-200">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="card p-5 space-y-3 md:col-span-2">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-600">Visual style</h3>
                  <p className="text-sm leading-7 text-zinc-300">{character.visualStyle}</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'chat' && (
            <div className="space-y-3">
              {chatError && (
                <ErrorBanner
                  message={chatError}
                  onRetry={() => sendChat(lastChatMsg.current)}
                  onDismiss={() => setChatError(null)}
                />
              )}
              <div className="card p-4" style={{ height: '560px' }}>
                <div className="flex h-full flex-col">
                  <div className="mb-4 flex items-center gap-3 border-b border-white/5 pb-4">
                    <PersonaAvatar character={character} imageUrl={avatarImage} compact />
                    <div>
                      <p className="text-sm font-medium text-white">{character.name}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#00d4aa]">Responsive life signal</p>
                    </div>
                  </div>

                  <div className="mb-4 flex-1 space-y-3 overflow-y-auto pr-2">
                    {data.chatHistory.length === 0 && (
                      <div className="space-y-3 py-8 text-center">
                        <p className="text-sm text-zinc-500">
                          Speak first. VIVID will hold the character in persona before answering.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {['Tell me your origin story', 'What do you think about Bitcoin?', 'Give me your hottest take'].map(question => (
                            <button
                              key={question}
                              onClick={() => setChatInput(question)}
                              className="suggestion-pill"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.chatHistory.map((message, index) => (
                      <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                        {message.role === 'assistant' && (
                          <PersonaAvatar character={character} imageUrl={avatarImage} compact />
                        )}
                        <div className={`max-w-[80%] px-4 py-3 text-sm leading-7 ${
                          message.role === 'user'
                            ? 'bubble-user text-[#dffcf6]'
                            : `bubble-meme text-zinc-200 ${personaFontClass}`
                        }`}>
                          {message.content}
                        </div>
                      </div>
                    ))}

                    {showTypingIndicator && (
                      <div className="flex justify-start gap-3">
                        <PersonaAvatar character={character} imageUrl={avatarImage} compact />
                        <div className={`bubble-meme flex items-center gap-2 px-4 py-3 ${personaFontClass}`}>
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={event => setChatInput(event.target.value)}
                      onKeyDown={event => event.key === 'Enter' && sendChat()}
                      placeholder={`Talk to ${character.name}...`}
                      className="flex-1 rounded-[16px] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#00d4aa]/45"
                    />
                    <button onClick={() => sendChat()} disabled={isSending || !chatInput.trim()} className="btn-primary text-sm">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'images' && (
            <div className="space-y-4">
              {imageError && (
                <ErrorBanner
                  message={imageError}
                  onRetry={generateImages}
                  onDismiss={() => setImageError(null)}
                />
              )}

              {isGeneratingImages ? (
                <div className="space-y-4">
                  <div className="card p-5 space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#00d4aa]">Visual cortex online</p>
                    <p className="text-sm text-zinc-400">
                      Rendering three candidate surfaces for {character.name}. They will sharpen into focus as the organism stabilizes.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="image-shell" />
                    ))}
                  </div>
                </div>
              ) : data.images.length === 0 ? (
                <div className="card p-8 text-center space-y-4">
                  <p className="text-sm text-zinc-400">No visuals yet. Generate 3 meme images for {character.name}.</p>
                  <p className="text-xs text-zinc-600">Style anchor: {character.visualStyle}</p>
                  <button onClick={generateImages} className="btn-primary">
                    Generate images
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {data.images.map((url, index) => {
                      const loaded = loadedImages.includes(url)
                      return (
                        <div key={url} className="card group relative overflow-hidden">
                          <img
                            src={url}
                            alt={`${character.name} meme ${index + 1}`}
                            onLoad={() => setLoadedImages(prev => prev.includes(url) ? prev : [...prev, url])}
                            className={`image-focus aspect-square w-full object-cover ${loaded ? 'image-focus-loaded' : ''}`}
                          />
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            Open full size
                          </a>
                        </div>
                      )
                    })}
                  </div>
                  <div className="text-center">
                    <button onClick={generateImages} className="btn-secondary text-sm">
                      Regenerate images
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'content' && (
            <div className="space-y-3">
              {contentError && (
                <ErrorBanner
                  message={contentError}
                  onRetry={generateMoreContent}
                  onDismiss={() => setContentError(null)}
                />
              )}

              {data.contentFeed.length === 0 ? (
                <div className="card p-8 text-center space-y-4">
                  <p className="text-sm text-zinc-400">No content yet.</p>
                  <button onClick={generateMoreContent} disabled={isGeneratingContent} className="btn-primary">
                    {isGeneratingContent ? 'Growing content feed...' : 'Generate content'}
                  </button>
                </div>
              ) : (
                <>
                  {data.contentFeed.map((post, index) => (
                    <div key={`${post.type}-${index}`} className="card card-hover cursor-pointer p-4" onClick={() => copyText(post.content, `post-${index}`)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">{post.type}</span>
                          <p className="mt-2 text-sm leading-7 text-zinc-200">{post.content}</p>
                        </div>
                        <span className="whitespace-nowrap text-[10px] text-zinc-600">
                          {copied === `post-${index}` ? 'Copied!' : 'Click to copy'}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 text-center">
                    <button onClick={generateMoreContent} disabled={isGeneratingContent} className="btn-secondary text-sm">
                      {isGeneratingContent ? 'Generating more...' : 'Generate more posts'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'export' && (
            <div className="space-y-4">
              <div className="card glow-accent p-5 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#00d4aa]">Launch staging</p>
                    <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">Export this lifeform to Four.meme</h3>
                    <p className="max-w-2xl text-sm leading-6 text-zinc-400">
                      This export flow packages the meme’s token name, selected image, origin lore, and launch copy into one decisive final step.
                    </p>
                  </div>
                  <button onClick={() => setShowExportModal(true)} className="btn-primary btn-deploy">
                    Export to Four.meme
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
                  <div className="card p-4 space-y-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">Primary visual</p>
                    {avatarImage ? (
                      <img src={avatarImage} alt={`${character.name} preview`} className="aspect-square w-full rounded-[16px] object-cover" />
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center rounded-[16px] bg-[radial-gradient(circle_at_30%_30%,rgba(36,241,197,0.25),rgba(0,212,170,0.08),transparent_70%)] text-6xl font-semibold text-[#00d4aa]">
                        {character.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="card p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">Token</p>
                        <h4 className="mt-2 text-xl font-semibold text-white">{character.name}</h4>
                      </div>
                      <span className="rounded-full border border-[#00d4aa]/14 bg-[#00d4aa]/8 px-3 py-1 text-xs tracking-[0.18em] text-[#9bf4e0]">
                        ${character.ticker}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-zinc-500">Launch post</label>
                        <button onClick={() => copyText(character.launchCopy, 'Launch Post')} className="text-[10px] text-[#9bf4e0] hover:text-white">
                          {copied === 'Launch Post' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="rounded-[16px] border border-white/6 bg-black/25 px-4 py-3 text-sm leading-7 text-zinc-300">
                        {character.launchCopy}
                      </div>
                    </div>

                    <button onClick={copyAllLaunch} className="btn-secondary w-full">
                      {copied === 'all-launch' ? 'Copied all!' : 'Copy entire kit'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeployModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        character={character}
        images={data.images}
        selectedImageIndex={selectedImageIndex}
        onSelectImage={setSelectedImageIndex}
        onCopyKit={copyAllLaunch}
      />
    </>
  )
}
