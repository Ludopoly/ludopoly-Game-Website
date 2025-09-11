import type { 
  IWalletService, 
  IWalletConnectionState, 
  IWalletConnection 
} from '../interfaces/IWallet'
import { WalletProviderFactory } from '../providers/WalletProviders'
import { AccountService } from '../../../services/blockchain/AccountService'

// Single Responsibility: Sadece wallet bağlantı durumunu yönetir
export class WalletService implements IWalletService {
  private state: IWalletConnectionState = {
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isConnecting: false,
    error: null
  }

  private currentConnection: IWalletConnection | null = null
  private stateChangeCallbacks: ((state: IWalletConnectionState) => void)[] = []
  private accountService: AccountService

  constructor() {
    this.accountService = new AccountService()
  }

  async connectWallet(providerId: string): Promise<void> {
    const provider = WalletProviderFactory.getProvider(providerId)
    if (!provider) {
      this.updateState({ error: `Provider ${providerId} not found` })
      return
    }

    this.updateState({ isConnecting: true, error: null })

    try {
      const connection = provider.createConnection()
      
      if (!connection.isInstalled()) {
        throw new Error(`${provider.name} is not installed`)
      }

      await connection.connect()
      
      // Get connection details
      const address = await this.getAccountAddress(connection)
      const balance = await connection.getBalance()
      const chainId = await connection.getChainId()

      this.currentConnection = connection
      this.updateState({
        isConnected: true,
        address,
        balance,
        chainId,
        isConnecting: false,
        error: null
      })

      this.setupEventListeners()
    } catch (error: any) {
      this.updateState({
        isConnecting: false,
        error: error.message || 'Connection failed'
      })
      throw error
    }
  }

  disconnectWallet(): void {
    if (this.currentConnection) {
      this.currentConnection.disconnect()
      this.currentConnection = null
    }

    // localStorage'ı da temizle
    try {
      localStorage.removeItem('walletAddress')
      console.log('WalletService: Cleared walletAddress from localStorage on disconnect')
    } catch (error) {
      console.error('WalletService: Error clearing localStorage:', error)
    }

    this.updateState({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
      isConnecting: false,
      error: null
    })
  }

  getConnectionState(): IWalletConnectionState {
    return { ...this.state }
  }

  async switchNetwork(chainId: number): Promise<void> {
    if (!this.currentConnection) {
      throw new Error('No wallet connected')
    }

    // Implementation would depend on wallet type
    // This is a simplified version
    try {
      const ethereum = (window as any).ethereum
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (error: any) {
      throw new Error(`Failed to switch network: ${error.message}`)
    }
  }

  onStateChange(callback: (state: IWalletConnectionState) => void): void {
    this.stateChangeCallbacks.push(callback)
  }

  // Account Service Integration
  async hasBlockchainAccount(address: string): Promise<boolean> {
    try {
      return await this.accountService.hasAccount(address)
    } catch (error) {
      console.error('Error checking blockchain account:', error)
      return false
    }
  }

  async getBlockchainAccount(address: string): Promise<any> {
    try {
      return await this.accountService.getAccountByAddress(address)
    } catch (error) {
      console.error('Error getting blockchain account:', error)
      return null
    }
  }

  async createBlockchainAccount(handle: string, metadataCID: string): Promise<bigint | null> {
    try {
      return await this.accountService.createAccount(handle, metadataCID)
    } catch (error) {
      console.error('Error creating blockchain account:', error)
      return null
    }
  }

  getAccountService(): AccountService {
    return this.accountService
  }

  private async getAccountAddress(_connection: IWalletConnection): Promise<string | null> {
    try {
      const ethereum = (window as any).ethereum
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      return accounts[0] || null
    } catch (error) {
      console.error('Error getting account address:', error)
      return null
    }
  }

  private updateState(updates: Partial<IWalletConnectionState>): void {
    this.state = { ...this.state, ...updates }
    this.stateChangeCallbacks.forEach(callback => callback(this.state))
  }

  private setupEventListeners(): void {
    const ethereum = (window as any).ethereum
    if (!ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnectWallet()
      } else {
        this.updateState({ address: accounts[0] })
      }
    }

    const handleChainChanged = (chainId: string) => {
      this.updateState({ chainId: parseInt(chainId, 16) })
    }

    ethereum.on('accountsChanged', handleAccountsChanged)
    ethereum.on('chainChanged', handleChainChanged)
  }
}
