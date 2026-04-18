'use client'

import Link from 'next/link'
import { type SyntheticEvent, use, useEffect, useRef, useState } from 'react'
import { encodeFunctionData } from 'viem'
import {
  BNB_TESTNET_PARAMS,
  BNB_TESTNET_EXPLORER,
  TELEGRAM_BOT_USERNAME,
  VIVID_DEMO_SOUL_TX_HASH,
  VIVID_SOUL_REGISTRY_ADDRESS,
} from '@/lib/chain'
import { buildSoulPayload, hashSoulPayload, telegramStartParam } from '@/lib/soul'
import { VIVID_SOUL_REGISTRY_ABI } from '@/lib/soul-registry'
import type { CharacterSpec, ChatMessage, ContentPost } from '@/lib/types'

interface MemeData {
  character: CharacterSpec
  chatHistory: ChatMessage[]
  images: string[]
  contentFeed: ContentPost[]
}

type AvatarState = 'idle' | 'thinking' | 'rendering' | 'launch'

const FOUR_MEME_CREATE_URL = 'https://four.meme/en/create-token'

interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function withImageRetryParam(src: string, retry: number) {
  try {
    const url = new URL(src)
    url.searchParams.set('vividRetry', `${Date.now()}-${retry}`)
    return url.toString()
  } catch {
    const separator = src.includes('?') ? '&' : '?'
    return `${src}${separator}vividRetry=${Date.now()}-${retry}`
  }
}

function retryImageLoad(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget
  const retryCount = Number(image.dataset.retryCount || '0')

  if (retryCount >= 3) {
    image.dataset.failed = 'true'
    return
  }

  const nextRetry = retryCount + 1
  image.dataset.retryCount = String(nextRetry)

  window.setTimeout(() => {
    image.src = withImageRetryParam(image.src, nextRetry)
  }, 450 * nextRetry)
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

function ErrorBanner({
  message,
  onRetry,
  onDismiss,
}: {
  message: string
  onRetry?: () => void
  onDismiss: () => void
}) {
  return (
    <div className="card flex items-center justify-between gap-3 border border-red-500/20 bg-red-500/5 p-3">
      <p className="flex-1 text-sm text-red-300">{message}</p>
      <div className="flex gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-lg bg-red-500/10 px-3 py-1 text-xs text-red-200 hover:bg-red-500/20"
          >
            Retry
          </button>
        )}
        <button onClick={onDismiss} className="text-xs text-zinc-600 hover:text-zinc-400">
          dismiss
        </button>
      </div>
    </div>
  )
}

