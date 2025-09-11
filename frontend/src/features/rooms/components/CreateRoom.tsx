import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  IconButton,
  Fade,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Close as CloseIcon,
  Home as HomeIcon,
  Group as GroupIcon,
  SportsEsports as GameIcon,
  Lock as LockIcon,
  Create as CreateIcon,
} from '@mui/icons-material'
import type { CreateRoomForm } from '../types'

interface CreateRoomProps {
  onCreateRoom: (roomData: CreateRoomForm) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const CreateRoom: React.FC<CreateRoomProps> = ({ onCreateRoom, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState<CreateRoomForm>({
    name: '',
    maxPlayers: 4,
    gameMode: 'classic',
    isPrivate: false,
    password: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Oda adı gerekli'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Oda adı en az 3 karakter olmalı'
    }

    if (formData.maxPlayers < 2 || formData.maxPlayers > 8) {
      newErrors.maxPlayers = 'Oyuncu sayısı 2-8 arasında olmalı'
    }

    if (formData.isPrivate && (!formData.password || formData.password.length < 4)) {
      newErrors.password = 'Şifre en az 4 karakter olmalı'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onCreateRoom(formData)
    } catch (error) {
      console.error('Oda oluşturma hatası:', error)
    }
  }

  const handleInputChange = (field: keyof CreateRoomForm, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog
      open={true}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
        },
      }}
    >
      <Fade in timeout={500}>
        <Box>
          {/* Dialog Header */}
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pb: 2,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HomeIcon />
              <Typography variant="h6" fontWeight={700}>
                Yeni Oda Oluştur
              </Typography>
            </Box>
            <IconButton
              onClick={onCancel}
              sx={{ color: 'white' }}
              disabled={isLoading}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          {/* Form Content */}
          <DialogContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              {/* Room Name */}
              <TextField
                fullWidth
                label="Oda Adı"
                placeholder="Harika bir oda adı girin..."
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                disabled={isLoading}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'error.main',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      🏠
                    </Box>
                  ),
                }}
              />

              {/* Max Players */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  <GroupIcon sx={{ mr: 1, fontSize: '1rem' }} />
                  Maksimum Oyuncu
                </InputLabel>
                <Select
                  value={formData.maxPlayers}
                  onChange={(e) => handleInputChange('maxPlayers', Number(e.target.value))}
                  disabled={isLoading}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      },
                    },
                  }}
                >
                  {[2, 3, 4, 6, 8].map((num) => (
                    <MenuItem key={num} value={num} sx={{ color: 'white' }}>
                      👥 {num} Oyuncu
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Game Mode */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  <GameIcon sx={{ mr: 1, fontSize: '1rem' }} />
                  Oyun Modu
                </InputLabel>
                <Select
                  value={formData.gameMode}
                  onChange={(e) => handleInputChange('gameMode', e.target.value as CreateRoomForm['gameMode'])}
                  disabled={isLoading}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      },
                    },
                  }}
                >
                  <MenuItem value="classic" sx={{ color: 'white' }}>
                    🎯 Klasik (60 dk)
                  </MenuItem>
                  <MenuItem value="quick" sx={{ color: 'white' }}>
                    ⚡ Hızlı (30 dk)
                  </MenuItem>
                  <MenuItem value="tournament" sx={{ color: 'white' }}>
                    🏆 Turnuva (90 dk)
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Private Room Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isPrivate}
                    onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                    disabled={isLoading}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-checked': {
                        color: 'secondary.main',
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockIcon fontSize="small" />
                    <Typography sx={{ color: 'white' }}>
                      Özel Oda (Şifre ile)
                    </Typography>
                  </Box>
                }
                sx={{ mb: formData.isPrivate ? 2 : 3 }}
              />

              {/* Password Field (if private) */}
              {formData.isPrivate && (
                <Fade in timeout={300}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Oda Şifresi"
                    placeholder="Güvenli bir şifre girin..."
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                    disabled={isLoading}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                      '& .MuiFormHelperText-root': {
                        color: 'error.main',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                          🔐
                        </Box>
                      ),
                    }}
                  />
                </Fade>
              )}

              {/* Error Alert */}
              {Object.keys(errors).length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Lütfen form hatalarını düzeltin
                </Alert>
              )}
            </Box>
          </DialogContent>

          {/* Dialog Actions */}
          <DialogActions
            sx={{
              p: 3,
              pt: 1,
              gap: 2,
              background: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <Button
              onClick={onCancel}
              disabled={isLoading}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              ❌ İptal
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <CreateIcon />
                )
              }
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                color: 'white',
                fontWeight: 600,
                minWidth: 140,
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                },
              }}
            >
              {isLoading ? 'Oluşturuluyor...' : '🚀 Odayı Oluştur'}
            </Button>
          </DialogActions>
        </Box>
      </Fade>
    </Dialog>
  )
}

export default CreateRoom
