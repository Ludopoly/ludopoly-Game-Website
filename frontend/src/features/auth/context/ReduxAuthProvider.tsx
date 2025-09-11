import React, { useEffect, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { checkAuthStatus, loginUser, registerUser, logoutUser, clearAuthState } from '../../../store/slices/authSlice'
import { selectAuthState } from '../../../store/slices/authSlice'

interface ReduxAuthProviderProps {
  children: ReactNode
}

// Redux-aware AuthProvider
export const ReduxAuthProvider: React.FC<ReduxAuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Sadece ilk mount'ta auth durumunu kontrol et
    console.log('🟠 ReduxAuthProvider: Starting auth check on mount')
    let lastAccount = ''
    let lastChainId = ''
    let hasCheckedAuth = false
    dispatch(checkAuthStatus())

    // Wallet event listener'larını ekle
    const setupWalletListeners = () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum

        const handleAccountsChanged = (accounts: string[]) => {
          console.log('ReduxAuthProvider - Accounts changed:', accounts)
          if (accounts.length === 0) {
            // Cüzdan bağlantısı kesildi - state'i hızlıca temizle
            console.log('ReduxAuthProvider - Wallet disconnected, clearing auth state')
            dispatch(clearAuthState())
            lastAccount = ''
            hasCheckedAuth = false
          } else if (accounts.length > 0) {
            const newAddress = accounts[0]
            if (newAddress !== lastAccount) {
              // Sadece gerçekten değiştiyse dispatch et
              console.log('ReduxAuthProvider - New account selected:', newAddress)
              dispatch(loginUser(newAddress))
              lastAccount = newAddress
              hasCheckedAuth = false
            } else {
              console.log('ReduxAuthProvider - Account did not change, no dispatch')
            }
          }
        }

        const handleChainChanged = (chainId: string) => {
          if (chainId !== lastChainId) {
            console.log('ReduxAuthProvider - Chain changed, refreshing auth state')
            dispatch(checkAuthStatus())
            lastChainId = chainId
            hasCheckedAuth = false
          } else {
            console.log('ReduxAuthProvider - Chain did not change, no dispatch')
          }
        }

        const handleDisconnect = () => {
          console.log('ReduxAuthProvider - Wallet disconnected')
          dispatch(clearAuthState())
          lastAccount = ''
          hasCheckedAuth = false
        }

        // Modern event listener API'sini kullan
        try {
          if (ethereum.addEventListener) {
            ethereum.addEventListener('accountsChanged', handleAccountsChanged)
            ethereum.addEventListener('chainChanged', handleChainChanged)
            ethereum.addEventListener('disconnect', handleDisconnect)
            console.log('ReduxAuthProvider - Event listeners added with addEventListener')
            return () => {
              ethereum.removeEventListener('accountsChanged', handleAccountsChanged)
              ethereum.removeEventListener('chainChanged', handleChainChanged)
              ethereum.removeEventListener('disconnect', handleDisconnect)
            }
          } else if (ethereum.addListener) {
            ethereum.addListener('accountsChanged', handleAccountsChanged)
            ethereum.addListener('chainChanged', handleChainChanged)
            ethereum.addListener('disconnect', handleDisconnect)
            console.log('ReduxAuthProvider - Event listeners added with addListener')
            return () => {
              ethereum.removeListener('accountsChanged', handleAccountsChanged)
              ethereum.removeListener('chainChanged', handleChainChanged)
              ethereum.removeListener('disconnect', handleDisconnect)
            }
          } else if (ethereum.on) {
            ethereum.on('accountsChanged', handleAccountsChanged)
            ethereum.on('chainChanged', handleChainChanged)
            ethereum.on('disconnect', handleDisconnect)
            console.log('ReduxAuthProvider - Event listeners added with .on')
            return () => {
              ethereum.removeListener('accountsChanged', handleAccountsChanged)
              ethereum.removeListener('chainChanged', handleChainChanged)
              ethereum.removeListener('disconnect', handleDisconnect)
            }
          } else {
            console.warn('ReduxAuthProvider - No supported event listener method found')
          }
        } catch (error) {
          console.error('ReduxAuthProvider - Error setting up wallet listeners:', error)
        }
      }
    }

    const cleanup = setupWalletListeners()
    return cleanup
  }, [])

  return <>{children}</>
}

// Redux-based auth hooks
export const useReduxAuth = () => {
  const dispatch = useAppDispatch()
  const authState = useAppSelector(selectAuthState)

  return {
    ...authState,
    // Actions'ları expose et
    login: async (walletAddress: string) => {
      return dispatch(loginUser(walletAddress))
    },
    register: async (userData: { address: string; username: string; ipfsUrl: string }) => {
      return dispatch(registerUser(userData))
    },
    logout: async () => {
      return dispatch(logoutUser())
    }
  }
}
