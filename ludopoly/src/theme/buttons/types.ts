import React from 'react'
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ButtonSizeType, NavigationVariant, WalletVariant, ActionVariant, GhostVariant } from './tokens'

// Base Button Interface
export interface BaseButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  size?: ButtonSizeType
  icon?: React.ReactNode
  loading?: boolean
  fullWidth?: boolean
  sx?: SxProps<Theme>
}

// Navigation Button Props
export interface NavigationButtonProps extends BaseButtonProps {
  variant?: NavigationVariant
  active?: boolean
  badge?: boolean
  badgeCount?: number
}

// Wallet Button Props  
export interface WalletButtonProps extends BaseButtonProps {
  variant: WalletVariant
  connecting?: boolean
  connected?: boolean
  address?: string
}

// Action Button Props
export interface ActionButtonProps extends BaseButtonProps {
  variant: ActionVariant
  loading?: boolean
  success?: boolean
  confirmAction?: boolean
}

// Ghost Button Props
export interface GhostButtonProps extends BaseButtonProps {
  subtle?: boolean
}

// Menu Button Props (for dropdowns)
export interface MenuButtonProps extends BaseButtonProps {
  open?: boolean
  arrow?: boolean
  menuItems?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: () => void
    disabled?: boolean
    danger?: boolean
  }>
}
