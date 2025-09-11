import React from 'react'
import { Typography, Box } from '@mui/material'

// Single Responsibility: Sadece başlık gösterimi
interface WalletHeaderProps {
  title: string
  subtitle: string
}

export const WalletHeader: React.FC<WalletHeaderProps> = ({ title, subtitle }) => (
  <Box mb={4}>
    <Typography
      variant="h3"
      sx={{
        color: 'white',
        fontWeight: 700,
        mb: 2,
        fontSize: { xs: '1.8rem', sm: '2.2rem' },
      }}
    >
      {title}
    </Typography>
    
    <Typography
      variant="body1"
      sx={{
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '1rem',
      }}
    >
      {subtitle}
    </Typography>
  </Box>
)
