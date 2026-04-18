# VIVID

Living Meme AI for Four.Meme.

VIVID turns one prompt into a persistent meme character with a name, ticker, lore, voice, visuals, social copy, Telegram presence, Four.Meme launch export, and optional BNB-chain soul proof.

Live app: https://vividmeme.vercel.app

## What VIVID Does

- Creates a coherent meme identity from a single concept.
- Generates lore, origin story, personality, tone, motifs, and launch copy.
- Produces AI-generated meme visuals tied to the same character spec.
- Lets users chat with the meme in character.
- Generates social posts, replies, captions, raid lines, and Telegram-style messages.
- Exports a Four.Meme-ready launch kit.
- Computes a deterministic soul hash for the full character package.
- Supports optional BNB Testnet anchoring through `VividSoulRegistry`.
- Supports optional Telegram bot activation for live community interaction.

The main design principle is consistency: identity, chat, visuals, posts, Telegram behavior, and launch copy all derive from one canonical character spec.

## Architecture

```text
Next.js App Router
  |
  +-- /api/generate          character + initial content generation
  +-- /api/chat              in-character chat
  +-- /api/content           additional meme content
  +-- /api/images            meme image generation
  +-- /api/session           session retrieval
  +-- /api/session/all       recent meme sessions
  +-- /api/soul/metadata     canonical metadata + soul hash
  +-- /api/telegram/webhook  Telegram persona webhook
  |
  +-- Redis                  durable meme/session storage
  +-- Zod                    runtime schema validation
  +-- viem                   BNB transaction encoding
  +-- VividSoulRegistry      optional BNB soul proof contract
```

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- DGrid AI Gateway
- Pollinations image generation
- Upstash Redis / Vercel KV
- viem
- Solidity
- Vercel

## Local Development

```bash
git clone https://github.com/dolepee/vivid.git
cd vivid
npm install
cp .env.local.example .env.local
npm run dev
```

Set the required values in `.env.local` before running the full app.

```bash
DGRID_API_KEY=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

Optional integrations are documented in `.env.local.example`.

## Scripts

```bash
npm run dev          # local development
npm run build        # production build
npm run lint         # lint checks
npm run deploy:soul  # deploy VividSoulRegistry to BNB Testnet
```

## BNB Soul Proof

VIVID can hash a meme's canonical package and anchor that hash on BNB Testnet.

The anchored payload includes:

- character identity
- lore and personality fields
- image URLs
- generated content feed
- metadata URL
- deterministic soul hash

Contract source: `contracts/VividSoulRegistry.sol`

This proof is not a token launch, liquidity action, or treasury system. It is a verifiable record that a specific meme identity existed with a specific canonical character package.

## Telegram

VIVID can bind a Telegram chat to a meme session through the Telegram webhook route:

```text
/api/telegram/webhook
```

When enabled, each meme can expose a Telegram deep link that routes future messages through the same character spec used by the app.

## Project Positioning

Four.Meme makes token launch easy. VIVID gives a meme token a persistent AI identity before launch: a character that can speak, post, export, and prove its canonical soul on-chain.
