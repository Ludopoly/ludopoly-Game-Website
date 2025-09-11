import React from 'react'
import { Box, Typography, keyframes } from '@mui/material'

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

interface ModernLoaderProps {
  message?: string
  size?: number
  strokeWidth?: number
  color?: string
}

export const ModernLoader: React.FC<ModernLoaderProps> = ({
  message = 'Loading...',
  size = 80,
  strokeWidth = 6,
  color = '#FFFFFF'
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        padding: 4,
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          animation: `${rotate} 1.2s linear infinite`,
        }}
      >
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - strokeWidth) / 2}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - strokeWidth) / 2}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={Math.PI * (size - strokeWidth)}
            strokeDashoffset={Math.PI * (size - strokeWidth) * 0.75}
            fill="none"
          />
        </svg>
      </Box>

      <Typography
        sx={{
          color: '#fff',
          opacity: 0.9,
          fontWeight: 500,
          fontSize: '1rem',
          textAlign: 'center',
        }}
      >
        {message}
      </Typography>
    </Box>
  )
}
