# VIVID

**Living Meme AI for Four.Meme.** Type a concept, get a meme character with identity, lore, visuals, voice, Telegram presence, Four.Meme launch copy, and optional BNB-chain soul proof.

**Live:** https://vividmeme.vercel.app
**Judge demo:** https://vividmeme.vercel.app/demo

## Winner Loop

VIVID is designed around one clear hackathon loop:

1. **Trigger:** a user enters one meme concept.
2. **Reasoning:** VIVID creates a canonical character genome: name, ticker, lore, worldview, speech pattern, motifs, visual style, and launch copy.
3. **Action:** the same genome drives chat, social posts, images, Telegram activation, and Four.Meme export.
4. **Proof:** the character payload can be hashed and anchored through `VividSoulRegistry` on BNB testnet.
5. **Result:** the meme is no longer a random asset bundle; it behaves like a persistent character that can live with a community after launch.

## What It Does

- **Identity:** coherent name, ticker, origin story, worldview, tone, motifs, and taboo topics.
- **Voice:** live chat where the meme stays in character and references its own lore.
- **Visuals:** three AI-generated meme images derived from the same visual style anchor.
- **Content:** launch-day social posts in the meme's voice.
- **Telegram:** webhook-ready bot activation so the meme can talk outside the app.
- **Four.Meme Export:** launch kit with copy, lore, ticker, image, and final deployment CTA.
- **BNB Proof:** deterministic soul hash plus optional BNB testnet transaction through `VividSoulRegistry`.

The core moat is consistency: every output is derived from one canonical character spec, not generated independently.

## Architecture

```text
Next.js 16 App Router
  |
  +-- /api/generate            CharacterSpec + first content batch via DGrid / GPT-4o
  +-- /api/chat                In-character conversation
  +-- /api/content             More social posts
  +-- /api/images              Pollinations image URLs
  +-- /api/session             Session retrieval
  +-- /api/session/all         Recent living memes
  +-- /api/soul/metadata       Canonical soul metadata + hash
  +-- /api/telegram/webhook    Telegram persona webhook
  +-- /api/demo/seed           Judge-safe demo seed
  |
  +-- Upstash Redis            Durable session + Telegram chat binding
  +-- Zod                      Runtime schema validation
  +-- VividSoulRegistry.sol    BNB testnet soul proof contract
```

## Stack

- Next.js 16, React 19, Tailwind CSS 4
- DGrid AI Gateway with GPT-4o
- Pollinations.ai for image generation
- Upstash Redis / Vercel KV for persistence
- viem for BNB transaction encoding
- Solidity `VividSoulRegistry` for soul anchoring
- Vercel for deployment

## Local Setup

```bash
git clone https://github.com/dolepee/vivid.git
cd vivid
npm install
cp .env.local.example .env.local
npm run dev
```

Required:

```bash
DGRID_API_KEY=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

Optional for BNB proof:

```bash
NEXT_PUBLIC_VIVID_SOUL_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_VIVID_DEMO_SOUL_TX_HASH=0x...
BNB_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
DEPLOYER_PRIVATE_KEY=...
```

Optional for Telegram:

```bash
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=...
TELEGRAM_BOT_TOKEN=...
```

## Deploy BNB Soul Registry

Fund the deployer with BNB testnet gas, then run:

```bash
DEPLOYER_PRIVATE_KEY=0x... npm run deploy:soul
```

The script prints:

- deployment transaction
- contract address
- the exact `NEXT_PUBLIC_VIVID_SOUL_REGISTRY_ADDRESS` value to set in Vercel

Contract source: `contracts/VividSoulRegistry.sol`

## Telegram Webhook

After setting `TELEGRAM_BOT_TOKEN`, point the bot webhook at:

```text
https://vividmeme.vercel.app/api/telegram/webhook
```

Example setup:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook?url=https://vividmeme.vercel.app/api/telegram/webhook"
```

Each meme page creates a Telegram deep link with:

```text
https://t.me/<bot>?start=vivid_<memeId>
```

That binds the chat to the meme session and routes future messages through the same character prompt.

## Demo Flow

1. Open `/demo`.
2. Run the Pandaudit demo.
3. Show the canonical genome and consistency proof.
4. Ask the meme for its origin story in chat.
5. Generate or show visuals.
6. Open the Proof section and show the deterministic soul hash.
7. Anchor on BNB testnet if the registry address is configured.
8. Open the Telegram activation link if bot env is configured.
9. Export the launch kit for Four.Meme.

## Hackathon Positioning

VIVID is not just another launch-kit generator.

**Pitch:** Four.Meme lets anyone launch a token. VIVID gives that token a persistent AI soul: identity, lore, voice, visuals, memory, Telegram presence, and BNB-chain proof.

Built for the Four.Meme AI Sprint on DoraHacks.
