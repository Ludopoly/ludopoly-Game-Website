  /**
   * Profile contract event dinleyicilerini ekle
   * Kullanıcıdan callback fonksiyonları alır
   */
 
import { ethers } from 'ethers';
import { ProfileFacetABI } from '../../utils';
import { CONTRACT_ADDRESSES } from '../../types/contracts';
import type { Profile, CreateProfileParams, UpdateProfileParams } from '../../types/contracts';

export class ProfileService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.initializeProvider();
    // Event listener'ları ReduxAuthProvider'da merkezi olarak yönetiyoruz
    // Bu sebepte burada duplicate listener eklemeye gerek yok
  }


   public async registerEventListeners({
    onProfileCreated,
    onProfileUpdated,
    onProfileDeleted,
    onProfileStatusChanged,
    onLocationUpdated
  }: {
    onProfileCreated?: (profileId: bigint, displayName: string, location: string) => void,
    onProfileUpdated?: (profileId: bigint, displayName: string, location: string) => void,
    onProfileDeleted?: (profileId: bigint) => void,
    onProfileStatusChanged?: (profileId: bigint, isActive: boolean) => void,
    onLocationUpdated?: (profileId: bigint, newLocation: string) => void
  }) {
    const contract = await this.getContract();
    if (onProfileCreated) {
      contract.on('ProfileCreated', (profileId, displayName, location) => {
        onProfileCreated(BigInt(profileId), displayName, location);
      });
    }
    if (onProfileUpdated) {
      contract.on('ProfileUpdated', (profileId, displayName, location) => {
        onProfileUpdated(BigInt(profileId), displayName, location);
      });
    }
    if (onProfileDeleted) {
      contract.on('ProfileDeleted', (profileId) => {
        onProfileDeleted(BigInt(profileId));
      });
    }
    if (onProfileStatusChanged) {
      contract.on('ProfileStatusChanged', (profileId, isActive) => {
        onProfileStatusChanged(BigInt(profileId), isActive);
      });
    }
    if (onLocationUpdated) {
      contract.on('LocationUpdated', (profileId, newLocation) => {
        onLocationUpdated(BigInt(profileId), newLocation);
      });
    }
  }

  /**
   * Tüm event dinleyicilerini kaldır
   */
  public async removeEventListeners() {
    if (!this.contract) return;
    this.contract.removeAllListeners('ProfileCreated');
    this.contract.removeAllListeners('ProfileUpdated');
    this.contract.removeAllListeners('ProfileDeleted');
    this.contract.removeAllListeners('ProfileStatusChanged');
    this.contract.removeAllListeners('LocationUpdated');
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      this.provider = new ethers.BrowserProvider((window as any).ethereum);
    }
  }

  /**
   * Wallet bağlantısı kesildiğinde tüm bağlantıları temizle
   */
  private resetConnection() {
    console.log('Resetting ProfileService connection');
    this.contract = null;
    this.signer = null;
    this.provider = null;
    
    // Provider'ı yeniden başlat
    this.initializeProvider();
  }

  /**
   * Manuel temizlik için public metod
   */
  public cleanup() {
    this.resetConnection();
  }

  /**
   * Wallet bağlantı durumunu kontrol et
   */
  public async isWalletConnected(): Promise<boolean> {
    try {
      if (!this.provider) {
        return false;
      }

      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const browserProvider = this.provider as ethers.BrowserProvider;
        const accounts = await browserProvider.listAccounts();
        return accounts.length > 0;
      }

      return false;
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      return false;
    }
  }

  private async getContract(): Promise<ethers.Contract> {
    // Her seferinde wallet bağlantısını kontrol et
    if (!this.provider) {
      await this.initializeProvider();
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }
    }
    
    if (!this.contract || !this.signer) {
      if (!CONTRACT_ADDRESSES.DIAMOND_PROXY) {
        throw new Error('Profile Facet contract address not configured');
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
          CONTRACT_ADDRESSES.DIAMOND_PROXY,
          ProfileFacetABI,
          this.signer
        );
      } catch (error) {
        console.error('Error getting profile contract:', error);
        throw new Error('Failed to initialize profile contract - wallet may not be connected');
      }
    }
    return this.contract;
  }

  // SOLID Principle: Single Responsibility - Profile yönetimi
  async createProfile(params: CreateProfileParams): Promise<void> {
    try {
      const contract = await this.getContract();
      
      // String'leri bytes32 formatına çevir
      const displayNameBytes32 = ethers.encodeBytes32String(params.displayName);
      const nationalityBytes32 = ethers.encodeBytes32String(params.nationality);
      
      const tx = await contract.createProfile(
        displayNameBytes32,
        params.bio,
        params.avatarCID,
        nationalityBytes32
      );
      await tx.wait();
    } catch (error) {
      console.error('Create profile error:', error);
      throw error;
    }
  }

  async getProfile(profileId: bigint): Promise<Profile | null> {
    try {
      const contract = await this.getContract();
      const profile = await contract.getProfile(profileId);
      
      return {
        profileId: profile.profileId,
        displayName: ethers.decodeBytes32String(profile.displayName),
        bio: profile.bio,
        avatarCID: profile.avatarCID,
        nationality: ethers.decodeBytes32String(profile.nationality),
        location: ethers.decodeBytes32String(profile.location),
        locationHistory: profile.locationHistory.map((loc: string) => 
          ethers.decodeBytes32String(loc)
        ),
        isActive: profile.isActive,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      };
    } catch (error: any) {
      // ProfileNotFound hatası beklenen bir durum, bu durumda sadece null dön
      if (error?.message?.includes('ProfileNotFound') || error?.reason?.includes('ProfileNotFound')) {
        console.log('Profile not found for ID:', profileId.toString());
        return null;
      }
      // Diğer hatalar için log at
      console.error('Get profile error:', error);
      return null;
    }
  }

  /**
   * Belirtilen wallet address için profil var mı kontrol eder
   * 1. getAccountByAddress ile account ID'yi al
   * 2. getProfile ile profile bilgilerini al
   * 3. Profile dolu ise true döndür
   * @param walletAddress - Wallet adresi
   * @returns boolean - Profil varsa true, yoksa false
   */
  async hasProfile(walletAddress: string): Promise<boolean> {
    try {
      // Önce wallet bağlantısını kontrol et
      if (!this.provider) {
        console.log('Provider not available, wallet may be disconnected');
        return false;
      }

      // Wallet bağlantısını kontrol et
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const browserProvider = this.provider as ethers.BrowserProvider;
        const accounts = await browserProvider.listAccounts();
        if (accounts.length === 0) {
          console.log('No accounts connected, wallet disconnected');
          return false;
        }
      }

      // AccountService'i import etmek yerine, burada dinamik olarak kullanacağız
      const { apiServiceFactory } = await import('../api/factories/APIServiceFactory');
      const accountService = apiServiceFactory.getAccountService();
      
      // 1. Account ID'yi al
      const account = await accountService.getAccountByAddress(walletAddress);
      if (!account || !account.accountId) {
        console.log('No account found for address:', walletAddress);
        return false;
      }
      
      // 2. Profile bilgilerini al
      const profile = await this.getProfile(account.accountId);
      
      // 3. Profile dolu mu kontrol et
      const hasProfile = profile !== null && profile.profileId > 0n;
      
      console.log('Profile check result:', {
        walletAddress,
        accountId: account.accountId.toString(),
        hasProfile,
        profileData: profile 
      
      });
      
      return hasProfile;
    } catch (error: any) {
      // ProfileNotFound hatası beklenen bir durum
      if (error?.message?.includes('ProfileNotFound') || error?.reason?.includes('ProfileNotFound')) {
        console.log('Profile not found for wallet:', walletAddress);
        return false;
      }
      console.error('Has profile error:', error);
      return false;
    }
  }

  /**
   * Wallet address için profile bilgilerini al
   * @param walletAddress - Wallet adresi
   * @returns Profile | null
   */
  async getProfileByAddress(walletAddress: string): Promise<Profile | null> {
    try {
      const { apiServiceFactory } = await import('../api/factories/APIServiceFactory');
      const accountService = apiServiceFactory.getAccountService();
      
      // Account ID'yi al
      const account = await accountService.getAccountByAddress(walletAddress);
      if (!account || !account.accountId) {
        return null;
      }
      
      // Profile bilgilerini al
      return await this.getProfile(account.accountId);
    } catch (error: any) {
      // ProfileNotFound hatası beklenen bir durum
      if (error?.message?.includes('ProfileNotFound') || error?.reason?.includes('ProfileNotFound')) {
        console.log('Profile not found for wallet address:', walletAddress);
        return null;
      }
      console.error('Get profile by address error:', error);
      return null;
    }
  }

  async updateProfile(params: UpdateProfileParams): Promise<void> {
    try {
      const contract = await this.getContract();
      
      // String'leri bytes32 formatına çevir
      const displayNameBytes32 = ethers.encodeBytes32String(params.displayName);
      const nationalityBytes32 = ethers.encodeBytes32String(params.nationality);
      
      const tx = await contract.updateProfile(
        displayNameBytes32,
        params.bio,
        params.avatarCID,
        nationalityBytes32,
        params.isActive
      );
      await tx.wait();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async deleteProfile(): Promise<void> {
    try {
      const contract = await this.getContract();
      const tx = await contract.deleteProfile();
      await tx.wait();
    } catch (error) {
      console.error('Delete profile error:', error);
      throw error;
    }
  }

  async isProfileActive(profileId: bigint): Promise<boolean> {
    try {
      const contract = await this.getContract();
      return await contract.isProfileActive(profileId);
    } catch (error) {
      console.error('Check profile active error:', error);
      return false;
    }
  }

  async getCurrentLocation(profileId: bigint): Promise<string | null> {
    try {
      const contract = await this.getContract();
      const locationBytes32 = await contract.getCurrentLocation(profileId);
      return ethers.decodeBytes32String(locationBytes32);
    } catch (error) {
      console.error('Get current location error:', error);
      return null;
    }
  }

  async getProfilesByLocation(location: string): Promise<bigint[]> {
    try {
      const contract = await this.getContract();
      const locationBytes32 = ethers.encodeBytes32String(location);
      return await contract.getProfilesByLocation(locationBytes32);
    } catch (error) {
      console.error('Get profiles by location error:', error);
      return [];
    }
  }

  async setProfileLocation(location: string): Promise<void> {
    try {
      const contract = await this.getContract();
      const locationBytes32 = ethers.encodeBytes32String(location);
      const tx = await contract.setProfileLocation(locationBytes32);
      await tx.wait();
    } catch (error) {
      console.error('Set profile location error:', error);
      throw error;
    }
  }

  async setProfileBio(bio: string): Promise<void> {
    try {
      const contract = await this.getContract();
      const tx = await contract.setProfileBio(bio);
      await tx.wait();
    } catch (error) {
      console.error('Set profile bio error:', error);
      throw error;
    }
  }

  async setProfileAvatarCID(avatarCID: string): Promise<void> {
    try {
      const contract = await this.getContract();
      const tx = await contract.setProfileAvatarCID(avatarCID);
      await tx.wait();
    } catch (error) {
      console.error('Set profile avatar error:', error);
      throw error;
    }
  }

  async setProfileStatus(isActive: boolean): Promise<void> {
    try {
      const contract = await this.getContract();
      const tx = await contract.setProfileStatus(isActive);
      await tx.wait();
    } catch (error) {
      console.error('Set profile status error:', error);
      throw error;
    }
  }

  // IProfileService implementation
  async createProfile_Legacy(profileData: any): Promise<any> {
    const params: CreateProfileParams = {
      displayName: profileData.displayName,
      bio: profileData.bio,
      avatarCID: profileData.avatarCID,
      nationality: profileData.nationality
    };
    await this.createProfile(params);
    return params;
  }

  async getProfile_Legacy(profileId: string): Promise<any> {
    return await this.getProfile(BigInt(profileId));
  }

  async updateProfile_Legacy(_profileId: string, profileData: any): Promise<any> {
    const params: UpdateProfileParams = {
      displayName: profileData.displayName,
      bio: profileData.bio,
      avatarCID: profileData.avatarCID,
      nationality: profileData.nationality,
      isActive: profileData.isActive ?? true
    };
    await this.updateProfile(params);
    return params;
  }

  async deleteProfile_Legacy(_profileId: string): Promise<void> {
    await this.deleteProfile();
  }

  async getUserProfile(_address: string): Promise<any> {
    // Bu fonksiyon için AccountService ile entegrasyon gerekiyor
    // Account ID'yi alıp profile bilgilerini getirmek için
    throw new Error('getUserProfile requires integration with AccountService');
  }

  // Utility methods
  formatBytes32String(text: string): string {
    return ethers.encodeBytes32String(text);
  }

  parseBytes32String(bytes32: string): string {
    return ethers.decodeBytes32String(bytes32);
  }
}
