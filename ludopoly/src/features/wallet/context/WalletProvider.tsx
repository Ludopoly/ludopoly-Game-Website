import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { WalletContextType, WalletState } from '../types'

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const useWalletContext = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: React.ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isConnecting: false,
    error: null,
  })

  // MetaMask varlığını kontrol et
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
  }

  // Cüzdan bağlantısını kontrol et
  const checkConnection = useCallback(async () => {
    if (!isMetaMaskInstalled()) return

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      
      if (accounts.length > 0) {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        })
        
        setWalletState({
          isConnected: true,
          address: accounts[0],
          balance: (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4),
          chainId: parseInt(chainId, 16),
          isConnecting: false,
          error: null,
        })
      }
    } catch (error) {
      console.error('Cüzdan kontrol hatası:', error)
    }
  }, [])

  // Cüzdan bağla
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setWalletState(prev => ({
        ...prev,
        error: 'MetaMask yüklü değil. Lütfen MetaMask\'ı indirin.'
      }))
      return
    }

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      })

      setWalletState({
        isConnected: true,
        address: accounts[0],
        balance: (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4),
        chainId: parseInt(chainId, 16),
        isConnecting: false,
        error: null,
      })
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Cüzdan bağlantısı başarısız'
      }))
    }
  }, [])

  // Cüzdan bağlantısını kes
  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
      isConnecting: false,
      error: null,
    })
  }, [])

  // Ağ değiştir
  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (!isMetaMaskInstalled()) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Ağ mevcut değilse ekle
        console.log('Ağ bulunamadı, ekleme gerekiyor')
      }
      throw error
    }
  }, [])

  // Event listener'ları ekle
  useEffect(() => {
    if (!isMetaMaskInstalled()) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        checkConnection()
      }
    }

    const handleChainChanged = () => {
      checkConnection()
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    // İlk kontrol
    checkConnection()

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [checkConnection, disconnectWallet])

  const contextValue: WalletContextType = {
    ...walletState,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// Global tip tanımlaması
declare global {
  interface Window {
    ethereum?: any
  }
}

export default WalletProvider
