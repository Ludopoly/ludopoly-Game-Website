import { ethers } from 'ethers';
import { AccountFacetABI } from '../../utils';
import { CONTRACT_ADDRESSES } from '../../types/contracts';
import type { Account } from '../../types/contracts';
import type { IProfileService } from './interfaces/IProfileService';

export class AccountService implements IProfileService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      this.provider = new ethers.BrowserProvider((window as any).ethereum);
    }
  }

  private async getContract(): Promise<ethers.Contract> {
    if (!this.contract) {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }
      
      if (!CONTRACT_ADDRESSES.DIAMOND_PROXY) {
        throw new Error('Account Facet contract address not configured');
      }

      try {
        // BrowserProvider için getSigner metodunu doğru kullan
        const browserProvider = this.provider as ethers.BrowserProvider;
        
        // Önce wallet'ın bağlı olup olmadığını kontrol et
        const accounts = await browserProvider.listAccounts();
        if (accounts.length === 0) {
          throw new Error('Wallet not connected');
        }
        
        this.signer = await browserProvider.getSigner();
        this.contract = new ethers.Contract(
          CONTRACT_ADDRESSES.ACCOUNT_FACET,
          AccountFacetABI,
          this.signer
        );
      } catch (error) {
        console.error('Error getting contract:', error);
        throw new Error('Failed to initialize contract - wallet may not be connected');
      }
    }
    return this.contract;
  }

  // SOLID Principle: Single Responsibility - Account yönetimi
  async createAccount(handle: string, metadataCID: string): Promise<bigint> {
    try {
      const contract = await this.getContract();
      
      // Handle'ı bytes32 formatına çevir
      const handleBytes32 = ethers.encodeBytes32String(handle);
      
      const tx = await contract.createAccount(handleBytes32, metadataCID);
      const receipt = await tx.wait();
      
      // Event'ten accountId'yi çıkar
      const event = receipt.logs.find((log: any) => 
        log.eventName === 'AccountCreated'
      );
      
      return event?.args?.accountId || 0n;
    } catch (error) {
      console.error('Create account error:', error);
      throw error;
    }
  }

  async getAccount(accountId: bigint): Promise<Account | null> {
    try {
      const contract = await this.getContract();
      const account = await contract.getAccount(accountId);
      
      return {
        owner: account.owner,
        handle: ethers.decodeBytes32String(account.handle),
        accountId: account.accountId,
        metadataCID: account.metadataCID,
        score: account.score,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      };
    } catch (error) {
      console.error('Get account error:', error);
      return null;
    }
  }

  async getAccountByAddress(address: string): Promise<Account | null> {
    try {
      const contract = await this.getContract();
      const accountId = await contract.getAccountIdByAddress(address);
      
      if (accountId === 0n) {
        return null;
      }
      
      return await this.getAccount(accountId);
    } catch (error) {
      console.error('Get account by address error:', error);
      return null;
    }
  }

  async hasAccount(address: string): Promise<boolean> {
    try {
      const contract = await this.getContract();
      return await contract.hasAccount(address);
    } catch (error) {
      console.error('Has account error:', error);
      return false;
    }
  }

  async isHandleAvailable(handle: string): Promise<boolean> {
    try {
      const contract = await this.getContract();
      const handleBytes32 = ethers.encodeBytes32String(handle);
      return await contract.getisAvailableHandle(handleBytes32);
    } catch (error) {
      console.error('Check handle availability error:', error);
      return false;
    }
  }

  async deleteAccount(accountId: bigint): Promise<void> {
    try {
      const contract = await this.getContract();
      const tx = await contract.deleteAccount(accountId);
      await tx.wait();
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  async getTotalAccounts(): Promise<bigint> {
    try {
      const contract = await this.getContract();
      return await contract.getTotalAccounts();
    } catch (error) {
      console.error('Get total accounts error:', error);
      return 0n;
    }
  }

  // IProfileService implementation
  async createProfile(profileData: any): Promise<any> {
    const { handle, metadataCID } = profileData;
    const accountId = await this.createAccount(handle, metadataCID);
    return { accountId, handle, metadataCID };
  }

  async getProfile(accountId: string): Promise<any> {
    return await this.getAccount(BigInt(accountId));
  }

  async updateProfile(_accountId: string, _profileData: any): Promise<any> {
    // Bu fonksiyon için update metodunu contract'a eklemek gerekiyor
    throw new Error('Update profile not implemented in contract yet');
  }

  async deleteProfile(accountId: string): Promise<void> {
    await this.deleteAccount(BigInt(accountId));
  }

  async getUserProfile(address: string): Promise<any> {
    return await this.getAccountByAddress(address);
  }

  // Utility methods
  formatHandle(handle: string): string {
    return ethers.encodeBytes32String(handle);
  }

  parseHandle(handleBytes32: string): string {
    return ethers.decodeBytes32String(handleBytes32);
  }
}
