import React, { useState } from 'react'
import { useAppSelector, useAppDispatch } from '../../store'
import { selectAuthState, selectUserAccount, clearAuthState } from '../../store/slices/authSlice'
import { selectWalletBalance, selectWalletAddress } from '../../store/slices/walletSlice'
import { disconnectWallet } from '../../store/slices/walletSlice'
import { UserProfileCard } from './UserProfileCard'
import { Profile } from '../modals/profile/profile'


import { useProfile } from '../../hooks/useProfile' // Yeni hook'umuzu import ediyoruz
import { Deneme } from '../modals/profile/Deneme'
import { ProfileManager } from '../modals/profile/ProfileManager'

interface UserProfileContainerProps {
  variant?: 'compact' | 'expanded'
  showMenu?: boolean
}

export const UserProfileContainer: React.FC<UserProfileContainerProps> = ({
  variant = 'compact',
  showMenu = true,
}) => {
  const [showProfileManager, setShowProfileManager] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const dispatch = useAppDispatch()
  const authState = useAppSelector(selectAuthState)
  const userProfile = useAppSelector(selectUserAccount)
  const walletBalance = useAppSelector(selectWalletBalance)
  const walletAddress = useAppSelector(selectWalletAddress)
  
  const { 
    profile, 
    loading: profileLoading, 
    refetch: refetchProfile,
    toggleProfileStatus
  } = useProfile()

  // Blockchain data state (örnek veriler)
  const [blockchainData] = useState({
    isLoading: false,
    gamesPlayed: Math.floor(Math.random() * 50),
    totalWinnings: (Math.random() * 10).toFixed(2),
    rank: ['Beginner', 'Intermediate', 'Advanced', 'Expert'][Math.floor(Math.random() * 4)],
  })

  // Prepare data for presentation component
  const userData = {
    username: userProfile?.username,
    displayName: profile?.displayName,
    avatarCID: profile?.avatarCID,
    bio: profile?.bio,
    nationality: profile?.nationality,
    walletAddress: walletAddress || '',
    walletBalance: walletBalance || '0.00',
    gamesPlayed: blockchainData.gamesPlayed,
    totalWinnings: blockchainData.totalWinnings,
    rank: blockchainData.rank,
    isAuthenticated: authState.isAuthenticated,
  }

  // Prepare actions
  const actions = {
    onLogout: () => {
      dispatch(clearAuthState())
      dispatch(disconnectWallet())
    },
    onProfileSettings: () => setShowProfileManager(true),
    onGameSettings: () => setShowSettingsModal(true),
  }

  if (!profile && !profileLoading) {
    return null
  }

  return (
    <>
      <UserProfileCard
        userData={userData}
        actions={{
          ...actions,
          onProfileUpdated: refetchProfile
        }}
        variant={variant}
        showMenu={showMenu}
        isLoading={profileLoading || blockchainData.isLoading}

      />
      {showProfileManager && (
        <Profile
          open={showProfileManager} 
          onClose={() => setShowProfileManager(false)}
        />
      )}
      {showSettingsModal && (
        <Deneme open onClose={() => setShowSettingsModal(false)} />
      )}
    </>
  )
}