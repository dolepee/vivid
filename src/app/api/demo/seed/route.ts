import { NextResponse } from 'next/server'
import { DEMO_CHARACTER, DEMO_CHAT, DEMO_CONTENT } from '@/lib/demo-character'
import {
  addContentPosts,
  createSession,
  getSession,
  setChatHistory,
  setContentPosts,
} from '@/lib/store'

export async function POST() {
  const existing = await getSession(DEMO_CHARACTER.id)
  if (!existing) {
    await createSession(DEMO_CHARACTER)
    await addContentPosts(DEMO_CHARACTER.id, DEMO_CONTENT)
  } else {
    await setContentPosts(DEMO_CHARACTER.id, DEMO_CONTENT)
  }
  await setChatHistory(DEMO_CHARACTER.id, DEMO_CHAT)

  return NextResponse.json({ id: DEMO_CHARACTER.id, path: `/meme/${DEMO_CHARACTER.id}` })
}
