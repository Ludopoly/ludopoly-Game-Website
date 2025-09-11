import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import walletReducer from './slices/walletSlice'
import authReducer from './slices/authSlice'
import gameReducer from './slices/gameSlice'
import { snackbarMiddleware } from './middleware/snackbarMiddleware'

// Debug: Store değişimlerini loglamak için middleware
const loggerMiddleware = (storeAPI: any) => (next: any) => (action: any) => {
  console.log('%c[Redux Action]', 'color: #4e88e6', action)
  const result = next(action)
  console.log('%c[Redux State]', 'color: #e67e22', storeAPI.getState())
  return result
}

// Store yapılandırması
export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    auth: authReducer,
    game: gameReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Wallet service instance'ları serializable olmayabilir
        ignoredActions: ['wallet/setWalletService'],
        ignoredPaths: ['wallet.service'],
      },
    })
      .prepend(snackbarMiddleware.middleware)
      .concat(loggerMiddleware),
})

// TypeScript için type tanımları
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks - Her yerde bu hook'ları kullanacağız
export const useAppDispatch = () => {
  const dispatch = useDispatch<AppDispatch>()
  return (action: any) => {
    console.log('%c[useAppDispatch]', 'color: #16a085', action)
    return dispatch(action)
  }
}
export const useAppSelector: TypedUseSelectorHook<RootState> = (selector, equalityFn?) => {
  const selected = useSelector(selector, equalityFn)
  console.log('%c[useAppSelector]', 'color: #8e44ad', selected)
  return selected
}

export default store
