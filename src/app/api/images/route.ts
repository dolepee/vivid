import { NextRequest, NextResponse } from 'next/server'
import { IMAGE_PROMPT } from '@/lib/prompts'
import { getSession, setImages } from '@/lib/store'

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
    const prompt = IMAGE_PROMPT(character)
    const encoded = encodeURIComponent(prompt)

    // Pollinations.ai generates images on-demand when the URL is fetched by the
    // browser. HEAD requests are unreliable (often 500), so we construct the URLs
    // directly. Each seed produces a different image deterministically.
    const urls = [0, 1, 2].map(i => {
      const seed = Math.floor(Math.random() * 1000000)
      return `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&seed=${seed}&nologo=true&cacheBust=${Date.now()}-${i}`
    })

    await setImages(memeId, urls)

    return NextResponse.json({ images: urls })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Image generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
