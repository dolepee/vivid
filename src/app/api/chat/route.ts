import { NextRequest, NextResponse } from 'next/server'
import { ai, TEXT_MODEL } from '@/lib/ai'
import { SYSTEM_CHAT } from '@/lib/prompts'
import { getSession, addChatMessage } from '@/lib/store'
import type OpenAI from 'openai'

export async function POST(req: NextRequest) {
  try {
    const { memeId, message } = await req.json()

    if (!memeId || !message) {
      return NextResponse.json({ error: 'memeId and message required' }, { status: 400 })
    }

    const session = getSession(memeId)
    if (!session) {
      return NextResponse.json({ error: 'Meme not found' }, { status: 404 })
    }

    const { character } = session

    addChatMessage(memeId, { role: 'user', content: message })

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_CHAT(character) },
      ...session.chatHistory.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const response = await ai.chat.completions.create({
      model: TEXT_MODEL,
      messages,
      temperature: 0.9,
      max_tokens: 300,
    })

    const reply = response.choices[0]?.message?.content?.trim() || '...'
    addChatMessage(memeId, { role: 'assistant', content: reply })

    return NextResponse.json({ reply })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Chat failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
