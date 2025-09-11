// src/services/api/interfaces/IIPFSService.ts

export interface IIPFSResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface IIPFSUploadResult {
  cid: string
  hash: string
  url: string
  size: number
}

export interface IIPFSService {
  /**
   * Upload a file to IPFS
   * @param file - File to upload
   * @returns Promise with IPFS upload result
   */
  uploadFile(file: File): Promise<IIPFSResponse<IIPFSUploadResult>>

  /**
   * Upload JSON data to IPFS
   * @param data - JSON data to upload
   * @returns Promise with IPFS upload result
   */
  uploadJSON(data: any): Promise<IIPFSResponse<IIPFSUploadResult>>

  /**
   * Get file from IPFS by CID
   * @param cid - IPFS CID
   * @returns Promise with file URL
   */
  getFileUrl(cid: string): string

  /**
   * Check if IPFS service is available
   */
  healthCheck(): Promise<boolean>
}
