import type { SxProps } from '@mui/system'
import type { Theme } from '@mui/material/styles'
import { colors, shadows, borderRadius } from './theme'

// Cüzdan bağlantı overlay stilleri
export const walletConnectionStyles = {
  // Ana paper container
  walletPaper: {
    background: colors.background.walletOverlay,
    backdropFilter: 'blur(2px)',
    border: `1px solid ${colors.border.primary}`,
    borderRadius: 4,
    p: 5,
    textAlign: 'center',
    boxShadow: shadows.walletCard,
  } as SxProps<Theme>,

  // Başlık
  title: {
    fontWeight: 700,
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    mb: 2,
  } as SxProps<Theme>,

  // Alt başlık
  subtitle: {
    color: colors.text.secondary,
    fontWeight: 400,
    mb: 1,
  } as SxProps<Theme>,

  // Açıklama metni
  description: {
    color: colors.text.muted,
    maxWidth: 400,
    mx: 'auto',
  } as SxProps<Theme>,

  // Cüzdan seçenekleri container
  walletOptionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    mb: 4,
  } as SxProps<Theme>,

  // Footer metni
  footerText: {
    color: colors.text.disabled,
    fontSize: '0.8rem',
    lineHeight: 1.4,
  } as SxProps<Theme>,

  // Footer link
  footerLink: {
    color: 'primary.main',
    cursor: 'pointer',
  } as SxProps<Theme>,
}
