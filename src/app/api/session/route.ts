import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/store'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const session = await getSession(id)
  if (!session) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    character: session.character,
    chatHistory: session.chatHistory,
    images: session.images,
    contentFeed: session.contentFeed,
  })
}
