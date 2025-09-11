import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Fade,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
} from '@mui/material'
import {
  SportsEsports as GameIcon,
  EmojiEvents as TrophyIcon,
  Group as GroupIcon,
  Psychology as StrategyIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material'
import { useReduxWallet } from '../../wallet/context/ReduxWalletProvider'
import type { LoginCredentials } from '../types'

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>
  isLoading?: boolean
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading = false }) => {
  const [playerName, setPlayerName] = useState('')
  const { address, balance } = useReduxWallet()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (playerName.trim()) {
      await onLogin({ 
        name: playerName.trim(),
        walletAddress: address || undefined
      })
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1E1A31 0%, #2D1B69 50%, #16122B 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={600}>
          <Card
            elevation={24}
            sx={{
              maxWidth: 450,
              margin: '0 auto',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            <CardContent sx={{ padding: 6 }}>
              {/* Game Logo */}
              <Box textAlign="center" mb={4}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3rem' },
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                    textShadow: 'none',
                  }}
                >
                  🎲 LUDOPOLY 🎲
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  Eğlenceli Strateji Oyunu
                </Typography>
              </Box>

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit}>
                <Typography
                  variant="h4"
                  textAlign="center"
                  mb={3}
                  sx={{ fontWeight: 600 }}
                >
                  Oyuna Başla
                </Typography>

                {/* Wallet Info */}
                {address && (
                  <Alert 
                    severity="success" 
                    sx={{ mb: 3 }}
                    icon={<WalletIcon />}
                  >
                    <Box>
                      <Typography variant="body2">
                        🔗 <strong>Cüzdan:</strong> {formatAddress(address)}
                      </Typography>
                      {balance && (
                        <Typography variant="body2">
                          💰 <strong>Bakiye:</strong> {balance} ETH
                        </Typography>
                      )}
                    </Box>
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Oyuncu Adın"
                  variant="outlined"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Adını gir..."
                  inputProps={{ maxLength: 20 }}
                  disabled={isLoading}
                  sx={{ mb: 3 }}
                  autoFocus
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={!playerName.trim() || isLoading}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    mb: 3,
                    position: 'relative',
                  }}
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <GameIcon />
                    )
                  }
                >
                  {isLoading ? 'Bağlanıyor...' : 'Oyunu Başlat'}
                </Button>

                {/* Game Features */}
                <Box
                  sx={{
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <List dense>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <GroupIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Arkadaşlarınla rekabet et"
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          color: 'text.secondary',
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <StrategyIcon color="secondary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Strateji geliştir ve kazan"
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          color: 'text.secondary',
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <TrophyIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Eğlenceli oyun deneyimi"
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          color: 'text.secondary',
                        }}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  )
}

export default LoginForm
