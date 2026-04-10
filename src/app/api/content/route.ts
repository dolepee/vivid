import { NextRequest, NextResponse } from 'next/server'
import { ai, TEXT_MODEL } from '@/lib/ai'
import { SYSTEM_CONTENT } from '@/lib/prompts'
import { getSession, addContentPosts } from '@/lib/store'
import type { ContentPost } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { memeId } = await req.json()

    if (!memeId) {
      return NextResponse.json({ error: 'memeId required' }, { status: 400 })
    }

    const session = getSession(memeId)
    if (!session) {
      return NextResponse.json({ error: 'Meme not found' }, { status: 404 })
    }

    const { character } = session

    const response = await ai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_CONTENT(character) },
        { role: 'user', content: 'Generate a fresh batch of posts. Be creative and vary the types.' },
      ],
      temperature: 0.95,
      max_tokens: 800,
    })

    const raw = response.choices[0]?.message?.content?.trim()
    if (!raw) {
      return NextResponse.json({ error: 'Empty response' }, { status: 500 })
    }

    const cleaned = raw.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '')
    const posts = JSON.parse(cleaned) as ContentPost[]
    const timestamped = posts.map(p => ({
      ...p,
      createdAt: new Date().toISOString(),
    }))

    addContentPosts(memeId, timestamped)

    return NextResponse.json({ posts: timestamped })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Content generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
