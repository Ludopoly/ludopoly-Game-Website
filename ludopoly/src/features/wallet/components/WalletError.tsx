import React from 'react'
import { Alert } from '@mui/material'
import { Error as ErrorIcon } from '@mui/icons-material'

// Single Responsibility: Sadece hata mesajı gösterimi
interface WalletErrorProps {
  error: string
}

export const WalletError: React.FC<WalletErrorProps> = ({ error }) => (
  <Alert 
    severity="error" 
    sx={{ 
      mb: 3,
      background: 'rgba(244, 67, 54, 0.1)',
      border: '1px solid rgba(244, 67, 54, 0.3)',
      color: 'white',
    }}
    icon={<ErrorIcon />}
  >
    {error}
  </Alert>
)
