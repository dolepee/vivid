import { NextRequest, NextResponse } from 'next/server'
import { IMAGE_PROMPT } from '@/lib/prompts'
import { getSession, setImages } from '@/lib/store'

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
    const prompt = IMAGE_PROMPT(character)
    const encoded = encodeURIComponent(prompt)

    // Generate 3 images with different seeds via Pollinations.ai (free, no key needed)
    const seeds = [
      Math.floor(Math.random() * 1000000),
      Math.floor(Math.random() * 1000000),
      Math.floor(Math.random() * 1000000),
    ]

    const urls = seeds.map(
      seed => `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true`
    )

    // Verify at least one image is reachable
    const checks = await Promise.allSettled(
      urls.map(url => fetch(url, { method: 'HEAD' }))
    )

    const validUrls = urls.filter((_, i) => checks[i].status === 'fulfilled')

    if (validUrls.length === 0) {
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
    }

    setImages(memeId, validUrls)

    return NextResponse.json({ images: validUrls })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Image generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
