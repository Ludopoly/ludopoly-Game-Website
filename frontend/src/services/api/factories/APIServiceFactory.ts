// src/services/api/factories/APIServiceFactory.ts
import type { IIPFSService } from '../interfaces/IIPFSService'
import { IPFSService } from '../implementations/IPFSService'
import { AccountService } from '../../blockchain/AccountService'
import { ProfileService } from '../../blockchain/ProfileService'

export type APIEnvironment = 'development' | 'production' | 'test'

export interface APIConfig {
  environment: APIEnvironment
  ipfsBaseUrl: string
  apiKey?: string
  timeout?: number
}

export class APIServiceFactory {
  private static instance: APIServiceFactory
  private ipfsService?: IIPFSService
  private accountService?: AccountService
  private profileService?: ProfileService
  private config?: APIConfig

  private constructor() {}

  public static getInstance(): APIServiceFactory {
    if (!APIServiceFactory.instance) {
      APIServiceFactory.instance = new APIServiceFactory()
    }
    return APIServiceFactory.instance
  }

  public initialize(config: APIConfig): void {
    this.config = config
    // Reset services when config changes
    this.ipfsService = undefined
    this.accountService = undefined
    this.profileService = undefined
  }

  public getIPFSService(): IIPFSService {
    if (!this.ipfsService) {
      if (!this.config) {
        throw new Error('APIServiceFactory not initialized. Call initialize() first.')
      }

      this.ipfsService = new IPFSService(
        this.config.ipfsBaseUrl,
        this.config.apiKey
      )
    }
    return this.ipfsService
  }

  public getAccountService(): AccountService {
    if (!this.accountService) {
      this.accountService = new AccountService()
    }
    return this.accountService as AccountService
  }

  public getProfileService(): ProfileService {
    if (!this.profileService) {
      this.profileService = new ProfileService()
    }
    return this.profileService as ProfileService
  }

  public getEnvironment(): APIEnvironment | undefined {
    return this.config?.environment
  }

  public isInitialized(): boolean {
    return !!this.config
  }

  // Test için reset metodu
  public reset(): void {
    this.ipfsService = undefined
    this.accountService = undefined
    this.profileService = undefined
    this.config = undefined
  }
}

// Singleton instance export
export const apiServiceFactory = APIServiceFactory.getInstance()
