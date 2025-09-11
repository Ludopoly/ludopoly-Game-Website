// src/services/account/AccountCheckService.ts
import { apiServiceFactory } from '../api/factories/APIServiceFactory'
import type { Account } from '../../types/contracts'

export interface AccountCheckResult {
  hasAccount: boolean
  hasProfile: boolean
  accountData?: Account | null
  profileData?: any | null // Profile interface'ini ekleyeceğiz
  error?: string
  step: 'no_account' | 'account_only' | 'complete' | 'error'
}

export class AccountCheckService {
  /**
   * Blockchain'den kullanıcı hesabının ve profilinin varlığını kontrol eder
   * @param walletAddress - Kontrol edilecek cüzdan adresi
   * @returns Promise<AccountCheckResult>
   */
  async checkAccountExists(walletAddress: string): Promise<AccountCheckResult> {
    try {
      const accountService = apiServiceFactory.getAccountService()
      const profileService = apiServiceFactory.getProfileService()
      
      // 1. Önce Account kontrolü
      const accountExists = await accountService.hasAccount(walletAddress)
      
      if (!accountExists) {
        const result = {
          hasAccount: false,
          hasProfile: false,
          step: 'no_account' as const
        }
        
        console.log('Account Check:', {
          walletAddress,
          hasAccount: false,
          hasProfile: false,
          step: 'no_account'
        })
        
        return result
      }
      
      // 2. Account varsa detayları al
      const accountData = await accountService.getAccountByAddress(walletAddress)
      
      // 3. Profile kontrolü
      const profileExists = await profileService.hasProfile(walletAddress)
      
      if (!profileExists) {
        const result = {
          hasAccount: true,
          hasProfile: false,
          accountData,
          step: 'account_only' as const
        }
        
        console.log('Account Check:', {
          walletAddress,
          hasAccount: true,
          hasProfile: false,
          hasAccountData: !!accountData,
          step: 'account_only'
        })
        
        return result
      }
      
      // 4. Profile de varsa detayları al
      const profileData = await profileService.getProfileByAddress(walletAddress)
      
      const result = {
        hasAccount: true,
        hasProfile: true,
        accountData,
        profileData,
        step: 'complete' as const
      }
      
      console.log('Account Check:', {
        walletAddress,
        hasAccount: true,
        hasProfile: true,
        hasAccountData: !!accountData,
        hasProfileData: !!profileData,
        step: 'complete'
      })
      
      return result
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Account check failed'
      
      // Wallet bağlantı hatalarını özel olarak handle et
      const isWalletError = errorMessage.includes('wallet') || 
                           errorMessage.includes('eth_requestAccounts') ||
                           errorMessage.includes('not connected')
      
      const result = {
        hasAccount: false,
        hasProfile: false,
        error: isWalletError ? 'Wallet not connected' : errorMessage,
        step: 'error' as const
      }
      
      console.log('Account Check Error:', {
        walletAddress,
        hasAccount: false,
        hasProfile: false,
        error: result.error,
        step: 'error',
        isWalletError
      })
      
      return result
    }
  }

  /**
   * Hesap oluşturma domain'ine yönlendirme URL'si oluşturur
   * @param walletAddress - Cüzdan adresi
   * @param returnUrl - Geri dönüş URL'si (opsiyonel)
   * @returns string - Yönlendirme URL'si
   */
  getAccountCreationUrl(walletAddress: string, returnUrl?: string): string {
    const baseUrl = import.meta.env.VITE_ACCOUNT_CREATION_DOMAIN || 'https://account.ludopoly.game'
    const params = new URLSearchParams({
      walletAddress,
      ...(returnUrl && { returnUrl })
    })
    
    return `${baseUrl}/create?${params.toString()}`
  }

  /**
   * Hesap oluşturma sayfasına yönlendirir
   * @param walletAddress - Cüzdan adresi
   * @param returnUrl - Geri dönüş URL'si (opsiyonel)
   */
  redirectToAccountCreation(walletAddress: string, returnUrl?: string): void {
    const url = this.getAccountCreationUrl(walletAddress, returnUrl)
    window.location.href = url
  }

  /**
   * Profil oluşturma sayfasına yönlendirir
   * @param walletAddress - Cüzdan adresi
   * @param returnUrl - Geri dönüş URL'si (opsiyonel)
   */
  redirectToProfileCreation(walletAddress: string, returnUrl?: string): void {
    // Profil oluşturma için uygulamanın kendi sayfasına yönlendir
    const url = `/profile/create?walletAddress=${walletAddress}${returnUrl ? `&returnUrl=${returnUrl}` : ''}`
    window.location.href = url
  }
}
