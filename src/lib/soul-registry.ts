export const VIVID_SOUL_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'anchorSoul',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'memeId', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'ticker', type: 'string' },
      { name: 'metadataURI', type: 'string' },
      { name: 'specHash', type: 'bytes32' },
    ],
    outputs: [{ name: 'soulId', type: 'bytes32' }],
  },
  {
    type: 'event',
    name: 'SoulAnchored',
    anonymous: false,
    inputs: [
      { name: 'soulId', type: 'bytes32', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'specHash', type: 'bytes32', indexed: true },
      { name: 'memeId', type: 'string', indexed: false },
      { name: 'name', type: 'string', indexed: false },
      { name: 'ticker', type: 'string', indexed: false },
      { name: 'metadataURI', type: 'string', indexed: false },
    ],
  },
] as const

