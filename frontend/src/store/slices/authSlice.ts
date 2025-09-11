import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { IUserAccount } from '../../services/api/interfaces/IBlockchainAPI'

// RootState type import - circular dependency'den kaçınmak için any kullanıyoruz
type RootState = any

// Auth state interface - blockchain entegrasyonu ile güncellendi
interface AuthState {
  isAuthenticated: boolean
  userAccount?: IUserAccount
  isLoading: boolean
  error: string | null
  registrationStep?: 'profile' | 'completed'
  walletAddress?: string
}


// User hesabını kontrol et
export const checkUserAccount = createAsyncThunk(
  'auth/checkUserAccount',
  async (address: string, { rejectWithValue }) => {
    try {
      // Gerçek blockchain verilerini kullan
      const accountCheckService = new (await import('../../services/account/AccountCheckService')).AccountCheckService()
      const result = await accountCheckService.checkAccountExists(address)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      return { 
        account: result.accountData ? {
          address: result.accountData.owner,
          balance: '0', // Balance'ı ayrı bir service'den alabilirsin
          isRegistered: result.hasAccount && result.hasProfile,
          username: result.profileData?.username,
          profileImageUrl: result.profileData?.imageUrl,
          gameStats: {
            gamesPlayed: 0,
            gamesWon: 0,
            totalEarnings: '0'
          }
        } : null,
        address,
        hasAccount: result.hasAccount,
        hasProfile: result.hasProfile,
        step: result.step
      }
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Auth durumunu kontrol et (localStorage'dan wallet bilgisi kontrol et)
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Önce manuel disconnect kontrolü yap
      const manualDisconnect = localStorage.getItem('manualDisconnect')
      if (manualDisconnect === 'true') {
        console.log('🟡 checkAuthStatus: Manual disconnect detected, not authenticating')
        // Manuel disconnect flag'ini HENÜZ temizleme - wallet provider da kontrol etsin
        console.log('🟡 checkAuthStatus: Leaving manual disconnect flag for wallet provider to check')
        return null
      }
      
      const walletAddress = localStorage.getItem('walletAddress')
      
      if (!walletAddress) {
        console.log('checkAuthStatus: No wallet address in localStorage')
        return null
      }
      
      // Önce cüzdan gerçekten bağlı mı kontrol et
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          // Daha detaylı wallet kontrolü
          const ethereum = (window as any).ethereum
          
          // Önce bağlantı durumunu kontrol et
          const accounts = await ethereum.request({ 
            method: 'eth_accounts' 
          })
          
          console.log('checkAuthStatus: Current accounts:', accounts)
          console.log('checkAuthStatus: Stored address:', walletAddress)
          
          // Hesap kontrolü
          if (!accounts || accounts.length === 0) {
            localStorage.removeItem('walletAddress')
            console.log('checkAuthStatus: No accounts connected, clearing localStorage')
            return null
          }
          
          // Adres eşleşme kontrolü (case-insensitive)
          const addressMatch = accounts.some((account: string) => 
            account.toLowerCase() === walletAddress.toLowerCase()
          )
          
          if (!addressMatch) {
            localStorage.removeItem('walletAddress')
            console.log('checkAuthStatus: Wallet address not found in current accounts, clearing localStorage')
            return null
          }
          
          // Wallet durumu OK, kullanıcı hesabını kontrol et
          console.log('checkAuthStatus: Wallet connected and address matches, checking user account')
          const result = await dispatch(checkUserAccount(walletAddress))
          if (checkUserAccount.fulfilled.match(result)) {
            return result.payload
          } else {
            console.log('checkAuthStatus: User account check failed')
            return null
          }
        } catch (walletError) {
          // Wallet bağlantı hatası, localStorage'ı temizle
          localStorage.removeItem('walletAddress')
          console.log('checkAuthStatus: Wallet connection error, clearing localStorage:', walletError)
          return null
        }
      } else {
        // Ethereum provider yok, localStorage'ı temizle
        localStorage.removeItem('walletAddress')
        console.log('checkAuthStatus: No ethereum provider found, clearing localStorage')
        return null
      }
      
      return null
    } catch (error) {
      console.error('checkAuthStatus error:', error)
      return rejectWithValue('Failed to check auth status')
    }
  }
)

// Kullanıcı girişi (wallet bağlantısı ile)
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (address: string, { dispatch, rejectWithValue }) => {
    try {
      // Manuel disconnect flag'ini temizle (yeni bağlantı yapılıyor)
      localStorage.removeItem('manualDisconnect')
      
      // Wallet adresini kaydet
      dispatch(setWalletAddress(address))
      
      // Kullanıcı hesabını kontrol et
      const result = await dispatch(checkUserAccount(address))
      if (checkUserAccount.fulfilled.match(result)) {
        return result.payload
      } else {
        throw new Error('Failed to check user account')
      }
    } catch (error) {
      return rejectWithValue('Login failed')
    }
  }
)

