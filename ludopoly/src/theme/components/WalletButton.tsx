import React from 'react'
import { Button, CircularProgress, Box, Chip } from '@mui/material'
import { styled } from '@mui/material/styles'
import { CheckCircle } from '@mui/icons-material'
import type { WalletButtonProps } from '../buttons/types'
import { buttonTokens } from '../buttons/tokens'

const StyledWalletButton = styled(Button, {
  shouldForwardProp: (prop) => !['variant', 'connecting', 'connected'].includes(prop as string)
})<WalletButtonProps>(({ theme, variant, size = 'medium', connecting, connected }) => ({
  ...buttonTokens.variants.wallet[variant],
  ...buttonTokens.sizes[size],
  
  // Connecting state
  ...(connecting && {
    pointerEvents: 'none',
    opacity: 0.8,
  }),
  
  // Connected state
  ...(connected ? {
    backgroundColor: '#10B981 !important',
    borderColor: '#059669 !important',
  } : {}),
  
  // Icon spacing
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1.5),
    fontSize: buttonTokens.iconSizes[size],
  },
  
  // Responsive
  [theme.breakpoints.down('sm')]: {
    padding: buttonTokens.sizes.small.padding,
    fontSize: buttonTokens.sizes.small.fontSize,
  },
}))

// Wallet icons mapping
const walletIcons = {
  metamask: '🦊',
  walletconnect: '🔗',
}

// Wallet names mapping
const walletNames = {
  metamask: 'MetaMask',
  walletconnect: 'WalletConnect',
}

export const WalletButton: React.FC<WalletButtonProps> = ({
  variant,
  size = 'medium',
  connecting = false,
  connected = false,
  address,
  disabled = false,
  fullWidth = false,
  onClick,
  ...props
}) => {
  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Get button content based on state
  const getButtonContent = () => {
    if (connected && address) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CheckCircle sx={{ fontSize: buttonTokens.iconSizes[size] }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{walletIcons[variant]}</span>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {walletNames[variant]}
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                {formatAddress(address)}
              </span>
            </Box>
          </Box>
        </Box>
      )
    }
    
    if (connecting) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress 
            size={buttonTokens.iconSizes[size]} 
            sx={{ color: 'inherit' }} 
          />
          <span>Connecting...</span>
        </Box>
      )
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <span style={{ fontSize: buttonTokens.iconSizes[size] }}>
          {walletIcons[variant]}
        </span>
        <span>Connect {walletNames[variant]}</span>
      </Box>
    )
  }

  return (
    <StyledWalletButton
      variant={variant}
      size={size}
      connecting={connecting}
      connected={connected}
      disabled={disabled || connecting}
      fullWidth={fullWidth}
      onClick={onClick}
      {...props}
    >
      {getButtonContent()}
    </StyledWalletButton>
  )
}
