// src/services/api/implementations/BlockchainAPIService.ts
import type { IBlockchainAPI, IBlockchainAPIResponse, IUserAccount } from '../interfaces/IBlockchainAPI'
import { ApiError } from '../errors/ApiError'

export class BlockchainAPIService implements IBlockchainAPI {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<IBlockchainAPIResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        ...options.headers
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(`API Error: ${response.status}`, response.status, data)
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      throw new ApiError(
        `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      )
    }
  }

  async checkUserAccount(address: string): Promise<IBlockchainAPIResponse<IUserAccount>> {
    return this.makeRequest<IUserAccount>(`/api/user/account/${address}`)
  }

  async createUserAccount(address: string): Promise<IBlockchainAPIResponse<IUserAccount>> {
    return this.makeRequest<IUserAccount>('/api/user/account', {
      method: 'POST',
      body: JSON.stringify({ address })
    })
  }

  async registerUserOnBlockchain(
    address: string, 
    username: string, 
    ipfsUrl: string
  ): Promise<IBlockchainAPIResponse<{ transactionHash: string }>> {
    return this.makeRequest<{ transactionHash: string }>('/api/user/register-blockchain', {
      method: 'POST',
      body: JSON.stringify({
        address,
        username,
        ipfsUrl
      })
    })
  }

  async updateUserAccount(
    address: string, 
    data: Partial<IUserAccount>
  ): Promise<IBlockchainAPIResponse<IUserAccount>> {
    return this.makeRequest<IUserAccount>(`/api/user/account/${address}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async getUserGameStats(
    address: string
  ): Promise<IBlockchainAPIResponse<IUserAccount['gameStats']>> {
    return this.makeRequest<IUserAccount['gameStats']>(`/api/user/stats/${address}`)
  }

  async checkUsernameAvailability(
    username: string
  ): Promise<IBlockchainAPIResponse<{ available: boolean }>> {
    return this.makeRequest<{ available: boolean }>(`/api/user/username-available/${username}`)
  }
}
