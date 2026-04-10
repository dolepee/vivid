import { NextResponse } from 'next/server'
import { getAllSessions } from '@/lib/store'

export async function GET() {
  const sessions = await getAllSessions()
  const summaries = sessions.map(s => ({
    id: s.character.id,
    name: s.character.name,
    ticker: s.character.ticker,
    tagline: s.character.tagline,
    vibe: s.character.vibe,
    createdAt: s.character.createdAt,
    hasImages: s.images.length > 0,
    postCount: s.contentFeed.length,
    chatCount: s.chatHistory.length,
  }))
  return NextResponse.json({ memes: summaries })
}
