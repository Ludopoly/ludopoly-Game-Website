import { createTheme } from '@mui/material/styles'
import { buttonTokens } from './buttons/tokens'
import { colors,borderRadius } from '../styles/theme'

// Custom Ludopoly Theme with Modular Button System
export const ludopolyTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366F1',
      light: '#8B5CF6',
      dark: '#4F46E5',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706',
      contrastText: '#000000',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#1E1A31',
      paper: 'rgba(255, 255, 255, 0.1)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E5E7EB',
      disabled: '#9CA3AF',
    },
    divider: 'rgba(255, 255, 255, 0.2)',
  },
  typography: {
    fontFamily: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'].join(','),
    h1: {
      fontWeight: 800,
      fontSize: '3rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.25s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #047857 0%, #065F46 100%)',
          },
        },
      },
      variants: [
        // Navigation Button Variants
        {
          props: { variant: 'navigation' },
          style: buttonTokens.variants.navigation.default,
        },
        {
          props: { variant: 'navigationActive' },
          style: {
            ...buttonTokens.variants.navigation.default,
            ...buttonTokens.variants.navigation.active,
          },
        },
        // Wallet Button Variants
        {
          props: { variant: 'walletMetamask' },
          style: buttonTokens.variants.wallet.metamask,
        },
        {
          props: { variant: 'walletConnect' },
          style: buttonTokens.variants.wallet.walletconnect,
        },
        // Action Button Variants
        {
          props: { variant: 'actionPrimary' },
          style: buttonTokens.variants.action.primary,
        },
        {
          props: { variant: 'actionSecondary' },
          style: buttonTokens.variants.action.secondary,
        },
        {
          props: { variant: 'actionDanger' },
          style: buttonTokens.variants.action.danger,
        },
        // Ghost Button Variant
        {
          props: { variant: 'ghost' },
          style: buttonTokens.variants.ghost.default,
        },
      ],
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 12,
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6366F1',
              boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#E5E7EB',
            fontWeight: 500,
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#6366F1',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 20,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.gradient-text': {
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        bar: {
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#6366F1',
        },
      },
    },
  },
})

// Extend theme with custom button tokens
declare module '@mui/material/styles' {
  interface Theme {
    buttonTokens: typeof buttonTokens
  }
  interface ThemeOptions {
    buttonTokens?: typeof buttonTokens
  }
}

// Extend Button variants for custom types
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    navigation: true
    navigationActive: true
    walletMetamask: true
    walletConnect: true
    actionPrimary: true
    actionSecondary: true
    actionDanger: true
    ghost: true
  }
}

// MUI Tema
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary.main,
    },
    background: {
      default: colors.background.main,
      paper: colors.background.card,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: borderRadius.medium,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgb(32, 33, 44, 0.6)', // daha şeffaf
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px'
        },
        root: {
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 24px'
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '24px !important'
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 24px'
        }
      }
    }
  }
});
// Add button tokens to theme
ludopolyTheme.buttonTokens = buttonTokens

// Theme hook for easy access
export const useGameTheme = () => ludopolyTheme

// Export button tokens for direct access
export { buttonTokens } from './buttons/tokens'