// Kullanıcı kaydı (blockchain'e kayıt)
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (
    { address, username, ipfsUrl }: { address: string; username: string; ipfsUrl: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Blockchain'e kayıt
      const result = await dispatch(registerUserOnBlockchain({ address, username, ipfsUrl }))
      
      if (registerUserOnBlockchain.fulfilled.match(result)) {
        // Başarılı kayıt sonrası kullanıcı hesabını tekrar kontrol et
        await dispatch(checkUserAccount(address))
        return result.payload
      } else {
        throw new Error('Registration failed')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed')
    }
  }
)

// Yeni user hesabı oluştur
export const createUserAccount = createAsyncThunk(
  'auth/createUserAccount',
  async (address: string, { rejectWithValue }) => {
    try {
      // Doğrudan blockchain'de hesap oluştur - şimdilik mock
      const mockAccount: IUserAccount = {
        address: address,
        balance: '0',
        isRegistered: false,
        username: undefined,
        profileImageUrl: undefined,
        gameStats: {
          gamesPlayed: 0,
          gamesWon: 0,
          totalEarnings: '0'
        }
      }
      
      return mockAccount
    } catch (error) {
      return rejectWithValue('Failed to create account')
    }
  }
)

// Blockchain'e kullanıcı kaydı
export const registerUserOnBlockchain = createAsyncThunk(
  'auth/registerUserOnBlockchain',
  async (
    { address, username, ipfsUrl }: { address: string; username: string; ipfsUrl: string },
    { rejectWithValue }
  ) => {
    try {
      // Doğrudan blockchain'e kayıt - şimdilik mock
      const mockResult = {
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        username,
        ipfsUrl,
        address
      }
      
      return mockResult
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed')
    }
  }
)

// Username müsaitlik kontrolü
export const checkUsernameAvailability = createAsyncThunk(
  'auth/checkUsernameAvailability',
  async (username: string, { rejectWithValue }) => {
    try {
      // Doğrudan blockchain'den kontrol et - şimdilik mock
      // Gerçek implementasyonda AccountService kullanılacak
      const isAvailable = !['admin', 'test', 'user'].includes(username.toLowerCase())
      
      return isAvailable
    } catch (error) {
      return rejectWithValue('Failed to check username')
    }
  }
)

// Logout async thunk
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    // Logout işlemleri (cüzdan bağlantısını kesme vb.)
    localStorage.removeItem('walletAddress')
    return null
  }
)

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  userAccount: undefined,
  isLoading: false,
  error: null
}

