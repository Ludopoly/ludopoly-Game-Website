export interface IBlockchainService {
  registerUser(username: string, ipfsUrl: string): Promise<string>
}