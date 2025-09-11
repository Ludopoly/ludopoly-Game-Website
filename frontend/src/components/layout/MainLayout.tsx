// Event notification helper (örnek)
import {  useSnackbar } from '../../context/SnackbarProvider'
import React, { useEffect, useState } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { Scene3D } from '../3d/Scene3D'
import { WalletConnectionOverlay } from './WalletConnectionOverlay'
import { TopNavigation } from './TopNavigation'
import { AccountCreationOverlay } from './AccountCreationOverlay'
import { ProfileCreateForm } from '../modals/profile/ProfileCreateForm'
import RoomList from '../../features/rooms/components/RoomList'
import { ModernLoader } from '../common/loaders/ModernLoader'
import { ActionButton } from '../../theme/components/ActionButton'
import { useAppSelector, useAppDispatch } from '../../store'
import { selectIsConnected, selectWalletAddress } from '../../store/slices/walletSlice'
import { selectAuthState, checkUserAccount, checkAuthStatus, profileCreated } from '../../store/slices/authSlice'
import { mainLayoutStyles, getContentPadding } from '../../styles'
import { ProfileService } from '../../services/blockchain/ProfileService'
import { uploadToPinataViaBackend } from '../../services/ipfs/ipfsService'

// Single Responsibility: Ana sayfa layout'unu yönetir
export const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch()
  const isConnected = useAppSelector(selectIsConnected)
  const walletAddress = useAppSelector(selectWalletAddress)
  const authState = useAppSelector(selectAuthState)
  // Snackbar ile bildirim göstermek için
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const profileService = new ProfileService();
    profileService.registerEventListeners({
      onProfileCreated: (profileId, displayName, location) => {
        console.log('ProfileCreated event:', profileId, displayName, location);
        dispatch(profileCreated());
        showSnackbar && showSnackbar('Profile created!', 'success');
      },
      onProfileUpdated: (profileId, displayName, location) => {
        console.log('ProfileUpdated event:', profileId, displayName, location);
        showSnackbar && showSnackbar('Profile updated!', 'info');
      },
      onProfileDeleted: (profileId) => {
        console.log('ProfileDeleted event:', profileId);
        showSnackbar && showSnackbar('Profile deleted!', 'warning');
      },
      onProfileStatusChanged: (profileId, isActive) => {
        console.log('ProfileStatusChanged event:', profileId, isActive);
        showSnackbar && showSnackbar(`Profile status: ${isActive ? 'Active' : 'Inactive'}`);
      },
      onLocationUpdated: (profileId, newLocation) => {
        console.log('LocationUpdated event:', profileId, newLocation);
        showSnackbar && showSnackbar('Location updated!', 'info');
      }
    });
    return () => {
      profileService.removeEventListeners();
    };
  }, []);
  // Artık local account/profil state yok, her şey authSlice üzerinden
  const [profileLoading, setProfileLoading] = useState(false)


  // Game navigation state'leri
  const [currentView, setCurrentView] = useState<'home' | 'rooms'>('home')

  // Cüzdan bağlantısı veya sayfa yüklenince auth durumunu kontrol et


  useEffect(() => {
    if (isConnected && walletAddress) {
      dispatch(checkAuthStatus());
    }
  }, [isConnected, walletAddress]);


  // Profile handlers
  const handleCreateProfile = async (profileData: { displayName: string; bio: string; nationality: string; avatarFile?: File }) => {
    if (!walletAddress) return

    try {
      setProfileLoading(true)
      console.log('🔄 Creating profile...', profileData)
      const profileService = new ProfileService()

      // Avatar file'ını IPFS'e upload et ve CID al
      let avatarCID = ''
      if (profileData.avatarFile) {
        console.log('📷 Uploading avatar to IPFS:', profileData.avatarFile.name)
        try {
          const ipfsUrl = await uploadToPinataViaBackend(profileData.avatarFile)
          // URL'den CID'yi çıkar
          avatarCID = ipfsUrl.replace('https://ipfs.io/ipfs/', '')
          console.log('✅ Avatar uploaded, CID:', avatarCID)
        } catch (uploadError) {
          console.error('❌ Avatar upload failed:', uploadError)
          // Avatar upload başarısız olsa bile profil oluşturmaya devam et
        }
      }

      await profileService.createProfile({
        displayName: profileData.displayName,
        bio: profileData.bio,
        avatarCID: avatarCID,
        nationality: profileData.nationality
      })

      console.log('✅ Profile created successfully')

      // Profil oluşturulduktan sonra Redux state'ini güncelle
      dispatch(profileCreated())

      // Authentication state'ini yeniden kontrol et
      console.log('🔄 Re-checking authentication state after profile creation...')

    } catch (error) {
      console.error('❌ Error creating profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }


  // Game navigation handlers
  const handleStartGame = () => {
    console.log('🎮 Opening room browser...')
    setCurrentView('rooms')
  }

  const handleBackToHome = () => {
    console.log('🏠 Back to home...')
    setCurrentView('home')
  }

  const handleRoomJoin = (roomId: string) => {
    console.log('🚪 Joining room:', roomId)
    // Bu fonksiyon blockchain service ile room'a katılacak
    // Şimdilik sadece log
  }

  const handleRoomCreate = () => {
    console.log('➕ Opening room creation dialog...')
    // Bu fonksiyon room creation modal'ını açacak
    // Şimdilik sadece log
  }

  // View state yönetimi - sadece authSlice ve currentView'a bak
  type ViewState = 'loading' | 'accountNotFound' | 'profileForm' | 'home' | 'rooms' | 'connectionError';
  const getViewState = (): ViewState => {
    // 1. Bağlantı hatalarını önce kontrol et
    if (!isConnected || (authState.error && authState.error.includes('Wallet'))) {
      return 'connectionError';
    }

    // 2. Yükleme durumu
    if (authState.isLoading) {
      return 'loading';
    }

    // 3. Authenticated durumu ve hesap kontrolü
    if (authState.isAuthenticated) {
      if (authState.userAccount) {
        // Profil kayıtlı mı kontrolü
        if (!authState.userAccount.isRegistered) {
          return 'profileForm';
        }
        // Profil kayıtlıysa mevcut view'e göre dön
        return currentView === 'rooms' ? 'rooms' : 'home';
      }
      // UserAccount yok ama isAuthenticated true ise (beklenmeyen durum)
      return 'loading';
    }

    // 4. Wallet bağlı ama hesap yoksa
    if (walletAddress) {
      return 'accountNotFound';
    }

    // 5. Fallback durumu
    return 'loading';
  };
  const viewState = getViewState();

  // Debug log for render conditions
  console.log('📱 MainLayout render conditions:', {
    viewState,
    authState,
    currentView,
    isConnected,
    walletAddress
  })

  return (
    <Box sx={mainLayoutStyles.mainContainer}>
      {/* 3D Arka Plan - Her zaman görünür */}
      <Scene3D
        key="main-world-scene" // Sabit key ile component'in yeniden mount olmasını engelle
        useTemporary={false}
        modelPath="/assets/models/earth_cartoon.glb"
      />

      {/* Ana İçerik Katmanı */}
      <Box sx={{
        ...mainLayoutStyles.contentLayer,
        ...getContentPadding(isConnected),
      }}>
        {/* Global Loading Overlay - Highest Priority */}
        {viewState === 'loading' && (
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <ModernLoader size={80} color="#fff" />
            </Box>
          </Box>
        )}

        {/* Üst ortada navigation - sadece uygun durumlarda göster */}
        {(viewState === 'home' || viewState === 'rooms') && <TopNavigation />}

        {/* Ana İçerik Alanı */}
        <Box sx={mainLayoutStyles.mainContentArea}>
          {/* Cüzdan bağlı değilse connection overlay göster */}
          {!isConnected && (
            <Box sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1200, // Loader'dan daha yüksek z-index
              backdropFilter: 'blur(5px)'
            }}>
              <WalletConnectionOverlay />
            </Box>
          )}
          {/* Wallet bağlantı hatası */}
          {viewState === 'connectionError' && (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h5" gutterBottom color="error">
                Wallet Connection Error
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Please make sure your wallet is connected and try again.
              </Typography>
              <Button
                variant="contained"
                onClick={() => dispatch(checkAuthStatus())}
                sx={{ mr: 2 }}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </Box>
          )}

          {/* Account bulunamadı - hesap oluşturma overlay'i */}
          {viewState === 'accountNotFound' && (
            <AccountCreationOverlay
              open={true}
              walletAddress={walletAddress || ''}
              onClose={(success = false) => { // onClose'a opsiyonel success parametresi ekleyin
                dispatch(checkUserAccount(walletAddress));
                if (success) {
                  dispatch(checkAuthStatus()); // Sadece başarılıysa kontrol et
                }
              }}
            />
          )}

          {/* Profile Create Form - Profil yoksa göster */}
          {viewState === 'profileForm' && (
            <ProfileCreateForm
              open={true}
              onClose={() => { }}
              onSubmit={handleCreateProfile}
              loading={profileLoading}
            />
          )}

          {/* Kullanıcı tam authenticated VE profili varsa oyun arayüzünü göster */}
          {viewState === 'home' && (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '60vh',
              width: '100%',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              gap: 3,
            }}>
              {/* Modern Game Start Button */}
              <ActionButton
                variant="primary"
                size="large"
                sx={{
                  minWidth: '320px',
                  minHeight: '70px',
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  borderRadius: '35px',
                  textTransform: 'none',
                  boxShadow: '0 12px 40px rgba(99, 102, 241, 0.3)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: '0 20px 60px rgba(99, 102, 241, 0.4)',
                  },
                  '&:active': {
                    transform: 'translateY(-2px) scale(0.98)',
                  }
                }}
                onClick={handleStartGame}
              >
                Browse Game Rooms
              </ActionButton>
            </Box>
          )}

          {/* Room Browser - Oda listesi */}
          {viewState === 'rooms' && (
            <RoomList
              rooms={[]} // Şimdilik boş - blockchain service'den gelecek
              onJoinRoom={handleRoomJoin}
              onCreateRoom={handleRoomCreate}
              onBack={handleBackToHome}
              onRefresh={() => console.log('🔄 Refreshing rooms...')}
              isLoading={false}
              isRefreshing={false}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}
