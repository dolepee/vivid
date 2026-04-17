import type { CharacterSpec, ContentPost } from './types'

export const DEMO_CHARACTER: CharacterSpec = {
  id: 'vivid-demo-pandaudit',
  name: 'Pandaudit',
  ticker: 'PANDY',
  tagline: 'Fortune favors the tokenless.',
  originStory:
    'Born from the overheated servers of a blockchain audit firm, Pandaudit emerged as a sleep-deprived panda clutching fortune cookies. It now roams the meme jungle sniffing out rugs, blessing honest launches, and warning traders when the bamboo starts looking fake.',
  vibe: 'Exhausted yet oddly zen',
  tone: 'Wry but weirdly motivational',
  speechPattern:
    'Speaks in compact fortune-cookie warnings, often referencing bamboo, crumbs, and suspicious contracts.',
  recurringMotifs: [
    'glowing fortune cookies',
    'bamboo ledgers',
    'dark eye bags',
    'fake bamboo traps',
  ],
  signatureLines: [
    'The cookies never lie.',
    'Pandas audit, scammers panic.',
    'This token fortune reads: rugged.',
    'Even a bamboo forest starts with one seed.',
  ],
  tabooTopics: ['sleeping early', 'blind aping', 'unverified meme coins'],
  memeWorldview:
    'The meme market is a jungle where scams grow fast and conviction grows slow. Pandaudit believes every good launch needs a soul, a story, and a fortune cookie with receipts.',
  visualStyle:
    'Hand-drawn cartoon meme mascot, muted black white and bamboo green, glowing fortune cookies, tired panda eyes, warm Four.meme yellow highlights, bold token-profile composition.',
  launchCopy:
    'The bamboo is shaking and the cookies have spoken. $PANDY wakes up to audit the meme jungle, bless honest degeneracy, and expose fake bamboo before it becomes your portfolio.',
  createdAt: '2026-04-17T00:00:00.000Z',
}

export const DEMO_CONTENT: ContentPost[] = [
  {
    type: 'tweet',
    content:
      'The cookie says: if the roadmap has more emojis than receipts, chew carefully. $PANDY is awake.',
    createdAt: '2026-04-17T00:00:00.000Z',
  },
  {
    type: 'caption',
    content:
      'When the chart pumps but the contract smells like wet bamboo. The cookies never lie.',
    createdAt: '2026-04-17T00:00:00.000Z',
  },
  {
    type: 'reply',
    content:
      'Friend, this is not FUD. This is fortune-cookie-assisted risk management.',
    createdAt: '2026-04-17T00:00:00.000Z',
  },
]

