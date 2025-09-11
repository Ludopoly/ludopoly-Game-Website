import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Alert,
  AlertTitle,
  Fade,
  Fab,
  Snackbar,
} from '@mui/material'
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  GamepadRounded as GameIcon,
} from '@mui/icons-material'
import { RoomProvider, RoomList, CreateRoom, useRoomContext } from '../../features/rooms'

const RoomsPageContent: React.FC = () => {
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })
  
  const { 
    rooms, 
    isLoading, 
    error, 
    loadRooms, 
    createRoom, 
    joinRoom 
  } = useRoomContext()

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  const handleCreateRoom = async (roomData: any) => {
    try {
      await createRoom(roomData)
      setShowCreateRoom(false)
      setSnackbar({
        open: true,
        message: 'Oda başarıyla oluşturuldu!',
        severity: 'success'
      })
    } catch (error) {
      console.error('Oda oluşturma hatası:', error)
      setSnackbar({
        open: true,
        message: 'Oda oluşturulurken hata oluştu',
        severity: 'error'
      })
    }
  }

  const handleJoinRoom = async (roomId: string, password?: string) => {
    try {
      await joinRoom(roomId, password)
      setSnackbar({
        open: true,
        message: 'Odaya başarıyla katıldınız!',
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Odaya katılırken hata oluştu',
        severity: 'error'
      })
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* App Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Toolbar>
          <GameIcon sx={{ mr: 2, color: 'white' }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: 'white',
            }}
          >
            Ludopoly Odaları
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadRooms}
            disabled={isLoading}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Yenile
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
        <Fade in timeout={800}>
          <Box>
            {/* Welcome Section */}
            <Box
              textAlign="center"
              mb={4}
              sx={{
                padding: 4,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  mb: 1,
                }}
              >
                🎮 Oyun Odaları
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 400,
                }}
              >
                Arkadaşlarınla birlikte oyna veya yeni insanlarla tanış
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                action={
                  <Button color="inherit" size="small" onClick={loadRooms}>
                    <RefreshIcon sx={{ mr: 1 }} />
                    Tekrar Dene
                  </Button>
                }
              >
                <AlertTitle>Hata</AlertTitle>
                {error}
              </Alert>
            )}

            {/* Room List */}
            <RoomList 
              rooms={rooms}
              onJoinRoom={handleJoinRoom}
              isLoading={isLoading}
            />
          </Box>
        </Fade>

        {/* Floating Action Button */}
        <Fab
          color="secondary"
          aria-label="create room"
          onClick={() => setShowCreateRoom(true)}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <AddIcon />
        </Fab>

        {/* Create Room Modal */}
        {showCreateRoom && (
          <CreateRoom
            onCreateRoom={handleCreateRoom}
            onCancel={() => setShowCreateRoom(false)}
            isLoading={isLoading}
          />
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

const RoomsPage: React.FC = () => {
  return (
    <RoomProvider>
      <RoomsPageContent />
    </RoomProvider>
  )
}

export default RoomsPage
