import React from 'react'
import {
  Box,
  Typography,
  Chip,
  Container,
  Fade,
  Paper,
} from '@mui/material'
import {
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import { useReduxWallet } from '../context/ReduxWalletProvider'
import { WalletProviderFactory } from '../providers/WalletProviders'
import { WalletHeader } from './WalletHeader'
import { WalletFooter } from './WalletFooter'
import { WalletOption } from './WalletOption'

// Single Responsibility: Sadece wallet bağlantı UI'ını yönetir
// Open/Closed: Yeni wallet türleri factory'den eklenebilir
// Liskov Substitution: Tüm wallet provider'lar aynı interface'i kullanır
// Interface Segregation: Her bileşen sadece ihtiyacı olan interface'leri kullanır
// Dependency Inversion: Concrete implementasyonlara değil soyutlamalara bağımlı

const WalletConnect: React.FC = () => {
  const { 
    isConnected, 
    address, 
    balance, 
    chainId, 
    isConnecting, 
    connectWallet 
  } = useReduxWallet()

  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getNetworkName = (chainId: number): string => {
    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      80001: 'Mumbai Testnet'
    }
    return networks[chainId] || `Chain ID: ${chainId}`
  }

  const handleWalletConnect = async (providerId: string): Promise<void> => {
    try {
      await connectWallet(providerId)
    } catch (error) {
      // Manual error handling - middleware de yakalayacak ama buradan da ekstra bilgi verebiliriz
      console.error('Wallet connection failed:', error)
    }
  }

  // Connected state UI
  if (isConnected && address) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'transparent', // 3D arka planı için şeffaf
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Fade in timeout={800}>
            <Paper
              elevation={24}
              sx={{
                background: 'rgba(30, 39, 64, 0.4)', // Çok daha şeffaf
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
                p: 4,
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              }}
            >
              <CheckIcon 
                sx={{ 
                  fontSize: '4rem', 
                  color: 'success.main', 
                  mb: 2 
                }} 
              />
              
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                🎉 Wallet Connected!
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={<WalletIcon />}
                  label={formatAddress(address)}
                  color="primary"
                  sx={{
                    fontSize: '1rem',
                    height: 40,
                    mb: 2,
                  }}
                />
                
                {balance && (
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    💰 Balance: {balance} ETH
                  </Typography>
                )}
                
                {chainId && (
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    🌐 {getNetworkName(chainId)}
                  </Typography>
                )}
              </Box>

              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 3,
                }}
              >
                You're now ready to play Ludopoly! All blockchain transactions will be made with this wallet.
              </Typography>
            </Paper>
          </Fade>
        </Container>
      </Box>
    )
  }

  // Connection UI
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'transparent', // 3D arka planı için şeffaf
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper
            elevation={24}
            sx={{
              background: 'rgba(30, 39, 64, 0.4)', // Çok daha şeffaf
              backdropFilter: 'blur(2px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              p: 5,
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            }}
          >
            <WalletHeader 
              title="Select Your Wallet"
              subtitle="Choose your preferred wallet to connect"
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {WalletProviderFactory.getAllProviders().map((provider) => (
                <WalletOption
                  key={provider.id}
                  provider={provider}
                  isConnecting={isConnecting}
                  onClick={() => handleWalletConnect(provider.id)}
                />
              ))}
            </Box>

            <WalletFooter />
          </Paper>
        </Fade>
      </Container>
    </Box>
  )
}

export default WalletConnect
