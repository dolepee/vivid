import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/store'
import { buildSoulPayload, hashSoulPayload } from '@/lib/soul'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const session = await getSession(id)
  if (!session) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const payload = buildSoulPayload(session.character, session.images, session.contentFeed)

  return NextResponse.json({
    name: session.character.name,
    ticker: session.character.ticker,
    description: `${session.character.tagline}\n\n${session.character.originStory}`,
    image: session.images[0] || null,
    external_url: `${req.nextUrl.origin}/meme/${session.character.id}`,
    vivid: payload,
    soulHash: hashSoulPayload(payload),
  })
}

