import React from 'react'
import { Button, Badge } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { NavigationButtonProps } from '../buttons/types'
import { buttonTokens } from '../buttons/tokens'

const StyledNavigationButton = styled(Button, {
  shouldForwardProp: (prop) => !['active', 'badge', 'badgeCount'].includes(prop as string)
})<NavigationButtonProps>(({ theme, active, size = 'medium' }) => ({
  ...buttonTokens.variants.navigation.default,
  ...buttonTokens.sizes[size as keyof typeof buttonTokens.sizes],
  ...(active && buttonTokens.variants.navigation.active),
  
  // Additional modern styling
  textTransform: 'none',
  fontWeight: 500,
  minWidth: 'auto',
  
  // Icon spacing
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1.5),
    fontSize: buttonTokens.iconSizes[size as keyof typeof buttonTokens.iconSizes],
  },
  
  // Responsive padding
  [theme.breakpoints.down('sm')]: {
    padding: buttonTokens.sizes.small.padding,
    fontSize: buttonTokens.sizes.small.fontSize,
    '& .MuiButton-startIcon': {
      marginRight: theme.spacing(1),
      fontSize: buttonTokens.iconSizes.small,
    },
  },
}))

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  children,
  icon,
  active = false,
  badge = false,
  badgeCount = 0,
  size = 'medium',
  disabled = false,
  onClick,
  ...props
}) => {
  const buttonContent = (
    <StyledNavigationButton
      active={active}
      size={size}
      disabled={disabled}
      onClick={onClick}
      startIcon={icon}
      {...(() => {
        const { variant, ...rest } = props;
        return rest;
      })()}
    >
      {children}
    </StyledNavigationButton>
  )

  // Wrap with badge if needed
  if (badge && badgeCount > 0) {
    return (
      <Badge 
        badgeContent={badgeCount} 
        color="primary"
        sx={{
          '& .MuiBadge-badge': {
            right: 8,
            top: 8,
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            minWidth: '20px',
            height: '20px',
          }
        }}
      >
        {buttonContent}
      </Badge>
    )
  }

  return buttonContent
}
