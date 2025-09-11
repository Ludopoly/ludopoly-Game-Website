import { createListenerMiddleware } from '@reduxjs/toolkit'
import type { RootState } from '../index'

// Global snackbar referansı için
let snackbarRef: {
  showError: (message: string) => void
  showSuccess: (message: string) => void
  showWarning: (message: string) => void
  showInfo: (message: string) => void
} | null = null

export const setSnackbarRef = (ref: typeof snackbarRef) => {
  snackbarRef = ref
}

// Listener middleware for snackbar notifications
export const snackbarMiddleware = createListenerMiddleware()

// Wallet hatalarını dinle
snackbarMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    const current = (currentState as RootState).wallet.error
    const previous = (previousState as RootState)?.wallet?.error
    
    // Yeni bir hata oluştuysa
    return current !== null && current !== previous
  },
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    const error = state.wallet.error
    
    if (error && snackbarRef) {
      snackbarRef.showError(`Wallet Error: ${error}`)
    }
  }
})

// Auth hatalarını dinle  
snackbarMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    const current = (currentState as RootState).auth.error
    const previous = (previousState as RootState)?.auth?.error
    
    return current !== null && current !== previous
  },
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    const error = state.auth.error
    
    if (error && snackbarRef) {
      snackbarRef.showError(`Authentication Error: ${error}`)
    }
  }
})

// Game hatalarını dinle
snackbarMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    const current = (currentState as RootState).game.error
    const previous = (previousState as RootState)?.game?.error
    
    return current !== null && current !== previous
  },
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    const error = state.game.error
    
    if (error && snackbarRef) {
      snackbarRef.showError(`Game Error: ${error}`)
    }
  }
})

// Başarılı işlemleri dinle
snackbarMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    const currentConnected = (currentState as RootState).wallet.isConnected
    const previousConnected = (previousState as RootState)?.wallet?.isConnected
    
    // Wallet bağlantısı başarılı
    return currentConnected && !previousConnected
  },
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    const address = state.wallet.address
    
    if (address && snackbarRef) {
      const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
      snackbarRef.showSuccess(`Wallet Connected: ${shortAddress}`)
    }
  }
})

// Auth başarılı giriş
snackbarMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    const currentAuth = (currentState as RootState).auth.isAuthenticated
    const previousAuth = (previousState as RootState)?.auth?.isAuthenticated
    
    return currentAuth && !previousAuth
  },
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    const user = state.auth.user
    
    if (user && snackbarRef) {
      snackbarRef.showSuccess(`Welcome back, ${user.username}!`)
    }
  }
})
