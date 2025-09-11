import type { SxProps } from '@mui/system'
import type { Theme } from '@mui/material/styles'
import { colors, gradients, borderRadius } from './theme'

// Navigation stilleri
export const navigationStyles = {
  // Orta navigation container
  centerNavContainer: {
    position: 'fixed',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0, // Boşluk kaldırıldı
    padding: '8px',
    background: 'rgba(15, 15, 35, 0.95)',
    backdropFilter: 'blur(20px)',
    border: `2px solid rgba(255, 215, 0, 0.2)`,
    borderRadius: '25px', // Daha yuvarlak
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  } as SxProps<Theme>,

  // Navigation butonları - Modern pill tasarım
  navButton: {
    color: colors.text.secondary,
    borderColor: 'transparent',
    borderRadius: '18px',
    px: 3,
    py: 1.5,
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    minWidth: '120px',
    justifyContent: 'center',
    background: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    
    // Inactive state
    '&:not(.active)': {
      '&:hover': {
        color: colors.text.primary,
        background: 'rgba(255, 255, 255, 0.08)',
        transform: 'translateY(-1px)',
      }
    },
    
    // Active state
    '&.active': {
      color: colors.background.main,
      background: gradients.gold,
      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      '&:hover': {
        background: gradients.goldReverse,
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(255, 215, 0, 0.5)',
      }
    },
    
    '& .nav-icon': {
      fontSize: '1.3rem',
      transition: 'transform 0.3s ease',
    },
    
    '&:hover .nav-icon': {
      transform: 'scale(1.1)',
    }
  } as SxProps<Theme>,

  // Sağ dashboard container
  dashboardContainer: {
    position: 'fixed',
    top: 20,
    right: 20,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    padding: '8px',
    background: 'rgba(15, 15, 35, 0.95)',
    backdropFilter: 'blur(20px)',
    border: `2px solid rgba(255, 215, 0, 0.2)`,
    borderRadius: '25px',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  } as SxProps<Theme>,

  // Bakiye kutusu - Modern card design
  balanceBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    px: 3,
    py: 2,
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.1))',
    border: `2px solid rgba(255, 215, 0, 0.3)`,
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(255, 165, 0, 0.15))',
      border: `2px solid rgba(255, 215, 0, 0.5)`,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
    }
  } as SxProps<Theme>,

  // Profile button - Elevated design
  profileButton: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
    border: `2px solid rgba(255, 215, 0, 0.3)`,
    borderRadius: '20px',
    p: 1,
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.1))',
      border: `2px solid rgba(255, 215, 0, 0.6)`,
      transform: 'translateY(-2px) scale(1.05)',
      boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
    }
  } as SxProps<Theme>,

  // Profile dropdown menu
  profileMenu: {
    '& .MuiPaper-root': {
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      backdropFilter: 'blur(15px)',
      border: `1px solid ${colors.border.primary}`,
      borderRadius: borderRadius.medium,
      color: colors.text.primary,
      mt: 1,
    }
  } as SxProps<Theme>,
}
