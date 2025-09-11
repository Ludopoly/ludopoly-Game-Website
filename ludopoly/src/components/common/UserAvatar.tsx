import React, { useState } from 'react'
import { Avatar } from '@mui/material'

interface UserAvatarProps {
  avatarUrl?: string        // IPFS CID (deprecated - use avatarImageUrl)
  avatarImageUrl?: string   // Direct image URL from IPFS
  username?: string
  displayName?: string
  walletAddress?: string
  size?: number
  showBorder?: boolean
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  avatarImageUrl,
  username,
  displayName,
  walletAddress,
  size = 40,
  showBorder = false,
}) => {
  const [imageError, setImageError] = useState(false)

  const getInitials = (): string => {
    const name = displayName || username
    if (name) {
      const words = name.trim().split(' ')
      if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase()
      }
      return name.charAt(0).toUpperCase()
    }
    if (walletAddress) {
      return walletAddress.charAt(2).toUpperCase()
    }
    return 'U'
  }

  const getAvatarUrl = (cid?: string): string => {
    if (!cid) return ''
    // IPFS URL'ini oluştur
    return `https://ipfs.io/ipfs/${cid}`
  }

  // Avatar URL priority: avatarImageUrl > avatarUrl (CID)
  const finalAvatarUrl = avatarImageUrl || (avatarUrl ? getAvatarUrl(avatarUrl) : '')

  const avatarSx = {
    width: size,
    height: size,
    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    color: 'white',
    fontWeight: 600,
    fontSize: size < 40 ? '0.8rem' : '1rem',
    ...(showBorder && {
      border: '2px solid rgba(255, 255, 255, 0.2)',
    }),
    transition: 'all 0.3s ease',
  }

  // Eğer avatar URL varsa ve hata yoksa resmi göster
  if (finalAvatarUrl && !imageError) {
    return (
      <Avatar
        src={finalAvatarUrl}
        sx={avatarSx}
        onError={() => setImageError(true)}
        alt={displayName || username || 'User Avatar'}
      >
        {getInitials()}
      </Avatar>
    )
  }

  // Fallback olarak initials göster
  return (
    <Avatar sx={avatarSx}>
      {getInitials()}
    </Avatar>
  )
}
