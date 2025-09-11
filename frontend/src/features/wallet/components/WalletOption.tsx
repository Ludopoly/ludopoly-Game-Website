import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material'
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material'
import type { IWalletProvider } from '../interfaces/IWallet'

// Single Responsibility: Sadece tek bir wallet seçeneği gösterimi
interface WalletOptionProps {
  provider: IWalletProvider
  isConnecting: boolean
  onClick: () => void
}

export const WalletOption: React.FC<WalletOptionProps> = ({
  provider,
  isConnecting,
  onClick
}) => {
  const connection = provider.createConnection()
  const isInstalled = connection.isInstalled()
  const isMetaMask = provider.id === 'metamask'

  const renderActionButton = () => {
    if (!isMetaMask) {
      return (
        <Chip
          size="small"
          label="Coming Soon"
          sx={{
            background: 'rgba(255, 255, 255, 0.05)', 
            color: 'rgba(255, 255, 255, 0.4)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            fontSize: '0.75rem',
          }}
        />
      )
    }

    if (!isInstalled) {
      return (
        <Button
          component="a"
          variant="outlined"
          size="small"
          href={provider.downloadUrl || '#'}
          target="_blank"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)', 
            borderColor: 'rgba(255, 255, 255, 0.2)', 
            fontSize: '0.75rem',
            minWidth: 'auto',
            px: 2,
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.3)', 
              backgroundColor: 'rgba(255, 255, 255, 0.03)', 
            },
          }}
        >
          Install
        </Button>
      )
    }

    if (isConnecting) {
      return <CircularProgress size={20} sx={{ color: 'primary.main' }} /> 
    }

    return (
      <Box
        sx={{
          width: 28, // Daha küçük buton
          height: 28,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <WalletIcon sx={{ color: 'white', fontSize: '1rem' }} /> {/* Daha küçük ikon */}
      </Box>
    )
  }

  return (
    <Card
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.02)', 
        border: '1px solid rgba(255, 255, 255, 0.08)', 
        borderRadius: 2,
        cursor: isMetaMask && isInstalled ? 'pointer' : 'default',
        transition: 'all 0.3s ease-in-out',
        backdropFilter: 'blur(10px)', 
        '&:hover': isMetaMask && isInstalled ? {
          background: 'rgba(255, 255, 255, 0.05)', 
          borderColor: 'rgba(99, 102, 241, 0.3)', 
          transform: 'translateY(-2px)',
        } : {},
      }}
      onClick={isMetaMask && isInstalled ? onClick : undefined}
    >
      <CardContent 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2, // Daha küçük padding
          '&:last-child': { pb: 2 }, // Consistent padding
        }}
      >
        <Box
          sx={{
            width: 48, // 48x48 pixel kutu
            height: 48,
            borderRadius: 2,
            background: 'transparent', // Tamamen şeffaf
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2.5,
          }}
        >
          {typeof provider.icon === 'string' && provider.icon.startsWith('/') ? (
            <img 
              src={provider.icon} 
              alt={provider.name}
              style={{ 
                width: '40px', // Daha büyük logo (kutuyu daha çok kaplar)
                height: '40px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                // Logo yüklenemezse fallback emoji göster
                e.currentTarget.style.display = 'none'
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'
                }
              }}
            />
          ) : (
            <span style={{ fontSize: '24px' }}>
              {provider.id === 'metamask' ? '🦊' : 
               provider.id === 'walletconnect' ? '🔗' : 
               provider.id === 'coinbase' ? '🔵' : '💼'}
            </span>
          )}
          {/* Fallback emoji (başlangıçta gizli) */}
          <span 
            style={{ 
              fontSize: '24px', 
              display: 'none' 
            }}
          >
            {provider.id === 'metamask' ? '🦊' : 
             provider.id === 'walletconnect' ? '🔗' : 
             provider.id === 'coinbase' ? '🔵' : '💼'}
          </span>
        </Box>
        
        <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 600,
              mb: 0.5,
              fontSize: '1rem', // Daha küçük yazı
            }}
          >
            {provider.name}
          </Typography>
        </Box>

        <Box sx={{ ml: 1.5 }}> {/* Daha az margin */}
          {renderActionButton()}
        </Box>
      </CardContent>
    </Card>
  )
}
