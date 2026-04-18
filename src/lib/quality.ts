import type { ContentPost } from './types'

const STALE_PHRASES = [
  'to the moon',
  'join the revolution',
  'next big thing',
  "don't miss out",
  'dont miss out',
  'wagmi',
  'diamond hands',
  'stay sharp',
  "i'm here to help",
  'as an ai',
  'that sounds great',
  'that is great',
  'seeker',
  'shall',
  'what tale',
  'moonlit',
  'under a thousand suns',
  'dear friend',
  'behold',
  'fortunes await',
  'ready your crumbs',
  'each trade is a cookie',
]

const CRYPTO_CONTEXT = [
  'bnb',
  'four.meme',
  'fourmeme',
  'meme',
  'launch',
  'token',
  'ticker',
  'holder',
  'chart',
  'contract',
  'liquidity',
  'rug',
  'raid',
  'trenches',
]

function normalizedIncludes(text: string, term: string) {
  return text.toLowerCase().includes(term.toLowerCase())
}

export function isWeakChatReply(reply: string) {
  const text = reply.trim()
  const lower = text.toLowerCase()

  if (text.length < 36) return true
  if (text.length > 520) return true
  if (STALE_PHRASES.some(phrase => lower.includes(phrase))) return true
  if (!/[.!?]$/.test(text)) return true

  return false
}

export function isWeakContentBatch(
  posts: Array<Pick<ContentPost, 'type' | 'content'>>,
  character: {
    name: string
    ticker: string
    recurringMotifs: string[]
    signatureLines: string[]
  }
) {
  if (posts.length < 5) return true

  const uniqueTypes = new Set(posts.map(post => post.type))
  if (uniqueTypes.size < 4) return true

  const joined = posts.map(post => post.content).join(' ').toLowerCase()
  if (STALE_PHRASES.some(phrase => joined.includes(phrase))) return true

  const motifHits = posts.filter(post => {
    const content = post.content.toLowerCase()
    return (
      normalizedIncludes(content, character.name) ||
      normalizedIncludes(content, character.ticker) ||
      character.recurringMotifs.some(motif => normalizedIncludes(content, motif)) ||
      character.signatureLines.some(line => normalizedIncludes(content, line))
    )
  }).length

  const cryptoHits = posts.filter(post =>
    CRYPTO_CONTEXT.some(term => normalizedIncludes(post.content, term))
  ).length

  const tooShort = posts.filter(post => post.content.trim().length < 45).length
  const tooLong = posts.filter(post => post.content.length > 240).length

  return motifHits < 3 || cryptoHits < 3 || tooShort > 1 || tooLong > 0
}
