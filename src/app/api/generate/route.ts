import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'
import { SYSTEM_GENERATE, SYSTEM_CONTENT } from '@/lib/prompts'
import { createSession } from '@/lib/store'
import type { CharacterSpec, ContentPost } from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { concept } = await req.json()

    if (!concept || typeof concept !== 'string') {
      return NextResponse.json({ error: 'concept is required' }, { status: 400 })
    }

    // Generate character spec
    const charResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_GENERATE },
        { role: 'user', content: concept },
      ],
      temperature: 0.9,
      max_tokens: 1500,
    })

    const raw = charResponse.choices[0]?.message?.content?.trim()
    if (!raw) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 })
    }

    let parsed: Omit<CharacterSpec, 'id' | 'createdAt'>
    try {
      // Strip markdown code fences if present
      const cleaned = raw.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '')
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Failed to parse character', raw }, { status: 500 })
    }

    const character: CharacterSpec = {
      ...parsed,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    }

    // Generate initial content feed in parallel
    const contentPromise = openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_CONTENT(character) },
        { role: 'user', content: 'Generate your first batch of posts for launch day.' },
      ],
      temperature: 0.9,
      max_tokens: 800,
    })

    const session = createSession(character)

    // Wait for content
    try {
      const contentResponse = await contentPromise
      const contentRaw = contentResponse.choices[0]?.message?.content?.trim()
      if (contentRaw) {
        const cleaned = contentRaw.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '')
        const posts = JSON.parse(cleaned) as ContentPost[]
        const timestamped = posts.map(p => ({
          ...p,
          createdAt: new Date().toISOString(),
        }))
        session.contentFeed = timestamped
      }
    } catch {
      // Content generation is non-critical
    }

    return NextResponse.json({ character, contentFeed: session.contentFeed })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
