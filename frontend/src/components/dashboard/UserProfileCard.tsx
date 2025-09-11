import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  CircularProgress,
} from '@mui/material'
import {
  MoreVert as MoreIcon,
  AccountBalanceWallet as WalletIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import { UserAvatar } from '../common/UserAvatar'
// import { useProfile } from '../../hooks/useProfile'

// Type definitions - Dependency Inversion Principle
export interface UserProfileData {
  username?: string
  displayName?: string      // Blockchain'den gelen gerçek isim
  avatarCID?: string       // IPFS CID for avatar
  avatarImageUrl?: string  // IPFS'ten resolve edilen image URL
  bio?: string            // Profile bio
  nationality?: string    // Milliyeti
  walletAddress: string
  walletBalance: string
  gamesPlayed?: number
  totalWinnings?: string
  rank?: string
  isAuthenticated: boolean
}

export interface ProfileCardActions {
  onLogout: () => void
  onProfileSettings?: () => void
  onGameSettings?: () => void
  onProfileUpdated?: () => void

}

// Component props - Open/Closed Principle
interface UserProfileCardProps {
  userData: UserProfileData
  actions: ProfileCardActions
  variant?: 'compact' | 'expanded'
  showMenu?: boolean
  isLoading?: boolean
}

// Style Factory - Open/Closed Principle
interface CardStyleConfig {
  minWidth: string
  maxWidth?: string
  borderRadius: string
  hasHoverEffect: boolean
}

const createCardStyles = (variant: 'compact' | 'expanded'): CardStyleConfig => {
  const baseConfig: CardStyleConfig = {
    minWidth: '280px',
    borderRadius: '16px',
    hasHoverEffect: true,
  }

  const variantConfigs: Record<string, Partial<CardStyleConfig>> = {
    compact: {
      maxWidth: '320px',
      borderRadius: '16px',
    },
    expanded: {
      minWidth: '350px',
      borderRadius: '20px',
    },
  }

  return { ...baseConfig, ...variantConfigs[variant] }
}

const getCardSx = (variant: 'compact' | 'expanded') => {
  const config = createCardStyles(variant)
  
  return {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: config.borderRadius,
    minWidth: config.minWidth,
    ...(config.maxWidth && { maxWidth: config.maxWidth }),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    ...(config.hasHoverEffect && {
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.12)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
    }),
  }
}

const contentStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  padding: '12px !important',
}

// Pure component - Single Responsibility Principle
export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  userData,
  actions,
  variant = 'compact',
  showMenu = true,
  isLoading = false,
}) => {
  // Local state for UI only
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  // Pure utility functions
  const formatAddress = (address: string): string => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Event handlers
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    actions.onLogout()
    handleMenuClose()
  }

  const handleProfileSettings = () => {
    actions.onProfileSettings?.()
    handleMenuClose()
  }

  const handleGameSettings = () => {
    handleMenuClose()
    actions.onGameSettings?.()
  }

  // Early return for unauthenticated state
  if (!userData.isAuthenticated) {
    return null
  }

  return (
    <>
      <Card sx={getCardSx(variant)}>
        <CardContent sx={contentStyles}>
          {/* User Header Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <UserAvatar
              avatarUrl={userData.avatarCID}
              avatarImageUrl={userData.avatarImageUrl}
              username={userData.username}
              displayName={userData.displayName}
              walletAddress={userData.walletAddress}
              size={variant === 'expanded' ? 44 : 36}
              showBorder={true}
            />
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant={variant === 'expanded' ? 'subtitle1' : 'body2'} 
                sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                }}
              >
                {userData.displayName || userData.username || 'Anonymous'}
              </Typography>
              
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255,255,255,0.6)',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  lineHeight: 1,
                }}
              >
                {formatAddress(userData.walletAddress)}
              </Typography>
            </Box>

            {/* Menu Button - Minimal */}
            {showMenu && (
              <IconButton
                onClick={handleMenuClick}
                size="small"
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    color: 'white',
                    background: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <MoreIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Minimal Balance Display */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.06)', 
            borderRadius: '8px', 
            px: 1.5,
            py: 1,
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <WalletIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                Balance
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#10B981', 
                fontWeight: 600,
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              }}
            >
              {userData.walletBalance} ETH
            </Typography>
          </Box>

          {/* Expanded Stats Section - Minimal */}
          {variant === 'expanded' && (
            <>
              <Box sx={{ 
                height: '1px', 
                background: 'rgba(255,255,255,0.08)', 
                my: 0.5 
              }} />
              
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
                  <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.6)' }} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 1 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '1.1rem' }}>
                      {userData.gamesPlayed || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
                      Games
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#10B981', fontWeight: 600, fontSize: '1.1rem' }}>
                      {userData.totalWinnings || '0'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
                      Winnings
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Chip 
                      label={userData.rank || 'New'}
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.7rem',
                        height: '24px',
                        '& .MuiChip-label': {
                          px: 1.5,
                        }
                      }}
                    />
                  </Box>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Minimal Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            mt: 1,
            minWidth: '160px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        <MenuItem 
          onClick={handleProfileSettings} 
          sx={{ 
            color: 'rgba(255,255,255,0.9)', 
            gap: 1.5,
            py: 1,
            fontSize: '0.85rem',
            '&:hover': {
              background: 'rgba(255,255,255,0.1)',
            }
          }}
        >
          <PersonIcon sx={{ fontSize: 16 }} />
          Profile
        </MenuItem>
        <MenuItem 
          onClick={handleGameSettings} 
          sx={{ 
            color: 'rgba(255,255,255,0.9)', 
            gap: 1.5,
            py: 1,
            fontSize: '0.85rem',
            '&:hover': {
              background: 'rgba(255,255,255,0.1)',
            }
          }}
        >
          <SettingsIcon sx={{ fontSize: 16 }} />
          Settings
        </MenuItem>
        <Box sx={{ height: '1px', background: 'rgba(255,255,255,0.1)', mx: 1, my: 0.5 }} />
        <MenuItem 
          onClick={handleLogout} 
          sx={{ 
            color: '#EF4444', 
            gap: 1.5,
            py: 1,
            fontSize: '0.85rem',
            '&:hover': {
              background: 'rgba(239, 68, 68, 0.1)',
            }
          }}
        >
          <LogoutIcon sx={{ fontSize: 16 }} />
          Disconnect
        </MenuItem>
      </Menu>
    </>
  )
}
