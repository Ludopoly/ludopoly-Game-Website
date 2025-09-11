// AccountFacet Contract Types
export interface Account {
  owner: string;
  handle: string; // bytes32 as hex string
  accountId: bigint;
  metadataCID: string;
  score: bigint;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface CreateAccountParams {
  handle: string; // bytes32 as hex string
  metadataCID: string;
}

export interface CreateAccountWithSigParams {
  owner: string;
  handle: string; // bytes32 as hex string
  metadataCID: string;
  signature: string; // bytes as hex string
  expiry: bigint;
  nonce: bigint;
}

export interface DeleteAccountWithSigParams {
  accountId: bigint;
  owner: string;
  expiry: bigint;
  nonce: bigint;
  signature: string; // bytes as hex string
}

// Events
export interface AccountCreatedEvent {
  accountId: bigint;
  owner: string;
  handle: string; // bytes32 as hex string
  metadataCID: string;
  timestamp: bigint;
}

export interface AccountDeletedEvent {
  accountId: bigint;
  owner: string;
  timestamp: bigint;
}

export interface AccountUpdatedEvent {
  accountId: bigint;
  metadataCID: string;
  timestamp: bigint;
}

// Custom Errors
export type AccountFacetError = 
  | 'AccountDoesNotExist'
  | 'AccountNotEnabled'
  | 'AlreadyHasAccount'
  | 'HandleAlreadyTaken'
  | 'InvalidHandleFormat'
  | 'InvalidInput'
  | 'InvalidSignature'
  | 'NFTBurnFailed'
  | 'NFTMintFailed'
  | 'NonceAlreadyUsed'
  | 'NotAccountOwner'
  | 'ReentrancyGuardReentrantCall'
  | 'SignatureExpired';

// Contract interface for type-safe contract calls
export interface IAccountFacet {
  // Write Functions
  createAccount(handle: string, metadataCID: string): Promise<bigint>;
  createAccountWithSig(params: CreateAccountWithSigParams): Promise<bigint>;
  deleteAccount(accountId: bigint): Promise<void>;
  deleteAccountWithSig(params: DeleteAccountWithSigParams): Promise<void>;

  // Read Functions
  getAccount(accountId: bigint): Promise<Account>;
  getAccountCreationTime(accountId: bigint): Promise<bigint>;
  getAccountHandle(accountId: bigint): Promise<string>;
  getAccountIdByAddress(accountOwner: string): Promise<bigint>;
  getAccountIdByHandle(handle: string): Promise<bigint>;
  getAccountLastUpdateTime(accountId: bigint): Promise<bigint>;
  getAccountMetadata(accountId: bigint): Promise<string>;
  getAccountScore(accountId: bigint): Promise<bigint>;
  getSomething(): Promise<boolean>;
  getTotalAccounts(): Promise<bigint>;
  getisAvailableHandle(handle: string): Promise<boolean>;
  hasAccount(address: string): Promise<boolean>;
  nftContract(): Promise<string>;
}
