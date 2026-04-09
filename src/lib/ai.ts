import OpenAI from 'openai'

/** OpenRouter client using OpenAI SDK compatibility. */
export const ai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

/** Free/cheap model for text generation. */
export const TEXT_MODEL = 'google/gemini-2.0-flash-exp:free'

/** Image generation via OpenRouter (Flux). */
export const IMAGE_MODEL = 'google/gemini-2.0-flash-exp:free'
