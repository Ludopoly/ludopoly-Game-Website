/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ACCOUNT_FACET_ADDRESS: string
  readonly VITE_PROFILE_FACET_ADDRESS: string
  readonly VITE_ACCOUNT_CREATION_DOMAIN: string
  readonly VITE_IPFS_BASE_URL: string
  readonly VITE_API_KEY: string
  // Diğer environment variable'ları buraya ekleyebilirsiniz
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
