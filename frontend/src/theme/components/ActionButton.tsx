import React from 'react'
import { Button, CircularProgress, Box } from '@mui/material'
import { styled, type Theme } from '@mui/material/styles'
import type { ButtonProps as MuiButtonProps } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import type { ActionButtonProps } from '../buttons/types'
import { buttonTokens, type ActionVariant, type ButtonSizeType } from '../buttons/tokens'

interface StyledActionButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  customVariant: ActionVariant
  customSize: ButtonSizeType
  loading?: boolean
  success?: boolean
}

const StyledActionButton = styled(Button, {
  shouldForwardProp: (prop) => !['customVariant', 'customSize', 'loading', 'success'].includes(prop as string)
})<StyledActionButtonProps>(({ theme, customVariant, customSize = 'medium', loading, success }) => {
  const variantStyles = buttonTokens.variants.action[customVariant] || {}
  const sizeStyles = buttonTokens.sizes[customSize as keyof typeof buttonTokens.sizes] || buttonTokens.sizes.medium
  const iconSize = buttonTokens.iconSizes[customSize as keyof typeof buttonTokens.iconSizes] || buttonTokens.iconSizes.medium

  return {
    ...(variantStyles as any),
    ...(sizeStyles as any),
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)',
    
    // Loading state
    ...(loading ? {
      pointerEvents: 'none' as const,
      opacity: 0.8,
    } : {}),
    
    // Success state
    ...(success ? {
      backgroundColor: '#10B981 !important',
      color: '#FFFFFF !important',
    } : {}),
    
    // Icon spacing
    '& .MuiButton-startIcon': {
      marginRight: (theme as Theme).spacing(1.5),
      fontSize: iconSize,
    },
    
    '& .MuiButton-endIcon': {
      marginLeft: (theme as Theme).spacing(1.5),
      fontSize: iconSize,
    },
    
    // Responsive
    [(theme as Theme).breakpoints.down('sm')]: {
      padding: buttonTokens.sizes.small.padding,
      fontSize: buttonTokens.sizes.small.fontSize,
    },
  }
})

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  icon,
  variant,
  size = 'medium',
  loading = false,
  success = false,
  disabled = false,
  fullWidth = false,
  onClick,
  ...props
}) => {
  const iconSize = buttonTokens.iconSizes[size as keyof typeof buttonTokens.iconSizes] || buttonTokens.iconSizes.medium

  // Determine button content based on state
  const getButtonContent = () => {
    if (success) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ fontSize: iconSize }} />
          Success!
        </Box>
      )
    }
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress 
            size={iconSize} 
            sx={{ color: 'inherit' }} 
          />
          Loading...
        </Box>
      )
    }
    
    return children
  }

  return (
    <StyledActionButton
      customVariant={variant}
      customSize={size}
      loading={loading}
      success={success}
      disabled={disabled || loading || success}
      fullWidth={fullWidth}
      onClick={onClick}
      startIcon={!loading && !success ? icon : undefined}
      variant="contained"
      {...props}
    >
      {getButtonContent()}
    </StyledActionButton>
  )
}
