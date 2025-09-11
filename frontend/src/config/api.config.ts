// src/config/api.config.ts
import type { APIConfig } from '../services/api/factories/APIServiceFactory'

export const API_CONFIG: Record<string, APIConfig> = {
  development: {
    environment: 'development',
    ipfsBaseUrl: import.meta.env.VITE_IPFS_BASE_URL || 'http://localhost:3001',
    timeout: 10000
  },
  production: {
    environment: 'production',
    ipfsBaseUrl: import.meta.env.VITE_IPFS_BASE_URL || 'https://api.ludopoly.game',
    apiKey: import.meta.env.VITE_API_KEY,
    timeout: 15000
  },
  test: {
    environment: 'test',
    ipfsBaseUrl: import.meta.env.VITE_IPFS_BASE_URL || 'http://localhost:3001',
    timeout: 5000
  }
}

export const getCurrentAPIConfig = (): APIConfig => {
  const env = import.meta.env.MODE || 'development'
  const config = API_CONFIG[env] || API_CONFIG.development
  
  // Debug logging in development
  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    console.log('API Config:', config)
  }
  
  return config
}

// Blockchain configuration
export const BLOCKCHAIN_CONFIG = {
  chainId: parseInt(import.meta.env.VITE_CHAIN_ID || '5'),
  network: import.meta.env.VITE_BLOCKCHAIN_NETWORK || 'ethereum-testnet',
  rpcUrl: import.meta.env.VITE_RPC_URL,
  contracts: {
    game: import.meta.env.VITE_GAME_CONTRACT_ADDRESS,
    token: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS
  }
}

// IPFS configuration
export const IPFS_CONFIG = {
  gateway: import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
  pinataApiKey: import.meta.env.VITE_PINATA_API_KEY,
  pinataSecretKey: import.meta.env.VITE_PINATA_SECRET_KEY
}

// Environment değişkenleri için type safety
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_KEY?: string
    readonly VITE_API_BASE_URL?: string
    readonly VITE_BLOCKCHAIN_NETWORK?: string
    readonly VITE_CHAIN_ID?: string
    readonly VITE_RPC_URL?: string
    readonly VITE_IPFS_GATEWAY?: string
    readonly VITE_PINATA_API_KEY?: string
    readonly VITE_PINATA_SECRET_KEY?: string
    readonly VITE_GAME_CONTRACT_ADDRESS?: string
    readonly VITE_TOKEN_CONTRACT_ADDRESS?: string
    readonly VITE_DEBUG_MODE?: string
    readonly VITE_LOG_LEVEL?: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}
