import { NextRequest, NextResponse } from 'next/server'
import { ai, TEXT_MODEL } from '@/lib/ai'
import { SYSTEM_CONTENT } from '@/lib/prompts'
import { getSession, addContentPosts } from '@/lib/store'
import { parseContentPosts } from '@/lib/schemas'
import { isWeakContentBatch } from '@/lib/quality'

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

    const generate = (instruction: string, temperature = 0.95) =>
      ai.chat.completions.create({
        model: TEXT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_CONTENT(character) },
          { role: 'user', content: instruction },
        ],
        temperature,
        max_tokens: 1000,
      })

    let response = await generate(
      'Generate a fresh batch of posts. Make them relatable, funny, viral, and unmistakably in character.'
    )

    let raw = response.choices[0]?.message?.content?.trim()
    if (!raw) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 502 })
    }

    let posts
    try {
      posts = parseContentPosts(raw)
    } catch {
      return NextResponse.json({ error: 'AI returned invalid content. Try again.' }, { status: 502 })
    }

    if (isWeakContentBatch(posts, character)) {
      response = await generate(
        'Regenerate the full JSON array. The previous batch was too generic. Make every post feel native to meme Twitter/Telegram: sharper hooks, better punchlines, stronger lore references, less brand copy, more holder energy.',
        1
      )
      raw = response.choices[0]?.message?.content?.trim()
      if (raw) {
        try {
          const retryPosts = parseContentPosts(raw)
          if (!isWeakContentBatch(retryPosts, character)) {
            posts = retryPosts
          }
        } catch {
          // Keep the valid first batch if the stricter retry breaks JSON.
        }
      }
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
