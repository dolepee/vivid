import OpenAI from 'openai'

/** DGrid AI gateway — OpenAI-compatible inference. */
export const ai = new OpenAI({
  baseURL: 'https://api.dgrid.ai/v1',
  apiKey: process.env.DGRID_API_KEY,
})

/** Default text model (ChatGPT via DGrid). */
export const TEXT_MODEL = 'openai/gpt-4o'
