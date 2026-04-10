'use client'

import { useState, useEffect } from 'react'

interface MemeSummary {
  id: string
  name: string
  ticker: string
  tagline: string
  vibe: string
  createdAt: string
  hasImages: boolean
  postCount: number
  chatCount: number
}

export default function GalleryPage() {
  const [memes, setMemes] = useState<MemeSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/session/all')
      .then(r => r.json())
      .then(d => { setMemes(d.memes || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="card hero-surface flex min-h-[280px] items-center justify-center p-8">
        <div className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[#f3ba2f]">Gallery sync</p>
          <h2 className="text-2xl font-semibold text-white">Collecting living memes...</h2>
          <div className="mx-auto flex w-fit gap-2">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gallery</h1>
          <p className="text-zinc-500 text-sm mt-1">{memes.length} meme{memes.length !== 1 ? 's' : ''} created</p>
        </div>
        <a href="/" className="btn-primary text-sm">New meme</a>
      </div>

      {memes.length === 0 ? (
        <div className="card p-12 text-center space-y-4">
          <p className="text-zinc-400">No memes created yet.</p>
          <a href="/" className="btn-primary inline-block">Create your first meme</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memes.map(meme => (
            <a key={meme.id} href={`/meme/${meme.id}`} className="card card-hover p-5 space-y-3 block transition-transform hover:scale-[1.01]">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{meme.name}</h2>
                  <p className="text-[#f3ba2f] font-mono text-xs">${meme.ticker}</p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-[#f3ba2f]/10 text-[#ffe29a]">{meme.vibe}</span>
              </div>
              <p className="text-sm text-zinc-400 line-clamp-2">{meme.tagline}</p>
              <div className="flex gap-3 text-[10px] text-zinc-600">
                {meme.hasImages && <span>has images</span>}
                {meme.postCount > 0 && <span>{meme.postCount} posts</span>}
                {meme.chatCount > 0 && <span>{meme.chatCount} messages</span>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
