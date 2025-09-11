import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Avatar,
  IconButton,
  Typography,
  Autocomplete,
} from '@mui/material'
import { PhotoCamera, Person } from '@mui/icons-material'
import { countries } from '../../../utils/data/countries' // doğru path olduğundan emin ol

export interface ProfileCreateFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (profileData: { displayName: string; bio: string; nationality: string; avatarFile?: File }) => void
  loading?: boolean
}

export const ProfileCreateForm: React.FC<ProfileCreateFormProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    nationality: '',
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.displayName.trim()) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        ...formData,
        avatarFile: avatarFile || undefined,
      })
    } catch (error) {
      console.error('Profile creation error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      setAvatarFile(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClose = () => {
    if (!loading && !isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={loading || isSubmitting}
      PaperProps={{
        sx: {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          color: 'white',
        },
      }}
    >
      <DialogTitle sx={{ color: 'white', fontWeight: 600, fontSize: '1.5rem' }}>
        Create Your Profile
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Avatar Upload */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Profile Avatar
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={avatarPreview || undefined}
                  sx={{
                    width: 80,
                    height: 80,
                    background: avatarPreview
                      ? 'transparent'
                      : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {!avatarPreview && <Person sx={{ fontSize: 40, color: 'white' }} />}
                </Avatar>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarChange}
                  disabled={loading || isSubmitting}
                />
                <label htmlFor="avatar-upload">
                  <IconButton
                    component="span"
                    disabled={loading || isSubmitting}
                    sx={{
                      position: 'absolute',
                      bottom: -8,
                      right: -8,
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5856EB 0%, #7C3AED 100%)',
                      },
                      '&:disabled': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
                    <PhotoCamera sx={{ fontSize: 16 }} />
                  </IconButton>
                </label>
              </Box>
              {avatarFile && (
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {avatarFile.name} ({(avatarFile.size / 1024 / 1024).toFixed(1)}MB)
                </Typography>
              )}
            </Box>

            {/* Display Name */}
            <TextField
              autoFocus
              label="Display Name"
              fullWidth
              required
              value={formData.displayName}
              onChange={handleChange('displayName')}
              disabled={loading || isSubmitting}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              }}
            />

            {/* Bio */}
            <TextField
              label="Bio"
              fullWidth
              multiline
              rows={3}
              value={formData.bio}
              onChange={handleChange('bio')}
              disabled={loading || isSubmitting}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              }}
            />

            {/* Nationality - Autocomplete with flag */}
            <Autocomplete
              options={countries}
              getOptionLabel={(option) => option.label}
              value={countries.find((c) => c.label === formData.nationality) || null}
              onChange={(_, value) =>
                setFormData((prev) => ({
                  ...prev,
                  nationality: value?.label || '',
                }))
              }
              disabled={loading || isSubmitting}
              renderOption={(props, option) => (
                <li {...props} style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    loading="lazy"
                    width="24"
                    src={option.flag}
                    alt={option.label}
                    style={{ marginRight: 8, borderRadius: '2px' }}
                  />
                  {option.label}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nationality"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  }}
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleClose}
            disabled={loading || isSubmitting}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': { background: 'rgba(255, 255, 255, 0.1)' },
              '&:disabled': { color: 'rgba(255, 255, 255, 0.3)' },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!formData.displayName.trim() || loading || isSubmitting}
            sx={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              color: 'white',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #5856EB 0%, #7C3AED 100%)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            {(loading || isSubmitting) ? <CircularProgress size={20} color="inherit" /> : 'Create Profile'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
