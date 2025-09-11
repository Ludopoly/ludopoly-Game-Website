export interface IProfileService {
  createProfile(profileData: any): Promise<any>;
  getProfile(accountId: string): Promise<any>;
  updateProfile(accountId: string, profileData: any): Promise<any>;
  deleteProfile(accountId: string): Promise<void>;
  getUserProfile(address: string): Promise<any>;
}
