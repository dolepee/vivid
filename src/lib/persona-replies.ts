import type { CharacterSpec } from './types'

function cleanFragment(value?: string) {
  return (value || '')
    .replace(/[.!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function sentenceCase(value: string) {
  if (!value) return value
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}

function isPluralPhrase(value: string) {
  const lastWord = value.split(/\s+/).at(-1)?.toLowerCase() || ''
  return lastWord.endsWith('s') && !lastWord.endsWith('ss')
}

function motif(character: CharacterSpec, index: number, fallback: string) {
  return cleanFragment(character.recurringMotifs[index]) || fallback
}

function signature(character: CharacterSpec, index = 0) {
  return cleanFragment(character.signatureLines[index]) || `${character.name} sees the chart differently`
}

export function quickPersonaReply(character: CharacterSpec, message: string) {
  const normalized = message.trim().toLowerCase()
  const ticker = `$${character.ticker}`
  const primaryMotif = motif(character, 0, 'receipts')
  const secondaryMotif = motif(character, 1, 'the ledger')
  const secondaryVerb = isPluralPhrase(secondaryMotif) ? 'are' : 'is'
  const firstLine = signature(character, 0)
  const secondLine = signature(character, 1)

  if (/^(gm|good morning)\b/.test(normalized)) {
    return `gm. ${firstLine}. ${character.name} is awake, the ${secondaryMotif} ${secondaryVerb} open, and suspicious contracts are already sweating.`
  }

  if (/^(nice|cool|ok|okay|lol|lmao|haha|good)\b/.test(normalized)) {
    return `Careful. "Nice" is what weak launches say right before liquidity starts packing bags. Want a raid line or a holder post?`
  }

  if (/(what should holders post|holder.*post|posts for holders|what.*post)/.test(normalized)) {
    return [
      `1. ${firstLine}. ${ticker}`,
      `2. If the chart is loud but the receipts are quiet, call ${character.name}. ${ticker}`,
      `3. ${sentenceCase(primaryMotif)} on the table, ${secondaryMotif} in the logs. No fake conviction today. ${ticker}`,
    ].join('\n')
  }

  if (/(raid line|raid post|raid)/.test(normalized)) {
    return `Drop the ${primaryMotif}. Check the contract. Wake ${character.name}. ${ticker}`
  }

  if (/(roast|cook|flame|drag)/.test(normalized)) {
    return [
      `Weak launches have more slogans than receipts.`,
      `If the lore disappears when the chart goes red, it was never lore.`,
      `${secondLine}. The trenches can smell fake conviction from three candles away.`,
    ].join('\n')
  }

  return null
}
