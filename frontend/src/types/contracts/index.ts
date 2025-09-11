// Contract Types Barrel File
export * from './AccountFacet';
export * from './ProfileFacet';

// Contract Addresses (Diamond proxy pattern - tek adres üzerinden tüm facet'lara erişim)
export const CONTRACT_ADDRESSES = {
  DIAMOND_PROXY:'0xbE0422FE36fa90bE0367Ec0145466B71AA6f8Bc4',
  // Tüm facet'lar aynı diamond proxy adresini kullanıyor
  ACCOUNT_FACET: import.meta.env.VITE_DIAMOND_PROXY_ADDRESS || '',
  PROFILE_FACET: import.meta.env.VITE_DIAMOND_PROXY_ADDRESS || '',
} as const;

// Network Chain IDs
export const SUPPORTED_CHAIN_IDS = {
  ETHEREUM_MAINNET: 1,
  ETHEREUM_GOERLI: 5,
  ETHEREUM_SEPOLIA: 11155111,
  POLYGON_MAINNET: 137,
  POLYGON_MUMBAI: 80001,
  // Diğer network'leri buraya ekleyebilirsiniz
} as const;

export type SupportedChainId = typeof SUPPORTED_CHAIN_IDS[keyof typeof SUPPORTED_CHAIN_IDS];
