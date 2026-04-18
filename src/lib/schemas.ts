import { z } from 'zod'

export const CharacterSpecSchema = z.object({
  name: z.string().min(1),
  ticker: z.string().min(2).max(8),
  tagline: z.string().min(1),
  originStory: z.string().min(1),
  vibe: z.string().min(1),
  tone: z.string().min(1),
  speechPattern: z.string().min(1),
  recurringMotifs: z.array(z.string()).min(1),
  signatureLines: z.array(z.string()).min(1),
  tabooTopics: z.array(z.string()).min(1),
  memeWorldview: z.string().min(1),
  visualStyle: z.string().min(1),
  launchCopy: z.string().min(1),
})

export const ContentPostSchema = z.object({
  type: z.enum(['tweet', 'caption', 'reply', 'quote', 'raid', 'telegram']),
  content: z.string().min(1),
})

export const ContentPostArraySchema = z.array(ContentPostSchema).min(1)

/** Parse raw AI character JSON, stripping extra fields. */
export function parseCharacter(raw: string) {
  const cleaned = raw.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '')
  return CharacterSpecSchema.parse(JSON.parse(cleaned))
}

/** Parse raw AI content JSON. */
export function parseContentPosts(raw: string) {
  const cleaned = raw.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '')
  return ContentPostArraySchema.parse(JSON.parse(cleaned))
}
