import type { IWalletProvider, IWalletConnection } from '../interfaces/IWallet'
import { MetaMaskConnection } from '../connections/MetaMaskConnection'

// Single Responsibility: Sadece MetaMask provider bilgilerini yönetir
export class MetaMaskProvider implements IWalletProvider {
  readonly id = 'metamask'
  readonly name = 'MetaMask'
  readonly icon = '/assets/logos/metamask.png' // PNG logo
  readonly description = 'Most popular Ethereum wallet'
  readonly downloadUrl = 'https://metamask.io/download/'

  createConnection(): IWalletConnection {
    return new MetaMaskConnection()
  }
}

// WalletConnect Provider
export class WalletConnectProvider implements IWalletProvider {
  readonly id = 'walletconnect'
  readonly name = 'WalletConnect'
  readonly icon = '/assets/logos/walletconnect.png' // PNG logo
  readonly description = 'Connect any mobile wallet'
  readonly downloadUrl = 'https://walletconnect.com/'

  createConnection(): IWalletConnection {
    // WalletConnect implementation would go here
    // For now, return a mock that shows it's not implemented
    return {
      connect: async () => { throw new Error('WalletConnect not implemented yet') },
      disconnect: () => {},
      getAddress: () => null,
      getBalance: async () => null,
      getChainId: async () => null,
      isInstalled: () => true, // WalletConnect doesn't need installation
    }
  }
}

// Coinbase Wallet Provider
export class CoinbaseWalletProvider implements IWalletProvider {
  readonly id = 'coinbase'
  readonly name = 'Coinbase Wallet'
  readonly icon = '/assets/logos/coinbase.png' // PNG logo
  readonly description = 'Coinbase official wallet'
  readonly downloadUrl = 'https://www.coinbase.com/wallet'

  createConnection(): IWalletConnection {
    // Coinbase Wallet implementation would go here
    return {
      connect: async () => { throw new Error('Coinbase Wallet not implemented yet') },
      disconnect: () => {},
      getAddress: () => null,
      getBalance: async () => null,
      getChainId: async () => null,
      isInstalled: () => typeof (window as any).ethereum?.isCoinbaseWallet !== 'undefined',
    }
  }
}
// Factory pattern - Open/Closed principle
export class WalletProviderFactory {
  private static providers: Map<string, IWalletProvider> = new Map()

  static {
    // Initialize providers
    this.providers.set('metamask', new MetaMaskProvider())
    this.providers.set('walletconnect', new WalletConnectProvider())
    this.providers.set('coinbase', new CoinbaseWalletProvider())
  }

  static getProvider(id: string): IWalletProvider | null {
    return this.providers.get(id) || null
  }

  static getAllProviders(): IWalletProvider[] {
    return Array.from(this.providers.values())
  }

  // Open for extension - yeni provider'lar eklenebilir
  static registerProvider(provider: IWalletProvider): void {
    this.providers.set(provider.id, provider)
  }
}
