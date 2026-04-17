import { keccak256, stringToHex } from 'viem'
import type { CharacterSpec, ContentPost } from './types'

export interface SoulPayload {
  version: 'vivid-soul-v1'
  character: CharacterSpec
  images: string[]
  contentFeed: Pick<ContentPost, 'type' | 'content'>[]
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(item => stableStringify(item)).join(',')}]`
  }

  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>
    return `{${Object.keys(object)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableStringify(object[key])}`)
      .join(',')}}`
  }

  return JSON.stringify(value)
}

export function buildSoulPayload(
  character: CharacterSpec,
  images: string[],
  contentFeed: ContentPost[]
): SoulPayload {
  return {
    version: 'vivid-soul-v1',
    character,
    images,
    contentFeed: contentFeed.map(post => ({
      type: post.type,
      content: post.content,
    })),
  }
}

export function hashSoulPayload(payload: SoulPayload): `0x${string}` {
  return keccak256(stringToHex(stableStringify(payload)))
}

export function telegramStartParam(memeId: string) {
  return `vivid_${memeId}`
}

