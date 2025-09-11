// Single Responsibility: Her interface tek bir sorumluluğa sahip

export interface IWalletConnection {
  connect(): Promise<void>
  disconnect(): void
  getAddress(): string | null
  getBalance(): Promise<string | null>
  getChainId(): Promise<number | null>
  isInstalled(): boolean
}

export interface IWalletProvider {
  id: string
  name: string
  icon: string
  description: string
  downloadUrl?: string
  createConnection(): IWalletConnection
}

export interface IWalletConnectionState {
  isConnected: boolean
  address: string | null
  balance: string | null
  chainId: number | null
  isConnecting: boolean
  error: string | null
}

export interface IWalletService {
  connectWallet(providerId: string): Promise<void>
  disconnectWallet(): void
  getConnectionState(): IWalletConnectionState
  switchNetwork(chainId: number): Promise<void>
  onStateChange(callback: (state: IWalletConnectionState) => void): void
}
