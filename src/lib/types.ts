/** Canonical character spec that drives all outputs. */
export interface CharacterSpec {
  id: string
  name: string
  ticker: string
  tagline: string
  originStory: string
  vibe: string
  tone: string
  speechPattern: string
  recurringMotifs: string[]
  signatureLines: string[]
  tabooTopics: string[]
  memeWorldview: string
  visualStyle: string
  launchCopy: string
  createdAt: string
}

/** Stored meme session with character + history. */
export interface MemeSession {
  character: CharacterSpec
  chatHistory: ChatMessage[]
  images: string[]
  contentFeed: ContentPost[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ContentPost {
  type: 'tweet' | 'caption' | 'reply'
  content: string
  createdAt: string
}

/** Four.meme launch package export. */
export interface LaunchPackage {
  name: string
  ticker: string
  description: string
  launchPost: string
  images: string[]
  tokenomicsNotes: string
}
