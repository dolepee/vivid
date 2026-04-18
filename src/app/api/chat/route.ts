import { NextRequest, NextResponse } from 'next/server'
import { ai, TEXT_MODEL } from '@/lib/ai'
import { SYSTEM_CHAT } from '@/lib/prompts'
import { getSession, addChatMessage } from '@/lib/store'
import { isWeakChatReply } from '@/lib/quality'
import type OpenAI from 'openai'

export async function POST(req: NextRequest) {
  try {
    const { memeId, message } = await req.json()

    if (!memeId || !message) {
      return NextResponse.json({ error: 'memeId and message required' }, { status: 400 })
    }

    const session = await getSession(memeId)
    if (!session) {
      return NextResponse.json({ error: 'Meme not found' }, { status: 404 })
    }

    const { character } = session

    await addChatMessage(memeId, { role: 'user', content: message })

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_CHAT(character) },
      ...session.chatHistory.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ]

    let response = await ai.chat.completions.create({
      model: TEXT_MODEL,
      messages,
      temperature: 0.9,
      max_tokens: 300,
    })

    let reply = response.choices[0]?.message?.content?.trim() || '...'

    if (isWeakChatReply(reply)) {
      response = await ai.chat.completions.create({
        model: TEXT_MODEL,
        messages: [
          ...messages,
          {
            role: 'system',
            content:
              'Your previous draft was too generic. Rewrite it in the same character voice with a sharper joke, opinion, lore hook, or question. Keep it under 2 sentences. No generic assistant language.',
          },
        ],
        temperature: 1,
        max_tokens: 220,
      })
      reply = response.choices[0]?.message?.content?.trim() || reply
    }

    await addChatMessage(memeId, { role: 'assistant', content: reply })

    return NextResponse.json({ reply })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Chat failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
