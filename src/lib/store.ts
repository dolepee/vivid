import { Redis } from '@upstash/redis'
import type { MemeSession, CharacterSpec, ChatMessage, ContentPost } from './types'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const SESSION_KEY = (id: string) => `session:${id}`
const INDEX_KEY = 'sessions:index'
const TELEGRAM_BINDING_KEY = (chatId: string) => `telegram:${chatId}:meme`
const TTL = 60 * 60 * 24 * 30 // 30 days

export async function createSession(character: CharacterSpec): Promise<MemeSession> {
  const session: MemeSession = {
    character,
    chatHistory: [],
    images: [],
    contentFeed: [],
  }
  await redis.set(SESSION_KEY(character.id), JSON.stringify(session), { ex: TTL })
  await redis.sadd(INDEX_KEY, character.id)
  return session
}

export async function getSession(id: string): Promise<MemeSession | null> {
  const data = await redis.get<string>(SESSION_KEY(id))
  if (!data) return null
  return typeof data === 'string' ? JSON.parse(data) : data as unknown as MemeSession
}

// NOTE: This is a non-atomic read-modify-write. Two concurrent updates to the
// same session can race. Acceptable for a hackathon MVP where each meme is
// typically used by one person at a time. A production version would use Redis
// WATCH/MULTI or Lua scripts for atomicity.
async function updateSession(id: string, updater: (s: MemeSession) => MemeSession): Promise<MemeSession | null> {
  const session = await getSession(id)
  if (!session) return null
  const updated = updater({ ...session })
  await redis.set(SESSION_KEY(id), JSON.stringify(updated), { ex: TTL })
  return updated
}

export async function addChatMessage(id: string, message: ChatMessage): Promise<void> {
  await updateSession(id, s => {
    const chatHistory = [...s.chatHistory, message]
    return {
      ...s,
      chatHistory: chatHistory.length > 50 ? chatHistory.slice(-50) : chatHistory,
    }
  })
}

export async function setImages(id: string, images: string[]): Promise<void> {
  await updateSession(id, s => ({ ...s, images }))
}

export async function addContentPosts(id: string, posts: ContentPost[]): Promise<void> {
  await updateSession(id, s => ({
    ...s,
    contentFeed: [...s.contentFeed, ...posts],
  }))
}

export async function bindTelegramChat(chatId: string, memeId: string): Promise<void> {
  await redis.set(TELEGRAM_BINDING_KEY(chatId), memeId, { ex: TTL })
}

export async function getTelegramBinding(chatId: string): Promise<string | null> {
  const data = await redis.get<string>(TELEGRAM_BINDING_KEY(chatId))
  return typeof data === 'string' ? data : null
}

export async function getAllSessions(): Promise<MemeSession[]> {
  const ids = await redis.smembers(INDEX_KEY)
  if (!ids || ids.length === 0) return []

  const sessions: MemeSession[] = []
  for (const id of ids) {
    const session = await getSession(id as string)
    if (session) sessions.push(session)
  }

  sessions.sort((a, b) =>
    new Date(b.character.createdAt).getTime() - new Date(a.character.createdAt).getTime()
  )

  return sessions
}
