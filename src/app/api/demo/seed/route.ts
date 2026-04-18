import { NextResponse } from 'next/server'
import { DEMO_CHARACTER, DEMO_CHAT, DEMO_CONTENT } from '@/lib/demo-character'
import {
  addContentPosts,
  createSession,
  getSession,
  setChatHistory,
  setContentPosts,
  setImages,
} from '@/lib/store'

function normalizeDemoImage(url: string) {
  try {
    const parsed = new URL(url)
    parsed.searchParams.set('width', '768')
    parsed.searchParams.set('height', '768')
    return parsed.toString()
  } catch {
    return url.replace('width=1024', 'width=768').replace('height=1024', 'height=768')
  }
}

export async function POST() {
  const existing = await getSession(DEMO_CHARACTER.id)
  if (!existing) {
    await createSession(DEMO_CHARACTER)
    await addContentPosts(DEMO_CHARACTER.id, DEMO_CONTENT)
  } else {
    await setContentPosts(DEMO_CHARACTER.id, DEMO_CONTENT)
    if (existing.images.length > 0) {
      await setImages(DEMO_CHARACTER.id, existing.images.map(normalizeDemoImage))
    }
  }
  await setChatHistory(DEMO_CHARACTER.id, DEMO_CHAT)

  return NextResponse.json({ id: DEMO_CHARACTER.id, path: `/meme/${DEMO_CHARACTER.id}` })
}
