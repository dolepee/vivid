import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { ai, TEXT_MODEL } from '@/lib/ai'
import { SYSTEM_GENERATE, SYSTEM_CONTENT } from '@/lib/prompts'
import { createSession } from '@/lib/store'
import { parseCharacter, parseContentPosts } from '@/lib/schemas'
import { isWeakContentBatch } from '@/lib/quality'
import type { CharacterSpec } from '@/lib/types'

async function generateCharacterRaw(concept: string): Promise<string> {
  const res = await ai.chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_GENERATE },
      { role: 'user', content: concept },
    ],
    temperature: 0.9,
    max_tokens: 1500,
  })
  return res.choices[0]?.message?.content?.trim() || ''
}

export async function POST(req: NextRequest) {
  try {
    const { concept } = await req.json()

    if (!concept || typeof concept !== 'string') {
      return NextResponse.json({ error: 'concept is required' }, { status: 400 })
    }

    // Generate + validate character with one retry
    let parsed
    let raw = await generateCharacterRaw(concept)
    try {
      parsed = parseCharacter(raw)
    } catch {
      raw = await generateCharacterRaw(concept)
      try {
        parsed = parseCharacter(raw)
      } catch {
        return NextResponse.json({ error: 'AI returned invalid character data. Try again.' }, { status: 502 })
      }
    }

    const character: CharacterSpec = {
      ...parsed,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    }

    // Generate initial content feed in parallel
    const contentPromise = ai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_CONTENT(character) },
        {
          role: 'user',
          content:
            'Generate your first launch-day batch. Make it relatable, funny, viral, and unmistakably in character.',
        },
      ],
      temperature: 0.9,
      max_tokens: 1000,
    })

    const session = await createSession(character)

    try {
      const contentResponse = await contentPromise
      const contentRaw = contentResponse.choices[0]?.message?.content?.trim()
      if (contentRaw) {
        let posts = parseContentPosts(contentRaw)

        if (isWeakContentBatch(posts, character)) {
          const retryResponse = await ai.chat.completions.create({
            model: TEXT_MODEL,
            messages: [
              { role: 'system', content: SYSTEM_CONTENT(character) },
              {
                role: 'user',
                content:
                  'Regenerate the full JSON array. The previous launch batch was too generic. Make every post sharper, funnier, more memetic, more crypto-native, and more specific to the character lore.',
              },
            ],
            temperature: 1,
            max_tokens: 1000,
          })
          const retryRaw = retryResponse.choices[0]?.message?.content?.trim()
          if (retryRaw) {
            try {
              const retryPosts = parseContentPosts(retryRaw)
              if (!isWeakContentBatch(retryPosts, character)) {
                posts = retryPosts
              }
            } catch {
              // Keep the valid first batch if the stricter retry breaks JSON.
            }
          }
        }

        session.contentFeed = posts.map(p => ({
          ...p,
          createdAt: new Date().toISOString(),
        }))
        // Update session with content feed
        const { addContentPosts } = await import('@/lib/store')
        await addContentPosts(character.id, session.contentFeed)
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
