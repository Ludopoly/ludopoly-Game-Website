// Button Design Tokens - Ludopoly Game Theme
export const buttonTokens = {
  variants: {
    navigation: {
      default: {
        color: 'rgba(255, 255, 255, 0.9)',
        backgroundColor: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: '8px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          color: '#6366F1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: 'rgba(99, 102, 241, 0.4)',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)',
        },
      },
      active: {
        color: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        fontWeight: 700,
        border: '1px solid rgba(99, 102, 241, 0.5)',
        borderRadius: '8px',
      },
    },
    wallet: {
      metamask: {
        background: 'linear-gradient(135deg, #f6851b 0%, #e4761b 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(246, 133, 27, 0.3)',
        '&:hover': {
          background: 'linear-gradient(135deg, #e4761b 0%, #d4661b 100%)',
          boxShadow: '0 8px 25px rgba(246, 133, 27, 0.4)',
        },
      },
      walletconnect: {
        background: 'linear-gradient(135deg, #3b99fc 0%, #1e88e5 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(59, 153, 252, 0.3)',
        '&:hover': {
          background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
          boxShadow: '0 8px 25px rgba(59, 153, 252, 0.4)',
        },
      },
    },
    action: {
      primary: {
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        '&:hover': {
          background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)',
          boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
        },
      },
      secondary: {
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.15)',
          color: '#FFFFFF',
          borderColor: 'rgba(255, 255, 255, 0.3)',
        },
      },
      danger: {
        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        '&:hover': {
          background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
          boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)',
        },
      },
    },
    ghost: {
      default: {
        backgroundColor: 'transparent',
        color: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'none',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: 'rgba(255, 255, 255, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
      },
    },
  },
  sizes: {
    small: {
      padding: '8px 16px',
      fontSize: '0.875rem',
      minHeight: '36px',
    },
    medium: {
      padding: '12px 24px',
      fontSize: '1rem',
      minHeight: '44px',
    },
    large: {
      padding: '16px 32px',
      fontSize: '1.125rem',
      minHeight: '52px',
    },
  },
  iconSizes: {
    small: '1rem',
    medium: '1.25rem',
    large: '1.5rem',
  },
} as const

// Type definitions
export type ButtonVariantType = keyof typeof buttonTokens.variants
export type ButtonSizeType = keyof typeof buttonTokens.sizes
export type NavigationVariant = keyof typeof buttonTokens.variants.navigation
export type WalletVariant = keyof typeof buttonTokens.variants.wallet
export type ActionVariant = keyof typeof buttonTokens.variants.action
export type GhostVariant = keyof typeof buttonTokens.variants.ghost