// Slice tanımı
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Kullanıcı bilgilerini güncelle
    updateUserAccount: (state, action: PayloadAction<Partial<IUserAccount>>) => {
      if (state.userAccount) {
        Object.assign(state.userAccount, action.payload)
      }
    },
    
    // Error temizle
    clearAuthError: (state) => {
      state.error = null
    },
    
    // Registration step ayarla
    setRegistrationStep: (state, action: PayloadAction<AuthState['registrationStep']>) => {
      state.registrationStep = action.payload
    },
    
    // Wallet adresini ayarla
    setWalletAddress: (state, action: PayloadAction<string>) => {
      state.walletAddress = action.payload
      localStorage.setItem('walletAddress', action.payload)
      // Manuel disconnect flag'ini temizleme - sadece kullanıcı bilerek bağlanırsa temizlensin
    },
    
    // Local storage'dan wallet kontrol et (hydration)
    checkWalletStatus: (state) => {
      const walletAddress = localStorage.getItem('walletAddress')
      if (walletAddress) {
        state.walletAddress = walletAddress
        // Bu durumda kullanıcı hesabını tekrar kontrol etmek gerekebilir
      }
    },
    
    // Auth state'ini tamamen temizle (wallet bağlantısı kesildiğinde)
    clearAuthState: (state) => {
      state.isAuthenticated = false
      state.userAccount = undefined
      state.walletAddress = undefined
      state.error = null
      state.isLoading = false
      state.registrationStep = undefined
      
      // LocalStorage'ı da temizle - agresif temizlik + manuel disconnect flag
      try {
        localStorage.removeItem('walletAddress')
        localStorage.removeItem('userAccount')
        localStorage.removeItem('authState')
        // Manuel disconnect flag'ini set et - sayfa yenileme sonrası kontrol için
        localStorage.setItem('manualDisconnect', 'true')
        console.log('🔴 clearAuthState: Manual disconnect flag set to TRUE')
        console.log('🔴 clearAuthState: All localStorage cleared, manualDisconnect=true')
      } catch (error) {
        console.error('Error clearing localStorage:', error)
      }
    },
    
    // Profil oluşturulduktan sonra authentication state'ini güncelle
 profileCreated: (state) => {
  if (state.userAccount) {
    state.userAccount.isRegistered = true;
  }
  state.registrationStep = undefined;
  state.isAuthenticated = true;
  console.log('Profile created - state updated');
}

  
  },
  extraReducers: (builder) => {
    // Check auth status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(checkUserAccount.fulfilled, (state, action) => {
  state.isLoading = false;
  
  if (action.payload) {
    state.userAccount = action.payload.account || undefined;
    state.walletAddress = action.payload.address;
    
    // Yeni mantık: hasAccount ve hasProfile'e göre durumları ayarla
    const { hasAccount, hasProfile } = action.payload;
    
    if (hasAccount && hasProfile) {
      // Tam authenticated
      state.isAuthenticated = true;
      state.registrationStep = undefined;
    } else if (hasAccount && !hasProfile) {
      // Hesap var ama profil yok
      state.isAuthenticated = true; // Hesap olduğu için authenticated say
      state.registrationStep = 'profile';
    } else {
      // Hesap yok
      state.isAuthenticated = false;
      state.registrationStep = undefined;
    }
  }
})
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        logAuthState(state, 'checkAuthStatus.rejected')
      })

    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload && action.payload.account) {
          state.userAccount = action.payload.account
          state.walletAddress = action.payload.address
          state.isAuthenticated = action.payload.account.isRegistered
          
          if (!action.payload.account.isRegistered) {
            state.registrationStep = undefined // Artık username registration kullanmıyoruz
          }
        }
        // Tek bir temiz log
        logAuthState(state, 'loginUser.fulfilled')
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        logAuthState(state, 'loginUser.rejected')
      })

    // Register user
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, _action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.registrationStep = 'completed'
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Check user account
    builder
      .addCase(checkUserAccount.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(checkUserAccount.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Create user account
    builder
      .addCase(createUserAccount.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createUserAccount.fulfilled, (state, action) => {
        state.isLoading = false
        state.userAccount = action.payload
        state.registrationStep = undefined // Artık kullanmıyoruz
      })
      .addCase(createUserAccount.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Register on blockchain
    builder
      .addCase(registerUserOnBlockchain.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.registrationStep = undefined // Artık kullanmıyoruz
      })
      .addCase(registerUserOnBlockchain.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.registrationStep = 'completed'
        
        if (state.userAccount) {
          state.userAccount.isRegistered = true
          state.userAccount.username = action.payload.username
          state.userAccount.profileImageUrl = action.payload.ipfsUrl
        }
      })
      .addCase(registerUserOnBlockchain.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.registrationStep = undefined
      })
    
    // Username availability check
    builder
      .addCase(checkUsernameAvailability.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkUsernameAvailability.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(checkUsernameAvailability.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isAuthenticated = false
      state.userAccount = undefined
      state.walletAddress = undefined
      state.error = null
      state.isLoading = false
      state.registrationStep = undefined
    })
  }
})

// Export actions
export const { 
  updateUserAccount, 
  clearAuthError, 
  setRegistrationStep,
  setWalletAddress,
  checkWalletStatus,
  clearAuthState,
  profileCreated
} = authSlice.actions

// Debug helper function - auth state'ini loglamak için
export const logAuthState = (state: AuthState, context?: string) => {
  const authStateSnapshot = {
    context: context || 'Auth State',
    isAuthenticated: state.isAuthenticated,
    hasUserAccount: !!state.userAccount,
    hasWalletAddress: !!state.walletAddress,
    isLoading: state.isLoading,
    hasError: !!state.error,
    registrationStep: state.registrationStep || null,
    userProfile: state.userAccount ? {
      address: state.userAccount.address,
      isRegistered: state.userAccount.isRegistered,
      hasUsername: !!state.userAccount.username,
      hasProfileImage: !!state.userAccount.profileImageUrl,
      balance: state.userAccount.balance
    } : null
  }
  
  console.log('Auth State:', authStateSnapshot)
}

// Export reducer
export default authSlice.reducer

// Selectors
export const selectAuthState = (state: RootState) => state.auth
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectUserAccount = (state: RootState) => state.auth.userAccount
export const selectAuthError = (state: RootState) => state.auth.error
export const selectAuthLoading = (state: RootState) => state.auth.isLoading
export const selectRegistrationStep = (state: RootState) => state.auth.registrationStep
export const selectWalletAddress = (state: RootState) => state.auth.walletAddress
