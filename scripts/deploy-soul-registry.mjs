import fs from 'node:fs'
import path from 'node:path'
import solc from 'solc'
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const privateKey = process.env.DEPLOYER_PRIVATE_KEY
const rpcUrl = process.env.BNB_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545'

if (!privateKey) {
  throw new Error('DEPLOYER_PRIVATE_KEY is required')
}

const bnbTestnet = defineChain({
  id: 97,
  name: 'BNB Smart Chain Testnet',
  nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
  blockExplorers: {
    default: { name: 'BscScan Testnet', url: 'https://testnet.bscscan.com' },
  },
})

const contractPath = path.resolve('contracts/VividSoulRegistry.sol')
const source = fs.readFileSync(contractPath, 'utf8')

const input = {
  language: 'Solidity',
  sources: {
    'VividSoulRegistry.sol': { content: source },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object'],
      },
    },
  },
}

const output = JSON.parse(solc.compile(JSON.stringify(input)))
const errors = output.errors?.filter(error => error.severity === 'error') || []
if (errors.length > 0) {
  console.error(errors)
  throw new Error('Solidity compilation failed')
}

const contract = output.contracts['VividSoulRegistry.sol'].VividSoulRegistry
const account = privateKeyToAccount(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`)
const transport = http(rpcUrl)
const walletClient = createWalletClient({ account, chain: bnbTestnet, transport })
const publicClient = createPublicClient({ chain: bnbTestnet, transport })

console.log(`Deploying VividSoulRegistry from ${account.address}...`)

const hash = await walletClient.deployContract({
  abi: contract.abi,
  bytecode: `0x${contract.evm.bytecode.object}`,
})

console.log(`Transaction: https://testnet.bscscan.com/tx/${hash}`)

const receipt = await publicClient.waitForTransactionReceipt({ hash })

console.log(`Contract: ${receipt.contractAddress}`)
console.log(`Set NEXT_PUBLIC_VIVID_SOUL_REGISTRY_ADDRESS=${receipt.contractAddress}`)

