import React from 'react'
import { Box, Typography } from '@mui/material'

// Single Responsibility: Sadece footer gösterimi
export const WalletFooter: React.FC = () => (
  <Box textAlign="center" mt={4}>
    <Typography
      variant="caption"
      sx={{
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '0.8rem',
        lineHeight: 1.4,
      }}
    >
      By connecting your wallet, you agree to our{' '}
      <Box component="span" sx={{ color: 'primary.contrastText', cursor: 'pointer' }}>
        Terms of Service
      </Box>{' '}
      and{' '}
      <Box component="span" sx={{ color: 'primary.contrastText', cursor: 'pointer' }}>
        Privacy Policy
      </Box>
    </Typography>
  </Box>
)
