/* // src/hooks/useAccountCheck.ts
import { useState, useCallback } from 'react'
import { AccountCheckService, type AccountCheckResult } from '../services/account/AccountCheckService'

interface UseAccountCheckResult {
  checkAccount: (walletAddress: string) => Promise<AccountCheckResult>
  redirectToAccountCreation: (walletAddress: string, returnUrl?: string) => void
  redirectToProfileCreation: (walletAddress: string, returnUrl?: string) => void
  isChecking: boolean
  lastCheckResult: AccountCheckResult | null
}

export const useAccountCheck = (): UseAccountCheckResult => {
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheckResult, setLastCheckResult] = useState<AccountCheckResult | null>(null)
  
  const accountCheckService = new AccountCheckService()

  const checkAccount = useCallback(async (walletAddress: string): Promise<AccountCheckResult> => {
    setIsChecking(true)
    try {
      const result = await accountCheckService.checkAccountExists(walletAddress)
      setLastCheckResult(result)
      
      // Hook state'ini logla
      console.log('Account Check Hook:', {
        isChecking: false,
        hasResult: !!result,
        hasAccount: result?.hasAccount || false,
        hasProfile: result?.hasProfile || false,
        step: result?.step || 'unknown',
        hasError: !!result?.error
      })
      
      return result
    } finally {
      setIsChecking(false)
    }
  }, [])

  const redirectToAccountCreation = useCallback((walletAddress: string, returnUrl?: string) => {
    console.log('Account Redirect:', {
      walletAddress,
      hasReturnUrl: !!returnUrl
    })
    accountCheckService.redirectToAccountCreation(walletAddress, returnUrl)
  }, [])

  const redirectToProfileCreation = useCallback((walletAddress: string, returnUrl?: string) => {
    console.log('Profile Creation Redirect:', {
      walletAddress,
      hasReturnUrl: !!returnUrl
    })
    accountCheckService.redirectToProfileCreation(walletAddress, returnUrl)
  }, [])

  return {
    checkAccount,
    redirectToAccountCreation,
    redirectToProfileCreation,
    isChecking,
    lastCheckResult
  }
}
 */