import { NextRequest, NextResponse } from 'next/server'
import { ai, TEXT_MODEL } from '@/lib/ai'
import { SYSTEM_CONTENT } from '@/lib/prompts'
import { getSession, addContentPosts } from '@/lib/store'
import { parseContentPosts } from '@/lib/schemas'

export async function POST(req: NextRequest) {
  try {
    const { memeId } = await req.json()

    if (!memeId) {
      return NextResponse.json({ error: 'memeId required' }, { status: 400 })
    }

    const session = await getSession(memeId)
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
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 502 })
    }

    let posts
    try {
      posts = parseContentPosts(raw)
    } catch {
      return NextResponse.json({ error: 'AI returned invalid content. Try again.' }, { status: 502 })
    }

    const timestamped = posts.map(p => ({
      ...p,
      createdAt: new Date().toISOString(),
    }))

    await addContentPosts(memeId, timestamped)

    return NextResponse.json({ posts: timestamped })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Content generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
