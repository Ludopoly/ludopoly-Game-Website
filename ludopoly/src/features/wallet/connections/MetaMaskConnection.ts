import type { IWalletConnection } from '../interfaces/IWallet'

// Single Responsibility: Sadece MetaMask bağlantısından sorumlu
export class MetaMaskConnection implements IWalletConnection {
  private ethereum: any

  constructor() {
    this.ethereum = (window as any).ethereum
  }

  async connect(): Promise<void> {
    if (!this.isInstalled()) {
      throw new Error('MetaMask is not installed')
    }

    try {
      await this.ethereum.request({
        method: 'eth_requestAccounts'
      })
    } catch (error: any) {
      throw new Error(`Failed to connect: ${error.message}`)
    }
  }

  disconnect(): void {
    // MetaMask doesn't have a programmatic disconnect
    // This would typically clear local state
  }

  getAddress(): string | null {
    // This should be called after connect
    return null // Implementation would get current account
  }

  async getBalance(): Promise<string | null> {
    if (!this.isInstalled()) return null

    try {
      const accounts = await this.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length === 0) return null

      const balance = await this.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      })

      return (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
    } catch (error) {
      console.error('Error getting balance:', error)
      return null
    }
  }

  async getChainId(): Promise<number | null> {
    if (!this.isInstalled()) return null

    try {
      const chainId = await this.ethereum.request({ method: 'eth_chainId' })
      return parseInt(chainId, 16)
    } catch (error) {
      console.error('Error getting chain ID:', error)
      return null
    }
  }

  isInstalled(): boolean {
    return typeof window !== 'undefined' && 
           typeof this.ethereum !== 'undefined' && 
           this.ethereum.isMetaMask
  }
}
