import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { IWalletConnectionState, IWalletService } from '../../features/wallet/interfaces/IWallet'
import { WalletService } from '../../features/wallet/services/WalletService'

// RootState type - circular dependency'den kaçınmak için any kullanıyoruz
type RootState = any

// Async thunk'lar - SOLID prensiplerine uygun olarak service injection kullanıyoruz
export const connectWallet = createAsyncThunk(
  'wallet/connect',
  async (providerId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { wallet: WalletState }
      const service = state.wallet.service || new WalletService()
      
      await service.connectWallet(providerId)
      return service.getConnectionState()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const disconnectWallet = createAsyncThunk(
  'wallet/disconnect',
  async (_, { getState }) => {
    const state = getState() as { wallet: WalletState }
    const service = state.wallet.service
    
    if (service) {
      service.disconnectWallet()
      return service.getConnectionState()
    }
    
    return {
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
      isConnecting: false,
      error: null
    }
  }
)

export const switchNetwork = createAsyncThunk(
  'wallet/switchNetwork',
  async (chainId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { wallet: WalletState }
      const service = state.wallet.service
      
      if (!service) {
        throw new Error('Wallet service not initialized')
      }
      
      await service.switchNetwork(chainId)
      return service.getConnectionState()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// State interface
interface WalletState extends IWalletConnectionState {
  service: IWalletService | null
}

// Initial state
const initialState: WalletState = {
  isConnected: false,
  address: null,
  balance: null,
  chainId: null,
  isConnecting: false,
  error: null,
  service: null,

}

// Slice tanımı
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    // Service injection için reducer - Dependency Inversion Principle
    setWalletService: (state, action: PayloadAction<IWalletService>) => {
      state.service = action.payload
      
      // Service'in mevcut state'ini al
      const currentState = action.payload.getConnectionState()
      Object.assign(state, currentState)
      
      // Service state değişikliklerini dinle
      action.payload.onStateChange((newState) => {
        // Bu Redux dışından gelen state güncellemelerini handle etmek için
        // middleware veya saga kullanmak daha iyi olurdu, ama şimdilik böyle
      })
    },
    
    // Manual state updates
    updateConnectionState: (state, action: PayloadAction<Partial<IWalletConnectionState>>) => {
      Object.assign(state, action.payload)
    },
    
    // Error clearing
    clearError: (state) => {
      state.error = null
    },
    
    // Reset state
    resetWallet: (state) => {
      Object.assign(state, initialState)
      state.service = null
    }
  },
  extraReducers: (builder) => {
    // Connect wallet
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true
        state.error = null
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        Object.assign(state, action.payload)
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false
        state.error = action.payload as string
      })
    
    // Disconnect wallet
    builder.addCase(disconnectWallet.fulfilled, (state, action) => {
      Object.assign(state, action.payload)
    })
    
    // Switch network
    builder
      .addCase(switchNetwork.pending, (state) => {
        state.error = null
      })
      .addCase(switchNetwork.fulfilled, (state, action) => {
        Object.assign(state, action.payload)
      })
      .addCase(switchNetwork.rejected, (state, action) => {
        state.error = action.payload as string
      })
  }
})

// Export actions
export const { 
  setWalletService, 
  updateConnectionState, 
  clearError, 
  resetWallet 
} = walletSlice.actions

// Ek selector
export const selectHasCheckedAccount = (state: RootState) => state.wallet.hasCheckedAccount

// Export reducer
export default walletSlice.reducer

// Selectors
export const selectWalletState = (state: RootState) => state.wallet
export const selectIsConnected = (state: RootState) => state.wallet.isConnected
export const selectWalletAddress = (state: RootState) => state.wallet.address
export const selectWalletBalance = (state: RootState) => state.wallet.balance
export const selectWalletError = (state: RootState) => state.wallet.error
export const selectIsConnecting = (state: RootState) => state.wallet.isConnecting
