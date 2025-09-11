// Tüm stil dosyalarını tek yerden export et
export * from './theme'
export * from './navigationStyles'
export * from './mainLayoutStyles'
export * from './walletConnectionStyles'

// Component-specific style utilities
export const getContentPadding = (isConnected: boolean) => ({
  pt: isConnected ? '100px' : 0,
})

// Common animations
export const animations = {
  fadeIn: {
    animation: 'fadeIn 0.6s ease-in-out',
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
  },
  slideUp: {
    animation: 'slideUp 0.4s ease-out',
    '@keyframes slideUp': {
      from: { transform: 'translateY(100%)' },
      to: { transform: 'translateY(0)' },
    },
  },
  pulse: {
    animation: 'pulse 2s infinite',
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.7 },
    },
  },
}
