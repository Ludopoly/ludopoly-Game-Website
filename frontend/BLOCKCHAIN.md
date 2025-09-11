# Blockchain Entegrasyonu

Bu proje blockchain account ve profile yönetimi için AccountFacet ve ProfileFacet smart contract'ları ile entegre edilmiştir.

## Kurulum

1. Environment variable'larını ayarlayın:
```bash
cp .env.example .env
```

2. `.env` dosyasında contract adreslerini güncelleyin:
```env
VITE_ACCOUNT_FACET_ADDRESS=0x... # Account Smart contract adresi
VITE_PROFILE_FACET_ADDRESS=0x... # Profile Smart contract adresi
```

## Kullanım

### 1. useAccount & useProfile Hooks

```tsx
import { useAccount, useProfile } from '../hooks';

function MyComponent() {
  const { 
    account, 
    hasAccount, 
    loading: accountLoading, 
    createAccount 
  } = useAccount();

  const { 
    profile, 
    hasProfile, 
    loading: profileLoading, 
    createProfile,
    updateProfile 
  } = useProfile();

  if (accountLoading || profileLoading) return <div>Loading...</div>;

  if (!hasAccount) {
    return (
      <button onClick={() => createAccount('myhandle', 'ipfs-cid')}>
        Create Account
      </button>
    );
  }

  if (!hasProfile) {
    return (
      <button onClick={() => createProfile({
        displayName: 'John Doe',
        bio: 'Hello World!',
        avatarCID: 'QmXXX...',
        nationality: 'US'
      })}>
        Create Profile
      </button>
    );
  }

  return (
    <div>
      <div>Account: {account?.handle}</div>
      <div>Profile: {profile?.displayName}</div>
    </div>
  );
}
```

### 2. AccountManager & ProfileManager Komponentleri

```tsx
import { AccountManager } from '../components/account/AccountManager';
import { ProfileManager } from '../components/profile/ProfileManager';

function App() {
  return (
    <div>
      <AccountManager />
      <ProfileManager />
    </div>
  );
}
```

### 3. Direkt AccountService Kullanımı

```tsx
import { AccountService } from '../services/blockchain/AccountService';

const accountService = new AccountService();

// Hesap kontrolü
const hasAccount = await accountService.hasAccount(address);

// Hesap oluşturma
const accountId = await accountService.createAccount('handle', 'metadata-cid');

// Hesap bilgilerini alma
const account = await accountService.getAccount(accountId);
```

## Contract Fonksiyonları

### AccountFacet - Write Functions
- `createAccount(handle, metadataCID)` - Yeni hesap oluşturur
- `deleteAccount(accountId)` - Hesabı siler
- `createAccountWithSig(...)` - İmza ile hesap oluşturur

### AccountFacet - Read Functions
- `getAccount(accountId)` - Hesap bilgilerini getirir
- `hasAccount(address)` - Kullanıcının hesabı var mı kontrol eder
- `getAccountIdByAddress(address)` - Adrese göre hesap ID'si getirir
- `getisAvailableHandle(handle)` - Handle'ın uygun olup olmadığını kontrol eder
- `getTotalAccounts()` - Toplam hesap sayısını getirir

### ProfileFacet - Write Functions
- `createProfile(displayName, bio, avatarCID, nationality)` - Yeni profil oluşturur
- `updateProfile(displayName, bio, avatarCID, nationality, isActive)` - Profili günceller
- `deleteProfile()` - Profili siler
- `setProfileLocation(location)` - Lokasyonu günceller
- `setProfileBio(bio)` - Bio'yu günceller
- `setProfileAvatarCID(avatarCID)` - Avatar'ı günceller
- `setProfileStatus(isActive)` - Profil durumunu günceller

### ProfileFacet - Read Functions
- `getProfile(profileId)` - Profil bilgilerini getirir
- `isProfileActive(profileId)` - Profil aktif mi kontrol eder
- `getCurrentLocation(profileId)` - Mevcut lokasyonu getirir
- `getProfilesByLocation(location)` - Lokasyona göre profilleri getirir
- `getProfileLocationHistory(profileId)` - Lokasyon geçmişini getirir

## Tip Güvenliği

Tüm contract etkileşimleri TypeScript tiplerle korunmuştur:

```tsx
import type { Account, CreateAccountParams } from '../types/contracts';

const account: Account = await accountService.getAccount(1n);
console.log(account.handle); // Type-safe
```

## SOLID Prensipler

- **Single Responsibility**: AccountService sadece account yönetimiyle ilgilenir
- **Open/Closed**: Interface'ler kullanılarak genişletilebilir yapı
- **Liskov Substitution**: IProfileService interface'i implement ediliyor
- **Interface Segregation**: Küçük, özel interface'ler kullanılıyor
- **Dependency Inversion**: Bağımlılıklar inject ediliyor

## Dosya Yapısı

```
src/
├── types/
│   ├── contracts/
│   │   ├── AccountFacet.ts       # Account contract types
│   │   ├── ProfileFacet.ts       # Profile contract types
│   │   └── index.ts              # Contract exports
│   └── index.ts                  # All types export
├── utils/
│   ├── abis/
│   │   ├── accountFacetAbi.ts    # Account Contract ABI
│   │   └── profileFacetAbi.ts    # Profile Contract ABI
│   └── index.ts                  # Utils exports
├── services/blockchain/
│   ├── AccountService.ts         # Account service
│   ├── ProfileService.ts         # Profile service
│   └── interfaces/
│       └── IProfileService.ts    # Interface
├── hooks/
│   ├── useAccount.ts             # Account React hook
│   └── useProfile.ts             # Profile React hook
└── components/
    ├── account/
    │   └── AccountManager.tsx    # Account UI komponenti
    └── profile/
        └── ProfileManager.tsx    # Profile UI komponenti
```
