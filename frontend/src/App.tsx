import { Provider } from 'react-redux'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { ludopolyTheme } from './theme'
import './App.css'
import "../../frontend/src/index.css"
import { store } from './store'
import { ReduxWalletProvider } from './features/wallet'
import { ReduxAuthProvider } from './features/auth'
import { SnackbarProvider } from './context/SnackbarProvider'
import { MainLayout } from './components/layout/MainLayout'


function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={ludopolyTheme}>
        <CssBaseline />
        <SnackbarProvider>
          <ReduxWalletProvider>
            <ReduxAuthProvider>
               <MainLayout /> 
            </ReduxAuthProvider>
          </ReduxWalletProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  )
}

export default App


