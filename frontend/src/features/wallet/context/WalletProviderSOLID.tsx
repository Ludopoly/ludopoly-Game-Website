import React, { createContext, useContext, useState, useEffect } from 'react'
import type { IWalletConnectionState } from '../interfaces/IWallet'
import { WalletService } from '../services/WalletService'

// Dependency Inversion: High-level module (context) depends on abstraction (IWalletService)
interface WalletContextType extends IWalletConnectionState {
  connectWallet: (providerId: string) => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: React.ReactNode
  walletService?: WalletService // Dependency injection for testing
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ 
  children, 
  walletService = new WalletService() 
}) => {
  const [state, setState] = useState<IWalletConnectionState>(() => 
    walletService.getConnectionState()
  )

  useEffect(() => {
    // Subscribe to state changes
    walletService.onStateChange(setState)

    // Check for existing connection
    const checkExistingConnection = async () => {
      try {
        const ethereum = (window as any).ethereum
        if (ethereum) {
          const accounts = await ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            // Auto-connect if already authorized
            await walletService.connectWallet('metamask')
          }
        }
      } catch (error) {
        console.warn('Failed to check existing connection:', error)
      }
    }

    checkExistingConnection()
  }, [walletService])

  const contextValue: WalletContextType = {
    ...state,
    connectWallet: (providerId: string) => walletService.connectWallet(providerId),
    disconnectWallet: () => walletService.disconnectWallet(),
    switchNetwork: (chainId: number) => walletService.switchNetwork(chainId),
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWalletContext = (): WalletContextType => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider')
  }
  return context
}
