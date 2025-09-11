import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Divider,
  Stack,
  Container,
  IconButton,
  Grid,
} from '@mui/material'
import {
  Lock as LockIcon,
  Public as PublicIcon,
  PlayArrow as PlayIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { ActionButton } from '../../../theme/components/ActionButton'
import { ModernLoader } from '../../../components/common/loaders/ModernLoader'
import type { Room } from '../types'

interface RoomListProps {
  rooms: Room[]
  onJoinRoom: (roomId: string, password?: string) => void
  onCreateRoom?: () => void
  onRefresh?: () => void
  onBack?: () => void
  isLoading?: boolean
  isRefreshing?: boolean
}

const RoomList: React.FC<RoomListProps> = ({ 
  rooms, 
  onJoinRoom, 
  onCreateRoom,
  onRefresh,
  onBack,
  isLoading = false,
  isRefreshing = false
}) => {
  const [passwordDialog, setPasswordDialog] = useState<{ open: boolean; roomId: string }>({
    open: false,
    roomId: ''
  })
  const [password, setPassword] = useState('')

  const handleJoinRoom = (room: Room) => {
    if (room.isPrivate) {
      setPasswordDialog({ open: true, roomId: room.id })
    } else {
      onJoinRoom(room.id)
    }
  }

  const handlePasswordSubmit = () => {
    if (password.trim()) {
      onJoinRoom(passwordDialog.roomId, password)
      setPasswordDialog({ open: false, roomId: '' })
      setPassword('')
    }
  }

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'waiting':
        return 'success'
      case 'playing':
        return 'warning'
      case 'finished':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: Room['status']) => {
    switch (status) {
      case 'waiting':
        return 'Waiting for Players'
      case 'playing':
        return 'Game in Progress'
      case 'finished':
        return 'Finished'
      default:
        return 'Unknown'
    }
  }

  const getGameModeText = (mode: string) => {
    switch (mode) {
      case 'quick':
        return 'Quick Hunt'
      case 'standard':
        return 'Standard'
      case 'hardcore':
        return 'Hardcore'
      default:
        return mode
    }
  }

  const getGameModeColor = (mode: string) => {
    switch (mode) {
      case 'quick':
        return 'info'
      case 'standard':
        return 'primary'
      case 'hardcore':
        return 'error'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 3
        }}>
          <ModernLoader size={60} color="#6366F1" />
          <Typography variant="h6" color="text.secondary">
            Loading Game Rooms...
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        p: 3,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🏠 Game Rooms
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join a room or create your own treasure hunt adventure
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          {onRefresh && (
            <Tooltip title="Refresh Rooms">
              <IconButton
                onClick={onRefresh}
                disabled={isRefreshing}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <RefreshIcon sx={{ 
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
              </IconButton>
            </Tooltip>
          )}
          
          {onCreateRoom && (
            <ActionButton
              variant="primary"
              startIcon={<AddIcon />}
              onClick={onCreateRoom}
              sx={{
                minWidth: '160px',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)'
              }}
            >
              Create Room
            </ActionButton>
          )}
          
          {onBack && (
            <Button
              variant="outlined"
              onClick={onBack}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  background: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Back to Menu
            </Button>
          )}
        </Stack>
      </Box>

      {/* Empty State */}
      {rooms.length === 0 ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '40vh',
          gap: 3,
          textAlign: 'center'
        }}>
          <GroupIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
          <Typography variant="h5" color="text.secondary">
            No rooms available
          </Typography>
          <Typography variant="body1" color="text.disabled">
            Be the first to create a treasure hunt room!
          </Typography>
          {onCreateRoom && (
            <ActionButton
              variant="primary"
              size="large"
              startIcon={<AddIcon />}
              onClick={onCreateRoom}
              sx={{ mt: 2 }}
            >
              Create First Room
            </ActionButton>
          )}
        </Box>
      ) : (
        /* Rooms Grid */
        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid item xs={12} md={6} lg={4} key={room.id}>
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }
              }}>
                <CardContent sx={{ p: 3, flex: 1 }}>
                  {/* Room Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1, mr: 2 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        {room.isPrivate ? <LockIcon fontSize="small" /> : <PublicIcon fontSize="small" />}
                        {room.name}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip
                          label={getStatusText(room.status)}
                          color={getStatusColor(room.status)}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                        <Chip
                          label={getGameModeText(room.gameMode)}
                          color={getGameModeColor(room.gameMode) as any}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                  </Box>

                  {/* Creator Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar 
                      src={room.creator.avatar} 
                      sx={{ width: 32, height: 32 }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="500">
                        {room.creator.displayName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {room.creator.address.slice(0, 6)}...{room.creator.address.slice(-4)}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                  {/* Room Stats */}
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon fontSize="small" color="primary" />
                        <Typography variant="body2">Players</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {room.currentPlayers.length}/{room.maxPlayers}
                      </Typography>
                    </Box>

                    {room.entryFee && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Entry Fee</Typography>
                        <Typography variant="body2" fontWeight="bold" color="warning.main">
                          {room.entryFee} ETH
                        </Typography>
                      </Box>
                    )}

                    {room.prizePool && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Prize Pool</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {room.prizePool} ETH
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon fontSize="small" color="secondary" />
                        <Typography variant="body2">Created</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {room.createdAt.toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>

                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                    {room.status === 'waiting' && room.currentPlayers.length < room.maxPlayers ? (
                      <ActionButton
                        variant="primary"
                        fullWidth
                        startIcon={<PlayIcon />}
                        onClick={() => handleJoinRoom(room)}
                        sx={{ flex: 1 }}
                      >
                        Join Game
                      </ActionButton>
                    ) : room.status === 'playing' ? (
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<VisibilityIcon />}
                        disabled
                        sx={{ 
                          flex: 1,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: 'text.secondary'
                        }}
                      >
                        Spectate
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        fullWidth
                        disabled
                        sx={{ 
                          flex: 1,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: 'text.secondary'
                        }}
                      >
                        Room Full
                      </Button>
                    )}
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Password Dialog */}
      <Dialog
        open={passwordDialog.open}
        onClose={() => setPasswordDialog({ open: false, roomId: '' })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(30, 26, 49, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          🔒 Private Room Password
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Room Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)'
                }
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)'
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setPasswordDialog({ open: false, roomId: '' })}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <ActionButton
            variant="primary"
            onClick={handlePasswordSubmit}
            disabled={!password.trim()}
          >
            Join Room
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default RoomList
