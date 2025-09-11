
import React, { useState, useEffect } from 'react'
import {
    Box, TextField, Autocomplete, IconButton
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { ActionButton } from '../../../theme/components/ActionButton'
import {Edit} from '@mui/icons-material'
import { useProfile } from '../../../hooks/useProfile'
import { useSnackbar } from '../../../context/SnackbarProvider'
import type { UpdateProfileParams } from '../../../types/contracts'
import { countries } from '../../../utils/data/countries'

interface ProfileInfoProps {
    open: boolean
    onClose: () => void
    onProfileUpdated?: () => void
    
}

export const ProfileInfo: React.FC<ProfileInfoProps > = ({
    open,
    onClose,
    onProfileUpdated,
}) => {

    const {
        profile,
        loading,
        updateProfile,
        deleteProfile,
    } = useProfile()

    const { showSuccess, showError } = useSnackbar()

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

    const handleSubmit = async () => {
        try {
            const params: UpdateProfileParams = {
                displayName: formData.displayName,
                bio: formData.bio,
                avatarCID: formData.avatarCID,
                nationality: formData.nationality,
                isActive: profile?.isActive ?? true
            }
            await updateProfile(params)
            showSuccess('Profile updated successfully!')
            onProfileUpdated?.()
            onClose()
        } catch (err) {
            showError('Profile update failed!')
            console.error('Update failed', err)
        }
    }

    const nationalityData = countries.find(c => c.label === formData.nationality)


    return (
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
        </Grid>


    )
}