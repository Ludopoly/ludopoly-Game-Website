import { PopupModal } from '../../../theme/components/modals'
import React, { useState, useEffect } from 'react'
import {
  Box, Typography, TextField, Autocomplete, Alert, Divider,
  Switch, FormControlLabel, Avatar, Grid, IconButton,
  Snackbar
} from '@mui/material'
import { ActionButton } from '../../../theme/components/ActionButton'
import {
  Person, Delete, Edit
} from '@mui/icons-material'
import { useProfile } from '../../../hooks/useProfile'
import type { UpdateProfileParams } from '../../../types/contracts'
import { ModernLoader } from '../../common/loaders/ModernLoader'
import { countries } from '../../../utils/data/countries'

interface ProfileManagerProps {
  open: boolean
  onClose: () => void
  onProfileUpdated?: () => void
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  open,
  onClose,
  onProfileUpdated
}) => {
  const {
    profile,
    loading,
    error,
    updateProfile,
    deleteProfile,
    toggleProfileStatus
  } = useProfile()

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    avatarCID: '',
    nationality: '',
    location: ''
  })

  const [editMode, setEditMode] = useState({
    displayName: false,
    nationality: false,
    bio: false
  })

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

  const handleSubmit = async () => {
    try {
      const params: UpdateProfileParams = {
        displayName: formData.displayName,
        bio: formData.bio,
        avatarCID: formData.avatarCID,
        nationality: formData.nationality,
        isActive: profile?.isActive || true
      }

      await updateProfile(params)
      onProfileUpdated?.()
      onClose()
    } catch (err) {
      console.error('Update failed', err)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your profile?')) {
      try {
        await deleteProfile()
        onClose()
      } catch (err) {
        console.error('Delete failed', err)
      }
    }
  }

  const formatTimestamp = (timestamp: bigint) =>
    new Date(Number(timestamp) * 1000).toLocaleDateString()

  const nationalityData = countries.find(c => c.label === formData.nationality)

  return (
    <PopupModal open={open} onClose={onClose} title="Profile Manager" size="medium">
      {loading && !profile ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <ModernLoader />
        </Box>
      ) : (
        <Box>
          {error && (
            <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError(null)}>
              <Alert severity="error">{error}</Alert>
            </Snackbar>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 ,}}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                boxShadow: '0 2px 12px rgba(99,102,241,0.15)',
                border: '3px solid #6366F1',
                mr: 2
              }}
              src={formData.avatarCID ? `https://ipfs.io/ipfs/${formData.avatarCID}` : undefined}
            >
              <Person sx={{ fontSize: 40 }} />
            </Avatar>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                {formData.displayName || 'Profile Manager'}
              </Typography>

              {nationalityData && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <img
                    src={nationalityData.flag}
                    alt={nationalityData.label}
                    width="24"
                    style={{ marginRight: 8, borderRadius: '2px' }}
                  />
                  <Typography sx={{ color: 'white' }}>{nationalityData.label}</Typography>
                </Box>
              )}

              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
                Created: {profile?.createdAt ? formatTimestamp(profile.createdAt) : '-'}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3, background: 'rgba(255,255,255,0.12)' }} />

          <Grid container spacing={3} flexDirection="column" sx={{ width: '100%' }}>
            <Grid item sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={formData.displayName}
                  onChange={(e) => setFormData(p => ({ ...p, displayName: e.target.value }))}
                  disabled={!editMode.displayName}
                  sx={{ mb: 1, minWidth: 0, width: '100%', maxWidth: '100%' }}
                />
                <IconButton onClick={() =>
                  setEditMode(prev => ({ ...prev, displayName: !prev.displayName }))
                }>
                  <Edit fontSize="small" />
                </IconButton>
              </Box>
            </Grid>

            <Grid item sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" sx={{ width: '100%' }}>
                <Autocomplete
                  options={countries}
                  getOptionLabel={(option) => option.label}
                  value={countries.find(c => c.label === formData.nationality) || null}
                  onChange={(_, value) =>
                    setFormData(p => ({ ...p, nationality: value?.label || '' }))
                  }
                  disabled={!editMode.nationality}
                  PaperComponent={(props) => (
                    <div
                      {...props}
                      style={{
                        background: 'rgba(30,41,59,0.98)',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                        borderRadius: 8,
                        ...props.style
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} style={{ display: 'flex', alignItems: 'center' }}>
                      <img src={option.flag} alt="" width="24" style={{ marginRight: 8 }} />
                      {option.label}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label="Nationality" fullWidth sx={{ mb: 1 }} />
                  )}
                  sx={{ width: '100%' }}
                />
                <IconButton onClick={() =>
                  setEditMode(prev => ({ ...prev, nationality: !prev.nationality }))
                }>
                  <Edit fontSize="small" />
                </IconButton>
              </Box>
            </Grid>

            <Grid item sx={{ width: '100%' }}>
              <Box display="flex" alignItems="start" sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                  disabled={!editMode.bio}
                />
                <IconButton onClick={() =>
                  setEditMode(prev => ({ ...prev, bio: !prev.bio }))
                }>
                  <Edit fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, background: 'rgba(255,255,255,0.12)' }} />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              mt: 2,
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ActionButton
                variant="danger"
                icon={<Delete />}
                onClick={handleDelete}
                disabled={loading}
              >
                Delete Profile
              </ActionButton>

              <FormControlLabel
                control={
                  <Switch
                    checked={profile?.isActive ?? false}
                    onChange={toggleProfileStatus}
                    disabled={loading}
                    sx={{ color: '#6366F1' }}
                  />
                }
                label={
                  <Typography sx={{ color: 'white', fontWeight: 500 }}>
                    Active Status
                  </Typography>
                }
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <ActionButton
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </ActionButton>

              <ActionButton
                variant="primary"
                onClick={handleSubmit}
                disabled={loading || !formData.displayName.trim()}
                loading={loading}
              >
                Update Profile
              </ActionButton>
            </Box>
          </Box>
        </Box>
      )}
    </PopupModal>
  )
}
