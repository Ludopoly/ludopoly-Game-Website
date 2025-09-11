// src/services/api/implementations/IPFSService.ts
import type { IIPFSService, IIPFSResponse, IIPFSUploadResult } from '../interfaces/IIPFSService'
import { ApiError } from '../errors/ApiError'

export class IPFSService implements IIPFSService {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<IIPFSResponse<T>> {
    try {
      const headers: HeadersInit = {
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        ...options.headers
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(data.message || 'IPFS request failed', response.status)
      }

      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        }
      }
      
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  async uploadFile(file: File): Promise<IIPFSResponse<IIPFSUploadResult>> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      return await this.makeRequest<IIPFSUploadResult>('/api/ipfs/upload', {
        method: 'POST',
        body: formData
      })
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File upload failed'
      }
    }
  }

  async uploadJSON(data: any): Promise<IIPFSResponse<IIPFSUploadResult>> {
    try {
      return await this.makeRequest<IIPFSUploadResult>('/api/ipfs/upload-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      })
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'JSON upload failed'
      }
    }
  }

  getFileUrl(cid: string): string {
    // IPFS Gateway URL - production'da Pinata, Infura vs kullanılabilir
    return `https://gateway.pinata.cloud/ipfs/${cid}`
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/api/health')
      return response.success
    } catch {
      return false
    }
  }
}
