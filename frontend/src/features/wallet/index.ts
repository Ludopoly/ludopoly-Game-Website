// SOLID Principles compliant exports
export { WalletProvider, useWalletContext } from './context/WalletProviderSOLID'
export { ReduxWalletProvider, useReduxWallet } from './context/ReduxWalletProvider'
export { default as WalletConnect } from './components/WalletConnect'
export { WalletService } from './services/WalletService'
export { 
  WalletProviderFactory, 
  MetaMaskProvider, 
  WalletConnectProvider, 
  CoinbaseWalletProvider, 
 
} from './providers/WalletProviders'
export * from './interfaces/IWallet'
export * from './types'
