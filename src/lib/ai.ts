import OpenAI from 'openai'

/** OpenRouter client — free tier for everyday generation. */
export const ai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

/** Bankr client — paid credits for higher quality output. */
export const aiq = new OpenAI({
  baseURL: 'https://llm.bankr.bot/v1',
  apiKey: process.env.BANKR_LLM_KEY,
  defaultHeaders: { 'X-API-Key': process.env.BANKR_LLM_KEY || '' },
})

/** Free model for everyday text generation. */
export const TEXT_MODEL = 'google/gemini-2.0-flash-exp:free'

/** Quality model via Bankr when it matters. */
export const QUALITY_MODEL = 'deepseek-v3.2'

/** Image generation via Pollinations (free). */
export const IMAGE_MODEL = 'google/gemini-2.0-flash-exp:free'
