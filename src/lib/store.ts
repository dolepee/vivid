import { Redis } from '@upstash/redis'
import type { MemeSession, CharacterSpec, ChatMessage, ContentPost } from './types'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const SESSION_KEY = (id: string) => `session:${id}`
const INDEX_KEY = 'sessions:index'
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

async function updateSession(id: string, updater: (s: MemeSession) => MemeSession): Promise<MemeSession | null> {
  const session = await getSession(id)
  if (!session) return null
  const updated = updater(session)
  await redis.set(SESSION_KEY(id), JSON.stringify(updated), { ex: TTL })
  return updated
}

export async function addChatMessage(id: string, message: ChatMessage): Promise<void> {
  await updateSession(id, s => {
    s.chatHistory.push(message)
    if (s.chatHistory.length > 50) {
      s.chatHistory = s.chatHistory.slice(-50)
    }
    return s
  })
}

export async function setImages(id: string, images: string[]): Promise<void> {
  await updateSession(id, s => ({ ...s, images }))
}

export async function addContentPosts(id: string, posts: ContentPost[]): Promise<void> {
  await updateSession(id, s => {
    s.contentFeed.push(...posts)
    return s
  })
}

export async function getAllSessions(): Promise<MemeSession[]> {
  const ids = await redis.smembers(INDEX_KEY)
  if (!ids || ids.length === 0) return []

  const sessions: MemeSession[] = []
  for (const id of ids) {
    const session = await getSession(id as string)
    if (session) sessions.push(session)
  }
  return sessions
}
