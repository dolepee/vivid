import { NextRequest, NextResponse } from 'next/server'
import { ai, TEXT_MODEL } from '@/lib/ai'
import { CHAT_INTENT_DIRECTIVE, SYSTEM_CHAT } from '@/lib/prompts'
import { isWeakChatReply } from '@/lib/quality'
import { quickPersonaReply } from '@/lib/persona-replies'
import {
  addChatMessage,
  bindTelegramChat,
  getSession,
  getTelegramBinding,
} from '@/lib/store'

interface TelegramMessage {
  chat?: { id?: number | string }
  text?: string
}

interface TelegramUpdate {
  message?: TelegramMessage
}

async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  })
}

function extractStartMemeId(text: string) {
  const match = text.match(/^\/start\s+vivid_([A-Za-z0-9_-]+)$/)
  return match?.[1]
}

export async function POST(req: NextRequest) {
  const update = (await req.json()) as TelegramUpdate
  const message = update.message
  const chatId = message?.chat?.id?.toString()
  const text = message?.text?.trim()

  if (!chatId || !text) {
    return NextResponse.json({ ok: true })
  }

  const startedMemeId = extractStartMemeId(text)
  if (startedMemeId) {
    const session = await getSession(startedMemeId)
    if (!session) {
      await sendTelegramMessage(chatId, 'That VIVID meme has expired or does not exist.')
      return NextResponse.json({ ok: true })
    }

    await bindTelegramChat(chatId, startedMemeId)
    await sendTelegramMessage(
      chatId,
      `${session.character.name} is awake.\n\n${session.character.signatureLines[0]}\n\nSend any message and the meme will answer in character.`
    )
    return NextResponse.json({ ok: true })
  }

  const memeId = await getTelegramBinding(chatId)
  if (!memeId) {
    await sendTelegramMessage(
      chatId,
      'Open VIVID, create a living meme, then activate it with the Telegram link.'
    )
    return NextResponse.json({ ok: true })
  }

  const session = await getSession(memeId)
  if (!session) {
    await sendTelegramMessage(chatId, 'The active VIVID meme is missing. Activate a new meme from the app.')
    return NextResponse.json({ ok: true })
  }

  await addChatMessage(memeId, { role: 'user', content: text })

  const quickReply = quickPersonaReply(session.character, text)
  if (quickReply) {
    await addChatMessage(memeId, { role: 'assistant', content: quickReply })
    await sendTelegramMessage(chatId, quickReply)
    return NextResponse.json({ ok: true })
  }

  let response = await ai.chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_CHAT(session.character) },
      { role: 'system', content: CHAT_INTENT_DIRECTIVE(text) },
      ...session.chatHistory.slice(-12).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: text },
    ],
    temperature: 0.82,
    max_tokens: 220,
  })

  let reply = response.choices[0]?.message?.content?.trim() || session.character.signatureLines[0]

  if (isWeakChatReply(reply)) {
    response = await ai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_CHAT(session.character) },
        { role: 'system', content: CHAT_INTENT_DIRECTIVE(text) },
        {
          role: 'system',
          content:
            'Rewrite the reply. The previous version was too generic or formal. Make it short, meme-native, and useful in Telegram.',
        },
        { role: 'user', content: text },
      ],
      temperature: 0.9,
      max_tokens: 180,
    })
    reply = response.choices[0]?.message?.content?.trim() || reply
  }

  await addChatMessage(memeId, { role: 'assistant', content: reply })
  await sendTelegramMessage(chatId, reply)

  return NextResponse.json({ ok: true })
}
