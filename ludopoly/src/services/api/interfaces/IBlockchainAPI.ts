// src/services/api/interfaces/IBlockchainAPI.ts
export interface IUserAccount {
  address: string
  balance: string
  isRegistered: boolean
  username?: string // Blockchain'de kayıtlı kullanıcı adı
  profileImageUrl?: string // IPFS profil resmi URL'i
  gameStats?: {
    gamesPlayed: number
    gamesWon: number
    totalEarnings: string
  }
  createdAt?: string
  lastLoginAt?: string
}

export interface IBlockchainAPIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface IUserRegistration {
  username: string
  ipfsUrl: string
  transactionHash?: string
}

export interface IBlockchainAPI{
  // User hesap kontrolü
  checkUserAccount(address: string): Promise<IBlockchainAPIResponse<IUserAccount>>
  
  // User kaydı oluşturma
  createUserAccount(address: string): Promise<IBlockchainAPIResponse<IUserAccount>>
  
  // Blockchain'e user kaydı (username + profil resmi)
  registerUserOnBlockchain(address: string, username: string, ipfsUrl: string): Promise<IBlockchainAPIResponse<{ transactionHash: string }>>
  
  // User bilgilerini güncelleme
  updateUserAccount(address: string, data: Partial<IUserAccount>): Promise<IBlockchainAPIResponse<IUserAccount>>
  
  // Oyun istatistikleri
  getUserGameStats(address: string): Promise<IBlockchainAPIResponse<IUserAccount['gameStats']>>
  
  // Username müsaitlik kontrolü
  checkUsernameAvailability(username: string): Promise<IBlockchainAPIResponse<{ available: boolean }>>
}
