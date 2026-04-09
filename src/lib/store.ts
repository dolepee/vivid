import type { MemeSession, CharacterSpec, ChatMessage, ContentPost } from './types'

/**
 * In-memory session store. Good enough for hackathon MVP.
 * Each meme gets a session keyed by character ID.
 */
const sessions = new Map<string, MemeSession>()

export function createSession(character: CharacterSpec): MemeSession {
  const session: MemeSession = {
    character,
    chatHistory: [],
    images: [],
    contentFeed: [],
  }
  sessions.set(character.id, session)
  return session
}

export function getSession(id: string): MemeSession | undefined {
  return sessions.get(id)
}

export function addChatMessage(id: string, message: ChatMessage): void {
  const session = sessions.get(id)
  if (session) {
    session.chatHistory.push(message)
    // Keep last 50 messages to avoid token overflow
    if (session.chatHistory.length > 50) {
      session.chatHistory = session.chatHistory.slice(-50)
    }
  }
}

export function setImages(id: string, images: string[]): void {
  const session = sessions.get(id)
  if (session) {
    session.images = images
  }
}

export function addContentPosts(id: string, posts: ContentPost[]): void {
  const session = sessions.get(id)
  if (session) {
    session.contentFeed.push(...posts)
  }
}

export function getAllSessions(): MemeSession[] {
  return Array.from(sessions.values())
}
