import React from 'react'
import { Box, Typography, Button } from '@mui/material'

interface AccountCreationOverlayProps {
  open: boolean
  walletAddress: string
  onClose: () => void
}

export const AccountCreationOverlay: React.FC<AccountCreationOverlayProps> = ({
  open,
}) => {
  
  const handleGoToAccountCreation = () => {
    // External domain'e yönlendir
    const accountCreationDomain = import.meta.env.VITE_ACCOUNT_CREATION_DOMAIN || 'https://account.ludopoly.com'
    window.open(accountCreationDomain, '_blank')
  }

  if (!open) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          p: 4,
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'white', 
            mb: 3, 
            fontWeight: 600,
          }}
        >
          Account Not Found
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            mb: 4,
          }}
        >
          No account found for this wallet address. Please create an account to continue.
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          onClick={handleGoToAccountCreation}
        >
          Create Account
        </Button>
      </Box>
    </Box>
  )
}
