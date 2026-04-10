import OpenAI from 'openai'

/** Bankr LLM gateway — primary client. */
export const ai = new OpenAI({
  baseURL: 'https://llm.bankr.bot/v1',
  apiKey: process.env.BANKR_LLM_KEY,
  defaultHeaders: { 'X-API-Key': process.env.BANKR_LLM_KEY || '' },
})

/** Default text model. */
export const TEXT_MODEL = 'deepseek-v3.2'
