import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { Snackbar, Alert, type AlertColor } from '@mui/material'
import { setSnackbarRef } from '../store/middleware/snackbarMiddleware'

interface SnackbarMessage {
  id: string
  message: string
  severity: AlertColor
  autoHideDuration?: number
}

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: AlertColor, autoHideDuration?: number) => void
  showError: (message: string) => void
  showSuccess: (message: string) => void
  showWarning: (message: string) => void
  showInfo: (message: string) => void
}

const SnackbarContext = createContext<SnackbarContextType | null>(null)

interface SnackbarProviderProps {
  children: ReactNode
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([])

  const showSnackbar = (
    message: string, 
    severity: AlertColor = 'info', 
    autoHideDuration: number = 6000
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2)
    const newSnackbar: SnackbarMessage = {
      id,
      message,
      severity,
      autoHideDuration
    }
    
    setSnackbars(prev => [...prev, newSnackbar])
  }

  const showError = (message: string) => showSnackbar(message, 'error', 8000)
  const showSuccess = (message: string) => showSnackbar(message, 'success', 4000)
  const showWarning = (message: string) => showSnackbar(message, 'warning', 6000)
  const showInfo = (message: string) => showSnackbar(message, 'info', 4000)

  // Middleware'e referansı ver
  useEffect(() => {
    setSnackbarRef({
      showError,
      showSuccess,
      showWarning,
      showInfo
    })

    // Cleanup
    return () => {
      setSnackbarRef(null)
    }
  }, [])

  const handleClose = (id: string) => {
    setSnackbars(prev => prev.filter(snackbar => snackbar.id !== id))
  }

  return (
    <SnackbarContext.Provider value={{
      showSnackbar,
      showError,
      showSuccess,
      showWarning,
      showInfo
    }}>
      {children}
      
      {/* Multiple Snackbars - sağ alttan yukarı doğru sıralanır */}
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={snackbar.id}
          open={true}
          autoHideDuration={snackbar.autoHideDuration}
          onClose={() => handleClose(snackbar.id)}
          anchorOrigin={{ 
            vertical: 'bottom', 
            horizontal: 'right' 
          }}
          sx={{
            position: 'fixed',
            bottom: 16 + (index * 80), // Her snackbar 80px yukarıda
            right: 16,
            zIndex: 9999,
          }}
        >
          <Alert 
            onClose={() => handleClose(snackbar.id)} 
            severity={snackbar.severity}
            variant="filled"
            sx={{
              width: '100%',
              minWidth: 300,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      ))}
    </SnackbarContext.Provider>
  )
}

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}
