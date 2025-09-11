// ProfileFacet Contract Types
export interface Profile {
  profileId: bigint; // Same as AccountId
  displayName: string; // bytes32 as hex string
  bio: string;
  avatarCID: string;
  nationality: string; // bytes32 as hex string
  location: string; // bytes32 as hex string
  locationHistory: string[]; // bytes32[] as hex strings
  isActive: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface CreateProfileParams {
  displayName: string; // bytes32 as hex string
  bio: string;
  avatarCID: string;
  nationality: string; // bytes32 as hex string
}

export interface UpdateProfileParams {
  displayName: string; // bytes32 as hex string
  bio: string;
  avatarCID: string;
  nationality: string; // bytes32 as hex string
  isActive: boolean;
}

// Events
export interface ProfileCreatedEvent {
  profileId: bigint;
  displayName: string; // bytes32 as hex string
  location: string; // bytes32 as hex string
}

export interface ProfileUpdatedEvent {
  profileId: bigint;
  displayName: string; // bytes32 as hex string
  location: string; // bytes32 as hex string
}

export interface ProfileDeletedEvent {
  profileId: bigint;
}

export interface ProfileStatusChangedEvent {
  profileId: bigint;
  isActive: boolean;
}

export interface LocationUpdatedEvent {
  profileId: bigint;
  newLocation: string; // bytes32 as hex string
}

// Custom Errors
export type ProfileFacetError = 
  | 'AccountDoesNotExist'
  | 'InvalidBio'
  | 'InvalidDisplayName'
  | 'InvalidNationality'
  | 'MaxLocationHistoryReached'
  | 'ProfileAlreadyExists'
  | 'ProfileNotFound'
  | 'UnauthorizedAccess';

// Contract interface for type-safe contract calls
export interface IProfileFacet {
  // Write Functions
  createProfile(
    displayName: string,
    bio: string,
    avatarCID: string,
    nationality: string
  ): Promise<void>;

  updateProfile(
    displayName: string,
    bio: string,
    avatarCID: string,
    nationality: string,
    isActive: boolean
  ): Promise<void>;

  deleteProfile(): Promise<void>;

  setProfileDisplayName(displayName: string): Promise<void>;
  setProfileBio(bio: string): Promise<void>;
  setProfileAvatarCID(avatarCID: string): Promise<void>;
  setProfileNationality(nationality: string): Promise<void>;
  setProfileLocation(location: string): Promise<void>;
  setProfileStatus(isActive: boolean): Promise<void>;

  // Read Functions
  getProfile(profileId: bigint): Promise<Profile>;
  getCurrentLocation(profileId: bigint): Promise<string>;
  getProfileLocationHistory(profileId: bigint): Promise<string[]>;
  getProfilesByLocation(location: string): Promise<bigint[]>;
  isProfileActive(profileId: bigint): Promise<boolean>;
}
