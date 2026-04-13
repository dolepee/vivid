# VIVID

AI character engine for meme launches on Four.meme. Type a concept, get a living meme with personality, lore, visuals, voice, and a launch kit.

**Live:** [vividmeme.vercel.app](https://vividmeme.vercel.app)

## What it does

VIVID turns a one line concept into a complete, consistent meme character:

1. **Identity** - name, ticker, origin story, vibe, tone, speech pattern, worldview, signature lines, taboo topics
2. **Voice** - live chat with the character; it stays in persona across conversations
3. **Visuals** - 3 AI generated meme images matching the character's visual style
4. **Content** - social media posts written in the character's voice, ready to copy
5. **Launch Kit** - name, ticker, description, and launch copy formatted for Four.meme's create flow

The core insight: every output (lore, chat replies, images, tweets, launch copy) is driven by one canonical character spec. This makes the character feel coherent across every surface, not randomly generated.

## Architecture

```
Next.js 16 App Router
  |
  +-- /api/generate    CharacterSpec + content feed (DGrid / GPT-4o)
  +-- /api/chat         In-character conversation (DGrid / GPT-4o)
  +-- /api/content      Generate more social posts on demand
  +-- /api/images       3 meme images (Pollinations.ai, free)
  +-- /api/session      Session retrieval
  |
  +-- Upstash Redis     Durable session persistence (Vercel KV)
  +-- Zod               Schema validation on all AI outputs
```

- **AI:** DGrid decentralized inference gateway routing to GPT-4o
- **Images:** Pollinations.ai (free, no API key, seed-based variation)
- **Storage:** Upstash Redis via Vercel KV integration (sessions persist across deploys)
- **Validation:** Zod schemas on CharacterSpec and ContentPost; malformed AI output triggers retry, then clean error

## Local setup

```bash
git clone https://github.com/dolepee/vivid.git
cd vivid
npm install
cp .env.local.example .env.local
# Fill in your DGrid API key and Upstash Redis credentials
npm run dev
```

## Demo flow

1. Open the app, type a concept (e.g. "a paranoid toaster that thinks everything is a rug pull")
2. Character generates in seconds with full identity
3. Click "Talk" to chat with the character in real time
4. Click "Visuals" to generate 3 meme images
5. Click "Feed" to see social posts, generate more on demand
6. Click "Launch" to copy the complete Four.meme launch kit

## Stack

- Next.js 16, React 19, Tailwind CSS 4
- DGrid AI Gateway (GPT-4o via decentralized inference)
- Pollinations.ai (image generation)
- Upstash Redis (Vercel KV)
- Zod (runtime validation)
- Vercel (deployment)

## Hackathon

Built for the [Four.Meme AI Sprint](https://dorahacks.io/hackathon/fourmemeaisprint/detail) on DoraHacks.
