import React from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Fade,
} from '@mui/material'
import {
  ExitToApp as LogoutIcon,
  AccountCircle as UserIcon,
} from '@mui/icons-material'
import { useReduxAuth } from '../../features/auth'

const GamePage: React.FC = () => {
  const { user, logout } = useReduxAuth()

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4" color="white">
          Yetkilendirme gerekli...
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
      }}
    >
      <Container maxWidth="md">
        <Fade in timeout={800}>
          <Card
            elevation={24}
            sx={{
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <CardContent sx={{ padding: 6 }}>
              {/* User Welcome */}
              <Box mb={4}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    margin: '0 auto 16px auto',
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    mb: 1,
                  }}
                >
                  Hoş geldin, {user.name}! 🎉
                </Typography>
                
                <Chip
                  icon={<UserIcon />}
                  label={`Oyuncu ID: ${user.id.slice(0, 8)}`}
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    mb: 2,
                  }}
                />
              </Box>

              {/* Game Status */}
              <Box mb={4}>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 2,
                    fontWeight: 500,
                  }}
                >
                  Oyun yakında başlayacak...
                </Typography>
                
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 1,
                  }}
                >
                  🎮 Oyun modu seçiliyor
                </Typography>
                
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 1,
                  }}
                >
                  👥 Diğer oyuncular bekleniyor
                </Typography>
                
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  🎲 3D oyun tahtası hazırlanıyor
                </Typography>
              </Box>

              {/* Wallet Status */}
              {user.walletAddress && (
                <Box mb={4}>
                  <Chip
                    label={`🔗 Cüzdan: ${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
                    variant="filled"
                    color="secondary"
                    sx={{ mb: 2 }}
                  />
                </Box>
              )}

              {/* Actions */}
              <Box>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<LogoutIcon />}
                  onClick={logout}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Çıkış Yap
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  )
}

export default GamePage