function PersonaAvatar({
  character,
  imageUrl,
  compact = false,
  state = 'idle',
}: {
  character: CharacterSpec
  imageUrl?: string
  compact?: boolean
  state?: AvatarState
}) {
  const size = compact ? 'h-11 w-11 rounded-[16px]' : 'h-20 w-20 rounded-[24px] sm:h-24 sm:w-24'
  const textSize = compact ? 'text-sm' : 'text-2xl'
  const stateClass = {
    idle: 'avatar-state-idle',
    thinking: 'avatar-state-thinking',
    rendering: 'avatar-state-rendering',
    launch: 'avatar-state-launch',
  }[state]

  return (
    <div
      className={`avatar-orb avatar-breathe ${stateClass} ${size} flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_30%,rgba(255,241,199,0.92),rgba(255,215,106,0.58)_52%,rgba(43,24,6,0.92))] font-semibold text-[#241703] ${textSize}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${character.name} avatar`}
          className="h-full w-full object-cover"
          decoding="async"
          onError={retryImageLoad}
        />
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
            <p className="text-xs uppercase tracking-[0.18em] text-[#f3ba2f]">Hackathon export climax</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              {character.name} is ready for Four.meme
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-zinc-400">
              Final check: identity locked, image selected, lore aligned. This is the last human
              gate before deployment.
            </p>
          </div>
          <button onClick={onClose} className="btn-secondary text-xs">
            Close
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="card overflow-hidden p-3">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={`${character.name} selected`}
                  className="aspect-square w-full rounded-[18px] object-cover"
                  decoding="async"
                  onError={retryImageLoad}
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-[18px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,215,106,0.25),rgba(243,186,47,0.08),transparent_70%)] text-6xl font-semibold text-[#f3ba2f]">
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
                    className={`overflow-hidden rounded-2xl border-2 ${
                      index === selectedImageIndex
                        ? 'border-[#f3ba2f] shadow-[0_0_30px_rgba(243,186,47,0.24)]'
                        : 'border-transparent hover:border-white/10'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="aspect-square w-full object-cover"
                      loading="eager"
                      decoding="async"
                      onError={retryImageLoad}
                    />
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
                <span className="rounded-full border border-[#f3ba2f]/16 bg-[#f3ba2f]/10 px-3 py-1 text-xs font-medium tracking-[0.18em] text-[#ffe29a]">
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
                  <p className="mt-2 text-sm italic text-[#ffe29a]">“{character.signatureLines[0]}”</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={onCopyKit} className="btn-secondary flex-1">
                Copy entire kit
              </button>
              <a
                href={FOUR_MEME_CREATE_URL}
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
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const [streamingReply, setStreamingReply] = useState<string | null>(null)
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [contentError, setContentError] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<string[]>([])
  const [origin, setOrigin] = useState('')
  const [isAnchoringSoul, setIsAnchoringSoul] = useState(false)
  const [anchorTxHash, setAnchorTxHash] = useState<`0x${string}` | null>(null)
  const [anchorError, setAnchorError] = useState<string | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const lastChatMsg = useRef<string>('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

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
  }, [data?.chatHistory, showTypingIndicator, streamingReply])

  useEffect(() => {
    if (!data?.images.length) {
      setLoadedImages([])
      setSelectedImageIndex(0)
      return
    }

    let cancelled = false
    setLoadedImages(prev => prev.filter(url => data.images.includes(url)))
    setSelectedImageIndex(current => Math.min(current, data.images.length - 1))

    data.images.forEach(url => {
      const preload = (src: string, attempt = 0) => {
        const image = new window.Image()
        image.decoding = 'async'
        image.onload = () => {
          if (cancelled) return
          setLoadedImages(prev => (prev.includes(url) ? prev : [...prev, url]))
        }
        image.onerror = () => {
          if (cancelled || attempt >= 3) return
          window.setTimeout(() => {
            preload(withImageRetryParam(url, attempt + 1), attempt + 1)
          }, 450 * (attempt + 1))
        }
        image.src = src
      }

      preload(url)
    })

    return () => {
      cancelled = true
    }
  }, [data?.images])

  const streamAssistantReply = async (reply: string) => {
    const parts = reply.split(/(\s+)/).filter(part => part.length > 0)
    const delay = Math.max(18, Math.min(60, Math.floor(1100 / Math.max(parts.length, 1))))
    let built = ''

    setStreamingReply('')

    for (const part of parts) {
      built += part
      setStreamingReply(built)
      await sleep(delay)
    }

    setData(prev =>
      prev
        ? {
            ...prev,
            chatHistory: [...prev.chatHistory, { role: 'assistant', content: reply }],
          }
        : prev
    )
    setStreamingReply(null)
  }

  const sendChat = async (retryMsg?: string) => {
    const msg = retryMsg || chatInput.trim()
    if (!msg || isSending || !data) return

    if (!retryMsg) setChatInput('')
    lastChatMsg.current = msg
    setChatError(null)

    if (!retryMsg) {
      setData(prev =>
        prev
          ? {
              ...prev,
              chatHistory: [...prev.chatHistory, { role: 'user', content: msg }],
            }
          : prev
      )
    }

    setIsSending(true)
    setShowTypingIndicator(true)
    setStreamingReply(null)
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

      setShowTypingIndicator(false)
      await streamAssistantReply(body.reply)
    } catch {
      const elapsed = Date.now() - typingStartedAt
      if (elapsed < 1400) {
        await sleep(1400 - elapsed)
      }
      setChatError('Network error. Check your connection.')
      setStreamingReply(null)
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
      setData(prev => (prev ? { ...prev, images: body.images } : prev))
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
        setData(prev =>
          prev
            ? {
                ...prev,
                contentFeed: [...prev.contentFeed, ...body.posts],
              }
            : prev
        )
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

  const switchToBnbTestnet = async () => {
    if (!window.ethereum) throw new Error('Wallet not found')

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BNB_TESTNET_PARAMS.chainId }],
      })
    } catch (error) {
      const maybeCode = error && typeof error === 'object' && 'code' in error
        ? (error as { code?: number }).code
        : undefined

      if (maybeCode !== 4902) throw error

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [BNB_TESTNET_PARAMS],
      })
    }
  }

  const anchorSoul = async () => {
    if (!data) return

    if (!VIVID_SOUL_REGISTRY_ADDRESS) {
      setAnchorError('Soul registry contract is not configured yet. Deploy it and set NEXT_PUBLIC_VIVID_SOUL_REGISTRY_ADDRESS.')
      return
    }

    if (!window.ethereum) {
      setAnchorError('Connect an EVM wallet to anchor this soul on BNB testnet.')
      return
    }

    setAnchorError(null)
    setIsAnchoringSoul(true)

    try {
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[]

      if (!accounts?.[0]) {
        setAnchorError('No wallet account returned.')
        return
      }

      await switchToBnbTestnet()

      const metadataURI = `${origin || window.location.origin}/api/soul/metadata?id=${data.character.id}`
      const soulHash = hashSoulPayload(
        buildSoulPayload(data.character, data.images, data.contentFeed)
      )
      const txData = encodeFunctionData({
        abi: VIVID_SOUL_REGISTRY_ABI,
        functionName: 'anchorSoul',
        args: [
          data.character.id,
          data.character.name,
          data.character.ticker,
          metadataURI,
          soulHash,
        ],
      })

      const txHash = (await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: accounts[0],
            to: VIVID_SOUL_REGISTRY_ADDRESS,
            data: txData,
          },
        ],
      })) as `0x${string}`

      setAnchorTxHash(txHash)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Soul anchoring failed.'
      setAnchorError(message)
    } finally {
      setIsAnchoringSoul(false)
    }
  }

  if (loading) {
    return (
      <div className="card hero-surface flex min-h-[340px] items-center justify-center p-10">
        <div className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[#f3ba2f]">Restoring organism</p>
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
        <Link href="/" className="btn-primary inline-block">
          Create a new meme
        </Link>
      </div>
    )
  }

  const { character } = data
  const personaFontClass = getPersonaFontClass(character)
  const avatarImage = data.images[selectedImageIndex] || data.images[0]
  const soulPayload = buildSoulPayload(character, data.images, data.contentFeed)
  const soulHash = hashSoulPayload(soulPayload)
  const metadataUrl = `${origin || ''}/api/soul/metadata?id=${character.id}`
  const telegramLink = TELEGRAM_BOT_USERNAME
    ? `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${telegramStartParam(character.id)}`
    : null
  const proofTxHash = anchorTxHash || (
    character.id === 'vivid-demo-pandaudit' ? VIVID_DEMO_SOUL_TX_HASH || null : null
  )
  const avatarState: AvatarState = showExportModal
    ? 'launch'
    : isGeneratingImages || isGeneratingContent
      ? 'rendering'
      : isSending || showTypingIndicator || Boolean(streamingReply)
        ? 'thinking'
        : 'idle'

  const vitality = Math.min(
    100,
    34 +
      (data.chatHistory.length > 0 ? 18 : 0) +
      (data.images.length > 0 ? 22 : 0) +
      (data.contentFeed.length > 0 ? 16 : 0) +
      Math.min(data.chatHistory.length * 2, 6) +
      Math.min(data.images.length * 2, 6) +
      Math.min(data.contentFeed.length * 2, 8)
  )

  const createdAtLabel = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(character.createdAt))

  const sectionLinks = [
    { href: '#identity', label: 'Identity', value: 'Genome locked' },
    { href: '#proof', label: 'Proof', value: proofTxHash ? 'BNB anchored' : 'Hash ready' },
    { href: '#chat', label: 'Talk', value: `${data.chatHistory.length} msgs` },
    { href: '#visuals', label: 'Visuals', value: `${data.images.length}/3 frames` },
    { href: '#feed', label: 'Feed', value: `${data.contentFeed.length} outputs` },
    { href: '#launch', label: 'Launch', value: 'Export ready' },
  ]

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="life-core-panel space-y-4">
          <div className="card hero-surface p-5 sm:p-6">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <PersonaAvatar character={character} imageUrl={avatarImage} state={avatarState} />
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                      {character.name}
                    </h1>
                    <span className="rounded-full border border-[#f3ba2f]/14 bg-[#f3ba2f]/8 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#ffe29a]">
                      ${character.ticker}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-zinc-400">{character.tagline}</p>
                  <span className="status-pill">
                    {avatarState === 'launch'
                      ? 'Launch staging'
                      : avatarState === 'rendering'
                        ? 'Rendering surfaces'
                        : avatarState === 'thinking'
                          ? 'Thinking in character'
                          : 'Stable life signal'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">Vitality</p>
                  <span className="text-sm font-medium text-white">{vitality}%</span>
                </div>
                <div className="life-meter">
                  <div className="life-meter-fill" style={{ width: `${vitality}%` }} />
                </div>
                <p className="text-xs leading-6 text-zinc-500">
                  Identity, voice, visuals, and launch surface are tied to one canonical character
                  spec. That consistency is the moat.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">Created</p>
                  <p className="mt-2 text-sm text-white">{createdAtLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">Vibe</p>
                  <p className="mt-2 text-sm text-white">{character.vibe}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[#f3ba2f]">Life core map</p>
            <div className="space-y-2">
              {sectionLinks.map(link => (
                <a key={link.href} href={link.href} className="life-nav-link">
                  <span>{link.label}</span>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    {link.value}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="card p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">Actions</p>
            <div className="grid gap-2">
              <button onClick={() => setShowExportModal(true)} className="btn-primary btn-deploy w-full">
                Export to Four.meme
              </button>
              <button onClick={copyAllLaunch} className="btn-secondary w-full">
                {copied === 'all-launch' ? 'Copied entire kit' : 'Copy entire kit'}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/gallery" className="btn-secondary text-center text-xs">
                  Gallery
                </Link>
                <Link href="/" className="btn-secondary text-center text-xs">
                  New meme
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <section id="identity" className="section-shell">
            <div className="card p-5 sm:p-6 space-y-5">
              <div className="section-heading">
                <div>
                  <p>Identity</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                    Canonical genome
                  </h2>
                </div>
                <button
                  onClick={() => setChatInput('Tell me your origin story')}
                  className="btn-secondary text-xs"
                >
                  prime chat with origin prompt
                </button>
              </div>

              <div className="card glow-accent p-5 space-y-4">
                <h3 className="text-xs uppercase tracking-[0.18em] text-[#f3ba2f]">
                  Character consistency proof
                </h3>
                <div className="grid gap-3 sm:grid-cols-4">
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
                    <p className="mt-2 text-sm italic text-[#ffe29a]">“{character.signatureLines[0]}”</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">Speech mode</span>
                    <p className="mt-2 text-sm text-zinc-300">{character.speechPattern}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="card p-5 space-y-3">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-600">Origin story</h3>
                  <p className="text-sm leading-7 text-zinc-300">{character.originStory}</p>
                </div>
                <div className="card p-5 space-y-3">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-600">Worldview</h3>
                  <p className="text-sm leading-7 text-zinc-300">{character.memeWorldview}</p>
                </div>
                <div className="card p-5 space-y-3">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-600">Recurring motifs</h3>
                  <div className="flex flex-wrap gap-2">
                    {character.recurringMotifs.map(motif => (
                      <span
                        key={motif}
                        className="rounded-full border border-[#f3ba2f]/12 bg-[#f3ba2f]/8 px-2.5 py-1 text-xs text-[#ffe29a]"
                      >
                        {motif}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="card p-5 space-y-3">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-600">Taboo topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {character.tabooTopics.map(topic => (
                      <span
                        key={topic}
                        className="rounded-full border border-red-500/12 bg-red-500/8 px-2.5 py-1 text-xs text-red-200"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="card p-5 space-y-3 md:col-span-2">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-600">Visual style anchor</h3>
                  <p className="text-sm leading-7 text-zinc-300">{character.visualStyle}</p>
                </div>
              </div>
            </div>
          </section>

          <section id="proof" className="section-shell">
            <div className="card glow-accent p-5 sm:p-6 space-y-5">
              <div className="section-heading">
                <div>
                  <p>System action</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                    Anchor the soul, activate the meme
                  </h2>
                </div>
                <span className="rounded-full border border-[#f3ba2f]/14 bg-[#f3ba2f]/8 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#ffe29a]">
                  BNB proof loop
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="card p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
                        Deterministic soul hash
                      </p>
                      <p className="mt-2 break-all font-mono text-xs leading-6 text-[#ffe29a]">
                        {soulHash}
                      </p>
                    </div>
                    <button onClick={() => copyText(soulHash, 'soul-hash')} className="btn-secondary text-xs">
                      {copied === 'soul-hash' ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">Chain</p>
                      <p className="mt-2 text-sm text-white">BNB Testnet</p>
                    </div>
                    <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">Registry</p>
                      <p className="mt-2 truncate font-mono text-xs text-white">
                        {VIVID_SOUL_REGISTRY_ADDRESS || 'pending deploy'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">Status</p>
                      <p className="mt-2 text-sm text-white">
                        {proofTxHash ? 'Anchored' : 'Hash ready'}
                      </p>
                    </div>
                  </div>

                  {anchorError && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm leading-6 text-red-300">
                      {anchorError}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button onClick={anchorSoul} disabled={isAnchoringSoul} className="btn-primary">
                      {isAnchoringSoul ? 'Waiting for wallet...' : 'Anchor soul on BNB'}
                    </button>
                    {proofTxHash ? (
                      <a
                        href={`${BNB_TESTNET_EXPLORER}/tx/${proofTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-center"
                      >
                        View BscScan proof
                      </a>
                    ) : (
                      <a
                        href={metadataUrl || `/api/soul/metadata?id=${character.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-center"
                      >
                        View metadata
                      </a>
                    )}
                  </div>
                </div>

                <div className="card p-5 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
                      Telegram activation
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">
                      Let {character.name} speak outside the app
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                      The same character spec powers a Telegram webhook, so holders can talk to the
                      meme in character after launch.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                      Start parameter
                    </p>
                    <p className="mt-2 break-all font-mono text-xs text-[#ffe29a]">
                      {telegramStartParam(character.id)}
                    </p>
                  </div>

                  {telegramLink ? (
                    <a
                      href={telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary block text-center"
                    >
                      Activate Telegram persona
                    </a>
                  ) : (
                    <div className="rounded-2xl border border-[#f3ba2f]/14 bg-[#f3ba2f]/6 p-4 text-sm leading-7 text-[#ffe29a]">
                      Set NEXT_PUBLIC_TELEGRAM_BOT_USERNAME and TELEGRAM_BOT_TOKEN to turn this into
                      a live Telegram activation link.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section id="chat" className="section-shell">
            <div className="space-y-3">
              {chatError && (
                <ErrorBanner
                  message={chatError}
                  onRetry={() => sendChat(lastChatMsg.current)}
                  onDismiss={() => setChatError(null)}
                />
              )}

              <div className="card p-5 sm:p-6">
                <div className="section-heading">
                  <div>
                    <p>Proof of life</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                      Talk to the organism
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <PersonaAvatar character={character} imageUrl={avatarImage} compact state={avatarState} />
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{character.name}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#f3ba2f]">
                        {avatarState === 'thinking' ? 'reply forming' : 'persona stable'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card min-h-[560px] p-4">
                  <div className="flex h-full flex-col">
                    <div className="mb-4 flex-1 space-y-3 overflow-y-auto pr-2">
                      {data.chatHistory.length === 0 && !streamingReply && (
                        <div className="space-y-3 py-10 text-center">
                          <p className="text-sm text-zinc-500">
                            Start the first exchange. The avatar will hold the persona before it
                            answers.
                          </p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {[
                              'Tell me your origin story',
                              'What do you think about BNB Chain memes?',
                              'Give me your hottest take',
                            ].map(question => (
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
                        <div
                          key={`${message.role}-${index}`}
                          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.role === 'assistant' && (
                            <PersonaAvatar character={character} imageUrl={avatarImage} compact state="idle" />
                          )}
                          <div
                            className={`max-w-[82%] px-4 py-3 text-sm leading-7 ${
                              message.role === 'user'
                                ? 'bubble-user text-[#fff4da]'
                                : `bubble-meme text-zinc-200 ${personaFontClass}`
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}

                      {showTypingIndicator && (
                        <div className="flex justify-start gap-3">
                          <PersonaAvatar
                            character={character}
                            imageUrl={avatarImage}
                            compact
                            state="thinking"
                          />
                          <div className={`bubble-meme flex items-center gap-2 px-4 py-3 ${personaFontClass}`}>
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                          </div>
                        </div>
                      )}

                      {streamingReply !== null && (
                        <div className="flex justify-start gap-3">
                          <PersonaAvatar
                            character={character}
                            imageUrl={avatarImage}
                            compact
                            state="thinking"
                          />
                          <div className={`bubble-meme reply-stream max-w-[82%] px-4 py-3 text-sm leading-7 text-zinc-200 ${personaFontClass}`}>
                            {streamingReply}
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
                        className="flex-1 rounded-[16px] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#f3ba2f]/45"
                      />
                      <button
                        onClick={() => sendChat()}
                        disabled={isSending || !chatInput.trim()}
                        className="btn-primary text-sm"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="visuals" className="section-shell">
            <div className="space-y-3">
              {imageError && (
                <ErrorBanner
                  message={imageError}
                  onRetry={generateImages}
                  onDismiss={() => setImageError(null)}
                />
              )}

              <div className="card p-5 sm:p-6 space-y-5">
                <div className="section-heading">
                  <div>
                    <p>Visual cortex</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                      Surface generation
                    </h2>
                  </div>
                  <button onClick={generateImages} className="btn-secondary text-xs">
                    {data.images.length === 0 ? 'Generate images' : 'Regenerate images'}
                  </button>
                </div>

                {isGeneratingImages ? (
                  <div className="space-y-4">
                    <div className="card p-5 space-y-2">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#f3ba2f]">Visual cortex online</p>
                      <p className="text-sm text-zinc-400">
                        Rendering three candidate surfaces for {character.name}. They sharpen into
                        focus as the organism stabilizes.
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
                    <p className="text-sm text-zinc-400">
                      No visuals yet. Generate 3 meme images for {character.name}.
                    </p>
                    <p className="text-xs text-zinc-600">Style anchor: {character.visualStyle}</p>
                    <button onClick={generateImages} className="btn-primary">
                      Generate images
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="card overflow-hidden p-3">
                      <img
                        src={avatarImage}
                        alt={`${character.name} selected visual`}
                        loading="eager"
                        decoding="async"
                        onLoad={() =>
                          avatarImage &&
                          setLoadedImages(prev =>
                            prev.includes(avatarImage) ? prev : [...prev, avatarImage]
                          )
                        }
                        onError={retryImageLoad}
                        className={`image-focus aspect-square w-full rounded-[20px] object-cover ${
                          avatarImage && loadedImages.includes(avatarImage) ? 'image-focus-loaded' : ''
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                      {data.images.map((url, index) => {
                        const loaded = loadedImages.includes(url)
                        return (
                          <button
                            key={url}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`card overflow-hidden p-2 text-left ${
                              index === selectedImageIndex
                                ? 'border-[#f3ba2f]/28 shadow-[0_0_30px_rgba(243,186,47,0.12)]'
                                : ''
                            }`}
                          >
                            <img
                              src={url}
                              alt={`${character.name} meme ${index + 1}`}
                              loading="eager"
                              decoding="async"
                              onLoad={() =>
                                setLoadedImages(prev => (prev.includes(url) ? prev : [...prev, url]))
                              }
                              onError={retryImageLoad}
                              className={`image-focus aspect-square w-full rounded-[14px] object-cover ${
                                loaded ? 'image-focus-loaded' : ''
                              }`}
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section id="feed" className="section-shell">
            <div className="space-y-3">
              {contentError && (
                <ErrorBanner
                  message={contentError}
                  onRetry={generateMoreContent}
                  onDismiss={() => setContentError(null)}
                />
              )}

              <div className="card p-5 sm:p-6 space-y-5">
                <div className="section-heading">
                  <div>
                    <p>Content engine</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                      Synthetic feed output
                    </h2>
                  </div>
                  <button
                    onClick={generateMoreContent}
                    disabled={isGeneratingContent}
                    className="btn-secondary text-xs"
                  >
                    {isGeneratingContent ? 'Generating...' : 'Generate more posts'}
                  </button>
                </div>

                {data.contentFeed.length === 0 ? (
                  <div className="card p-8 text-center space-y-4">
                    <p className="text-sm text-zinc-400">No content yet.</p>
                    <button
                      onClick={generateMoreContent}
                      disabled={isGeneratingContent}
                      className="btn-primary"
                    >
                      {isGeneratingContent ? 'Growing content feed...' : 'Generate content'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.contentFeed.map((post, index) => (
                      <div
                        key={`${post.type}-${index}`}
                        className="card card-hover cursor-pointer p-4"
                        onClick={() => copyText(post.content, `post-${index}`)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                              {post.type}
                            </span>
                            <p className={`mt-2 text-sm leading-7 text-zinc-200 ${personaFontClass}`}>
                              {post.content}
                            </p>
                          </div>
                          <span className="whitespace-nowrap text-[10px] text-zinc-600">
                            {copied === `post-${index}` ? 'Copied!' : 'Click to copy'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section id="launch" className="section-shell">
            <div className="card glow-accent p-5 sm:p-6 space-y-5">
              <div className="section-heading">
                <div>
                  <p>Launch</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                    Export this lifeform
                  </h2>
                </div>
                <button onClick={() => setShowExportModal(true)} className="btn-primary btn-deploy">
                  Export to Four.meme
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
                <div className="card p-4 space-y-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">Primary visual</p>
                  {avatarImage ? (
                    <img
                      src={avatarImage}
                      alt={`${character.name} preview`}
                      className="aspect-square w-full rounded-[16px] object-cover"
                      loading="eager"
                      decoding="async"
                      onError={retryImageLoad}
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center rounded-[16px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,215,106,0.25),rgba(243,186,47,0.08),transparent_70%)] text-6xl font-semibold text-[#f3ba2f]">
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
                    <span className="rounded-full border border-[#f3ba2f]/14 bg-[#f3ba2f]/8 px-3 py-1 text-xs tracking-[0.18em] text-[#ffe29a]">
                      ${character.ticker}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500">Launch post</label>
                    <div className="rounded-[16px] border border-white/6 bg-black/25 px-4 py-3 text-sm leading-7 text-zinc-300">
                      {character.launchCopy}
                    </div>
                    <button
                      onClick={() => copyText(character.launchCopy, 'Launch Post')}
                      className="text-[10px] text-[#ffe29a] hover:text-white"
                    >
                      {copied === 'Launch Post' ? 'Copied!' : 'Copy launch post'}
                    </button>
                  </div>

                  <div className="rounded-[16px] border border-white/6 bg-white/[0.02] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">Lore anchor</p>
                    <p className="mt-2 text-sm leading-7 text-zinc-300">{character.originStory}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
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
