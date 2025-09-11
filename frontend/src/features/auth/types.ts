// User interface
export interface User {
  id: string
  name: string
  walletAddress?: string
  currentRoomId?: string
  avatar?: string
  createdAt: Date
}

// Authentication state
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error?: string
}

// Login credentials for form
export interface LoginCredentials {
  name: string
  walletAddress?: string
}

// Wallet connection details
export interface WalletConnection {
  address: string
  provider: 'MetaMask' | 'Phantom' | 'WalletConnect'
  chainId: number
  isConnected: boolean
}

// Auth context type
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  connectWallet: (wallet: WalletConnection) => Promise<void>
  disconnectWallet: () => void
}

// Form validation errors
export interface ValidationErrors {
  name?: string
  walletAddress?: string
}

// Auth actions for state management
export type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'WALLET_CONNECT'; payload: WalletConnection }
  | { type: 'WALLET_DISCONNECT' }
