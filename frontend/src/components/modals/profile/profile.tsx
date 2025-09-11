import { PopupModal } from '../../../theme/components/modals'
import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Alert, Avatar, Tabs, Tab, Fade,
  Divider
} from '@mui/material'
import { Person, EmojiEvents, TravelExplore, Info } from '@mui/icons-material'
import { useProfile } from '../../../hooks/useProfile'
import { ModernLoader } from '../../common/loaders/ModernLoader'
import { countries } from '../../../utils/data/countries'
import { ProfileInfo } from './ProfileInfo'

interface ProfileProps {
  open: boolean
  onClose: () => void
  onProfileUpdated?: () => void
}

export interface UserProfileData {
  username?: string
  displayName?: string      // Blockchain'den gelen gerçek isim
  avatarCID?: string       // IPFS CID for avatar
  avatarImageUrl?: string  // IPFS'ten resolve edilen image URL
  bio?: string            // Profile bio
  nationality?: string    // Milliyeti
  walletAddress: string
  walletBalance: string
  gamesPlayed?: number
  totalWinnings?: string
  rank?: string
  isAuthenticated: boolean
}


export const Profile: React.FC<ProfileProps> = ({ open, onClose }) => {
  const { profile, loading, error, refetch } = useProfile()

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    avatarCID: '',
    
    nationality: '',
    location: ''
  })

  const [tabIndex, setTabIndex] = useState(0)

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        avatarCID: profile.avatarCID || '',
        nationality: profile.nationality || '',
        location: profile.location || ''
      })
    }
  }, [profile])

  const formatTimestamp = (timestamp: bigint) =>
    new Date(Number(timestamp) * 1000).toLocaleDateString()

  const nationalityData = countries.find(c => c.label === formData.nationality)

  const TabPanel = ({ children, value, index }: { children: React.ReactNode, value: number, index: number }) => (
    <Fade in={value === index}>
      <div role="tabpanel" hidden={value !== index} style={{ padding: '16px' }}>
        {value === index && children}
      </div>
    </Fade>
  )
  

  return (
    <PopupModal open={open} onClose={onClose} title="Profile" size="medium">
      {loading && !profile ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <ModernLoader />
        </Box>
      ) : (
        <Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                boxShadow: 2,
                border: '3px solid #6366F1',
                mr: 2
              }}
              src={formData.avatarCID ? `https://ipfs.io/ipfs/${formData.avatarCID}` : undefined}
            >
              <Person sx={{ fontSize: 40 }} />
            </Avatar>

            <Box>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                {formData.displayName || 'Kullanıcı Adı'}
              </Typography>

              {nationalityData && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <img src={nationalityData.flag} alt={nationalityData.label} width="24" style={{ marginRight: 8 }} />
                  <Typography sx={{ color: 'white' }}>{nationalityData.label}</Typography>
                </Box>
              )}

              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
                Created: {profile?.createdAt ? formatTimestamp(profile.createdAt) : '-'}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3, background: 'rgba(255,255,255,0.12)' }} />

          {/* Tabs */}
          <Tabs
            value={tabIndex}
            onChange={(_, newIndex) => setTabIndex(newIndex)}
            variant="fullWidth"
            centered
            textColor="secondary"
            indicatorColor="secondary"
            sx={{
              mb: 2,
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.6)' },
              '& .Mui-selected': { color: '#6366F1' },
            }}
          >
            <Tab icon={<EmojiEvents />} label="Başarılar" />
            <Tab icon={<TravelExplore />} label="Geziler" />
            <Tab icon={<Info />} label="Bilgiler" />
          </Tabs>
           
          {/* Tab Panels */}
          <TabPanel value={tabIndex} index={0}>
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>Başarılarım</Typography>
            
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>Gezilerim</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Burada gezileriniz listelenecek.</Typography>
          </TabPanel>
          <TabPanel value={tabIndex} index={2}>
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>Bilgiler</Typography>
            {profile && (
              <ProfileInfo
                open={tabIndex === 0}
                onClose={() => setTabIndex(0)}
                onProfileUpdated={refetch}
              />
            )}
          </TabPanel>
        </Box>
      )}
    </PopupModal>
  )
}
