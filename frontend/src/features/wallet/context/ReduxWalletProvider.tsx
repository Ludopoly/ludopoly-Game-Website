import React, { useEffect, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { setWalletService, updateConnectionState, selectWalletState } from '../../../store/slices/walletSlice'
import { setWalletAddress, checkUserAccount, clearAuthState } from '../../../store/slices/authSlice'
import { WalletService } from '../services/WalletService'

interface ReduxWalletProviderProps {
  children: ReactNode
}

// Redux-aware WalletProvider - SOLID prensiplerine uygun
export const ReduxWalletProvider: React.FC<ReduxWalletProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Dependency Injection - Service'i Redux store'a inject et
    const walletService = new WalletService()
    dispatch(setWalletService(walletService))

    // Service state değişikliklerini Redux'a sync et
    walletService.onStateChange((newState) => {
      dispatch(updateConnectionState(newState))
    })

    // Auto-connect check - Manuel disconnect kontrolü ile
    const checkAutoConnect = async () => {
      try {
        // Önce manuel disconnect kontrolü yap
        const manualDisconnect = localStorage.getItem('manualDisconnect')
        if (manualDisconnect === 'true') {
          console.log('🔵 ReduxWalletProvider: Manual disconnect detected, skipping auto-connect')
          console.log('🔵 ReduxWalletProvider: Clearing manual disconnect flag (checked by wallet provider)')
          localStorage.removeItem('manualDisconnect')
          return
        }

        // WalletAddress yoksa da auto-connect yapma (manuel disconnect sonrası durum)
        const walletAddress = localStorage.getItem('walletAddress')
        if (!walletAddress) {
          console.log('🔵 ReduxWalletProvider: No wallet address in localStorage, skipping auto-connect')
          return
        }

        const ethereum = (window as any).ethereum
        if (ethereum) {
          const accounts = await ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            console.log('🔵 ReduxWalletProvider: Auto-connecting to MetaMask')
            // Otomatik olarak MetaMask'a bağlan
            await walletService.connectWallet('metamask')
          }
        }
      } catch (error) {
        console.log('Auto-connect failed:', error)
      }
    }

    checkAutoConnect()
  }, [dispatch])

  return <>{children}</>
}

// Redux-based wallet hooks
export const useReduxWallet = () => {
  const dispatch = useAppDispatch()
  const walletState = useAppSelector(selectWalletState)
  const authState = useAppSelector((state: any) => state.auth)

  return {
    ...walletState,
    authState,
    // Wallet bağlama ve blockchain hesap kontrolü
    connectWallet: async (providerId: string) => {
      if (walletState.service) {
        try {
          // 1. Wallet'ı bağla
          await walletState.service.connectWallet(providerId)
          
          // 2. Bağlantı başarılıysa, güncel state'i al
          const currentState = walletState.service.getConnectionState()
          
          if (currentState.isConnected && currentState.address) {
            console.log('Wallet connected successfully:', currentState.address)
            
            // Auth slice'a wallet adresini ayarla
            dispatch(setWalletAddress(currentState.address))
            
            // Blockchain'de kullanıcı hesabını kontrol et
            dispatch(checkUserAccount(currentState.address))
          } else {
            console.error('Wallet connection failed - no address')
          }
        } catch (error) {
          console.error('Connect wallet error:', error)
          // TODO: Snackbar ile hata göster
        }
      } else {
        console.error('Wallet service not available')
      }
    },
    disconnectWallet: () => {
      if (walletState.service) {
        walletState.service.disconnectWallet()
        // Auth state'i temizle - clearAuthState manuel disconnect flag'ini set eder
        dispatch(clearAuthState())
      }
    },
    switchNetwork: async (chainId: number) => {
      if (walletState.service) {
        try {
          await walletState.service.switchNetwork(chainId)
        } catch (error) {
          console.error('Switch network error:', error)
          // TODO: Snackbar ile hata göster
        }
      }
    }
  }
}
