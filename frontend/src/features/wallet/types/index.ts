export interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  chainId: number | null
  isConnecting: boolean
  error: string | null
}

export interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
}

export type SupportedWallet = 'metamask' | 'walletconnect' | 'coinbase' | 'trustwallet'

export interface WalletProvider {
  id: SupportedWallet
  name: string
  icon: string
  description: string
  isInstalled?: boolean
  downloadUrl?: string
}
