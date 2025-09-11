import { useState, useEffect } from 'react'
import { useAppSelector } from '../store'
import { selectAuthState } from '../store/slices/authSlice'
import { selectWalletState } from '../store/slices/walletSlice'

/**
 * Global loading state hook
 * Combines loading states from different slices
 */
export const useLoadingState = () => {
  const [isLoading, setIsLoading] = useState(false)
  
  const authState = useAppSelector(selectAuthState)
  const walletState = useAppSelector(selectWalletState)
  
  useEffect(() => {
    const loading = authState.isLoading || walletState.isConnecting
   
  }, [authState.isLoading, walletState.isConnecting])
  
  return {
    isLoading,
    authLoading: authState.isLoading,
    walletLoading: walletState.isConnecting,
  }
}
