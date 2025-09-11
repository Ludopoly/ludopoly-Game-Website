import type { SxProps } from '@mui/system'
import type { Theme } from '@mui/material/styles'
import { colors, gradients, shadows, borderRadius } from './theme'

// Ana sayfa stilleri
export const mainLayoutStyles = {
  // Ana container
  mainContainer: {
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden',
    background: colors.background.main,
  } as SxProps<Theme>,

  // İçerik katmanı
  contentLayer: {
    position: 'relative',
    zIndex: 1,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: colors.background.overlay,
  } as SxProps<Theme>,

  // Ana içerik alanı
  mainContentArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  } as SxProps<Theme>,

  // Hoş geldin container
  welcomeContainer: {
    textAlign: 'center',
    color: colors.text.primary,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  } as SxProps<Theme>,

  // Başlık kutusu
  headerBox: {
    mb: 2,
  } as SxProps<Theme>,

  // Ana başlık
  mainTitle: {
    fontWeight: 'bold',
    background: gradients.gold,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    mb: 1,
  } as SxProps<Theme>,

  // Alt başlık
  subtitle: {
    color: colors.text.secondary,
    fontWeight: 300,
  } as SxProps<Theme>,

  // Ana oyun butonu
  startGameButton: {
    background: gradients.gold,
    color: colors.background.main,
    fontWeight: 'bold',
    fontSize: '1.4rem',
    py: 2.5,
    px: 8,
    borderRadius: borderRadius.large,
    boxShadow: shadows.button,
    textTransform: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    minWidth: '280px',
    border: 'none',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      transition: 'left 0.6s ease',
    },
    '&:hover': {
      background: gradients.goldReverse,
      boxShadow: shadows.buttonHover,
      transform: 'translateY(-3px) scale(1.02)',
      '&::before': {
        left: '100%',
      }
    },
    transition: 'all 0.4s ease',
    '& .game-icon': {
      fontSize: '2rem',
      animation: 'pulse 2s infinite',
    },
    '@keyframes pulse': {
      '0%, 100%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.1)' },
    }
  } as SxProps<Theme>,

  // Alt butonlar container
  actionButtonsContainer: {
    display: 'flex',
    gap: 2,
    mt: 2,
  } as SxProps<Theme>,

  // Alt butonlar
  actionButton: {
    color: colors.text.primary,
    borderColor: colors.border.secondary,
    borderRadius: borderRadius.large, // Daha yuvarlak
    px: 5,
    py: 2,
    minWidth: '160px',
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'none',
    background: 'rgba(15, 15, 35, 0.3)', // Hafif arka plan
    backdropFilter: 'blur(10px)',
    border: `2px solid ${colors.border.secondary}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: colors.primary.main,
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
      color: colors.primary.main,
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(255, 215, 0, 0.2)',
    },
    '& .button-icon': {
      fontSize: '1.5rem',
      transition: 'transform 0.3s ease',
    },
    '&:hover .button-icon': {
      transform: 'scale(1.1)',
    }
  } as SxProps<Theme>,
}
