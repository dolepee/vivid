import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { IMAGE_PROMPT } from '@/lib/prompts'
import { getSession, setImages } from '@/lib/store'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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

    // Generate 3 images in parallel
    const imagePromises = Array.from({ length: 3 }, () =>
      openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      })
    )

    const results = await Promise.allSettled(imagePromises)
    const urls: string[] = []

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const url = result.value.data?.[0]?.url
        if (url) urls.push(url)
      }
    }

    if (urls.length === 0) {
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
    }

    setImages(memeId, urls)

    return NextResponse.json({ images: urls })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Image generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
