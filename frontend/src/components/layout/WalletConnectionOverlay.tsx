import React from 'react'
import {
  Box,
  Typography,
  Container,
  Fade,
  Paper,
} from '@mui/material'
import { WalletProviderFactory } from '../../features/wallet/providers/WalletProviders'
import { WalletOption } from '../../features/wallet/components/WalletOption'
import { useReduxWallet } from '../../features/wallet/context/ReduxWalletProvider'
import { walletConnectionStyles } from '../../styles'

// Single Responsibility: Ana sayfada cüzdan bağlantı overlay'ini yönetir
export const WalletConnectionOverlay: React.FC = () => {
  const { isConnecting, connectWallet } = useReduxWallet()

  const handleWalletConnect = async (providerId: string) => {
    try {
      // Kullanıcı manuel olarak bağlanıyor - manuel disconnect flag'ini temizle
      localStorage.removeItem('manualDisconnect')
      console.log('🟢 WalletConnectionOverlay: Manual connection initiated, cleared disconnect flag')
      
      await connectWallet(providerId)
    } catch (error) {
      console.error('Wallet connection failed:', error)
    }
  }

  return (
    <Container maxWidth="sm">
      <Fade in timeout={800}>
        <Paper elevation={24} sx={walletConnectionStyles.walletPaper}>
          {/* Header */}
          <Box mb={4}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Welcome to Ludopoly
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 400,
                mb: 1,
              }}
            >
              Connect Your Wallet to Start Playing
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                maxWidth: 400,
                mx: 'auto',
              }}
            >
              Choose your preferred wallet to connect and join the ultimate blockchain monopoly experience
            </Typography>
          </Box>

          {/* Wallet Options */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2,
            mb: 4 
          }}>
            {WalletProviderFactory.getAllProviders().map((provider) => (
              <WalletOption
                key={provider.id}
                provider={provider}
                isConnecting={isConnecting}
                onClick={() => handleWalletConnect(provider.id)}
              />
            ))}
          </Box>

          {/* Footer */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.8rem',
                lineHeight: 1.4,
              }}
            >
              By connecting your wallet, you agree to our{' '}
              <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer' }}>
                Terms of Service
              </Box>{' '}
              and{' '}
              <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer' }}>
                Privacy Policy
              </Box>
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </Container>
  )
}
