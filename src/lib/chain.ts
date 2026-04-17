export const BNB_TESTNET_CHAIN_ID = 97
export const BNB_TESTNET_CHAIN_ID_HEX = '0x61'
export const BNB_TESTNET_EXPLORER = 'https://testnet.bscscan.com'

export const BNB_TESTNET_PARAMS = {
  chainId: BNB_TESTNET_CHAIN_ID_HEX,
  chainName: 'BNB Smart Chain Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
  blockExplorerUrls: [BNB_TESTNET_EXPLORER],
}

export const VIVID_SOUL_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_VIVID_SOUL_REGISTRY_ADDRESS as `0x${string}` | undefined

export const VIVID_DEMO_SOUL_TX_HASH =
  process.env.NEXT_PUBLIC_VIVID_DEMO_SOUL_TX_HASH as `0x${string}` | undefined

export const TELEGRAM_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
