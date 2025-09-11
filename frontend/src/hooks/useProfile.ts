import { useState, useEffect } from 'react';
import { ProfileService } from '../services/blockchain/ProfileService';
import { useReduxWallet } from '../features/wallet/context/ReduxWalletProvider';
import { useAccount } from './useAccount';
import type { Profile, CreateProfileParams, UpdateProfileParams } from '../types/contracts';

export const useProfile = () => {
  const { address } = useReduxWallet();
  const { account } = useAccount();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profileService] = useState(() => new ProfileService());

  // Profile fetch döngüsünü engellemek için: profile zaten varsa ve accountId değişmediyse tekrar fetch etme
  useEffect(() => {
    if (!account?.accountId || !address) return;
    // Eğer profile zaten yüklü ve accountId değişmediyse tekrar fetch etme
    if (profile && profile.profileId === account.accountId) return;
    if (loading) return;
    checkUserProfile();
  }, [account?.accountId, address]);

  // Blockchain event listenerları: profil ile ilgili eventlerde otomatik refetch
  useEffect(() => {
    const listeners = {
      onProfileCreated: () => checkUserProfile(),
      onProfileUpdated: () => checkUserProfile(),
      onProfileDeleted: () => checkUserProfile(),
      onProfileStatusChanged: () => checkUserProfile(),
      onLocationUpdated: () => checkUserProfile(),
    };
    profileService.registerEventListeners(listeners);
    return () => {
      profileService.removeEventListeners();
    };
  }, [profileService]);

  const checkUserProfile = async () => {
    if (!account?.accountId) return;

    setLoading(true);
    setError(null);

    try {
      // ProfileId = AccountId olduğu için account ID'sini kullanıyoruz
      const userProfile = await profileService.getProfile(account.accountId);
      
      if (userProfile) {
        setProfile(userProfile);
        setHasProfile(true);
      } else {
        setProfile(null);
        setHasProfile(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProfile(null);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (params: CreateProfileParams) => {
    if (!account?.accountId) {
      throw new Error('Account not found. Please create an account first.');
    }

    setLoading(true);
    setError(null);

    try {
      await profileService.createProfile(params);
      
      // Profile oluşturulduktan sonra bilgileri getir
      await checkUserProfile();
      
      return profile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (params: UpdateProfileParams) => {
    if (!profile) {
      throw new Error('No profile to update');
    }

    setLoading(true);
    setError(null);

    try {
      await profileService.updateProfile(params);
      
      // Profile güncellendikten sonra bilgileri getir
      await checkUserProfile();
      
      return profile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async () => {
    if (!profile) {
      throw new Error('No profile to delete');
    }

    setLoading(true);
    setError(null);

    try {
      await profileService.deleteProfile();
      
      setProfile(null);
      setHasProfile(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (location: string) => {
    if (!profile) {
      throw new Error('No profile found');
    }

    setLoading(true);
    setError(null);

    try {
      await profileService.setProfileLocation(location);
      
      // Location güncellendikten sonra profile bilgilerini getir
      await checkUserProfile();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update location';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateBio = async (bio: string) => {
    if (!profile) {
      throw new Error('No profile found');
    }

    setLoading(true);
    setError(null);

    try {
      await profileService.setProfileBio(bio);
      
      // Bio güncellendikten sonra profile bilgilerini getir
      await checkUserProfile();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bio';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (avatarCID: string) => {
    if (!profile) {
      throw new Error('No profile found');
    }

    setLoading(true);
    setError(null);

    try {
      await profileService.setProfileAvatarCID(avatarCID);
      
      // Avatar güncellendikten sonra profile bilgilerini getir
      await checkUserProfile();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update avatar';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleProfileStatus = async () => {
    if (!profile) {
      throw new Error('No profile found');
    }

    setLoading(true);
    setError(null);

    try {
      await profileService.setProfileStatus(!profile.isActive);
      
      // Status güncellendikten sonra profile bilgilerini getir
      await checkUserProfile();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle profile status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getProfilesByLocation = async (location: string): Promise<bigint[]> => {
    try {
      return await profileService.getProfilesByLocation(location);
    } catch (err) {
      console.error('Error getting profiles by location:', err);
      return [];
    }
  };

  return {
    profile,
    hasProfile,
    loading,
    error,
    createProfile,
    updateProfile,
    deleteProfile,
    updateLocation,
    updateBio,
    updateAvatar,
    toggleProfileStatus,
    getProfilesByLocation,
    refetch: checkUserProfile,
    profileService
  };
};
